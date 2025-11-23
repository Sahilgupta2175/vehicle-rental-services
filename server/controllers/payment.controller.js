const { createStripePaymentIntent, createRazorpayOrder, verifyRazorpaySignature, stripe, razorpay } = require('../services/payment.service');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

exports.createStripeIntent = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('vehicle');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check if booking belongs to user
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Check if already paid
        if (booking.payment?.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Booking already paid' });
        }

        const intent = await createStripePaymentIntent({
            amount: booking.totalAmount,
            currency: 'inr',
            metadata: { 
                bookingId: booking._id.toString(),
                userId: req.user._id.toString()
            }
        });

        booking.payment = booking.payment || {};
        booking.payment.provider = 'stripe';
        booking.payment.providerPaymentId = intent.id;
        await booking.save();

        // Create pending transaction
        await Transaction.create({
            booking: booking._id,
            user: req.user._id,
            amount: booking.totalAmount,
            type: 'charge',
            provider: 'stripe',
            providerId: intent.id,
            status: 'pending',
            metadata: { intentId: intent.id }
        });

        res.json({ 
            success: true,
            clientSecret: intent.client_secret, 
            intentId: intent.id 
        });
    } catch (err) {
        console.error('[Stripe Intent] Error:', err);
        next(err);
    }
};

// stripe webhook: raw body is required; app.js routes this method with bodyParser.raw
exports.stripeWebhook = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).send('Stripe not configured');
        }
        
        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Stripe webhook signature error', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object;
            const bookingId = pi.metadata?.bookingId;
            const userId = pi.metadata?.userId;
            
            if (bookingId) {
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    booking.payment = booking.payment || {};
                    booking.payment.status = 'paid';
                    booking.payment.providerPaymentId = pi.id;
                    booking.status = 'approved';
                    await booking.save();

                    // Update transaction to completed
                    await Transaction.findOneAndUpdate(
                        { providerId: pi.id, provider: 'stripe' },
                        { status: 'completed', metadata: { paymentIntent: pi } },
                        { new: true }
                    );

                    // Send notifications
                    const user = await User.findById(userId || booking.user);
                    if (user) {
                        const { sendMail } = require('../services/email.service');
                        const { sendSMS } = require('../services/sms.service');
                        
                        sendMail({
                            to: user.email,
                            subject: 'Payment Successful',
                            html: `<h2>Payment Confirmed!</h2><p>Your payment of ₹${booking.totalAmount} has been received. Booking ID: ${booking._id}</p>`
                        }).catch(console.warn);

                        if (user.phone) {
                            sendSMS({
                                to: user.phone,
                                body: `Payment of ₹${booking.totalAmount} received for booking #${booking._id}. Thank you!`
                            }).catch(console.warn);
                        }
                    }

                    // Notify via Socket.IO
                    if (global.io) {
                        global.io.to(`user:${booking.user}`).emit('payment:success', { bookingId, amount: booking.totalAmount });
                    }
                }
            }
        } else if (event.type === 'payment_intent.payment_failed') {
            const pi = event.data.object;
            await Transaction.findOneAndUpdate(
                { providerId: pi.id, provider: 'stripe' },
                { status: 'failed', error: pi.last_payment_error?.message },
                { new: true }
            );
        }

        res.json({ received: true });
    } catch (err) {
        console.error('stripe webhook processing error', err);
        res.status(500).send('Server error');
    }
};

exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const order = await createRazorpayOrder({
            amount: booking.totalAmount,
            receipt: `booking_${booking._id}`,
            notes: { bookingId: booking._id.toString() }
        });

        booking.payment = booking.payment || {};
        booking.payment.provider = 'razorpay';
        booking.payment.providerPaymentId = order.id;

        await booking.save();

        // Create pending transaction
        await Transaction.create({
            booking: booking._id,
            user: req.user._id,
            amount: booking.totalAmount,
            type: 'charge',
            provider: 'razorpay',
            providerId: order.id,
            status: 'pending',
            metadata: { orderId: order.id }
        });

        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

exports.razorpayWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = req.body;
        
        if (!verifyRazorpaySignature(body, signature)) {
            return res.status(400).send('Invalid signature');
        }

        const event = body.event;

        if (event === 'payment.captured') {
            const payload = body.payload.payment.entity;
            const bookingId = payload?.notes?.bookingId;
            if (bookingId) {
                const booking = await Booking.findById(bookingId).populate('user');
                if (booking) {
                    booking.payment.status = 'paid';
                    booking.payment.providerPaymentId = payload.id;
                    booking.status = 'approved';
                    await booking.save();

                    // Update transaction
                    await Transaction.findOneAndUpdate(
                        { booking: bookingId, provider: 'razorpay' },
                        { status: 'completed', providerId: payload.id, metadata: { payment: payload } },
                        { new: true }
                    );

                    // Send notifications
                    const user = await User.findById(booking.user);
                    if (user) {
                        const { sendMail } = require('../services/email.service');
                        const { sendSMS } = require('../services/sms.service');
                        
                        sendMail({
                            to: user.email,
                            subject: 'Payment Successful - Razorpay',
                            html: `<h2>Payment Confirmed!</h2><p>Your payment of ₹${booking.totalAmount} has been received via Razorpay. Booking ID: ${booking._id}</p>`
                        }).catch(console.warn);

                        if (user.phone) {
                            sendSMS({
                                to: user.phone,
                                body: `Payment of ₹${booking.totalAmount} received for booking #${booking._id}. Thank you!`
                            }).catch(console.warn);
                        }
                    }

                    // Notify via Socket.IO
                    if (global.io) {
                        global.io.to(`user:${booking.user}`).emit('payment:success', { bookingId, amount: booking.totalAmount, provider: 'razorpay' });
                    }
                }
            }
        } else if (event === 'payment.failed') {
            const payload = body.payload.payment.entity;
            await Transaction.findOneAndUpdate(
                { providerId: payload.order_id, provider: 'razorpay' },
                { status: 'failed', error: payload.error_description },
                { new: true }
            );
        }

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ==================== REFUND METHODS ====================

exports.createStripeRefund = async (req, res, next) => {
    try {
        const { bookingId, amount, reason } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!booking.payment?.providerPaymentId) {
            return res.status(400).json({ success: false, message: 'No payment found for this booking' });
        }

        const refund = await stripe.refunds.create({
            payment_intent: booking.payment.providerPaymentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
            reason: reason || 'requested_by_customer'
        });

        // Create refund transaction
        await Transaction.create({
            booking: booking._id,
            user: booking.user,
            amount: refund.amount / 100,
            type: 'refund',
            provider: 'stripe',
            providerId: refund.id,
            status: 'completed',
            metadata: { refund, originalPaymentId: booking.payment.providerPaymentId }
        });

        // Update booking status
        booking.status = 'cancelled';
        booking.payment.status = 'refunded';
        await booking.save();

        res.json({ success: true, refund });
    } catch (err) {
        console.error('[Stripe Refund] Error:', err);
        next(err);
    }
};

exports.createRazorpayRefund = async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!booking.payment?.providerPaymentId) {
            return res.status(400).json({ success: false, message: 'No payment found' });
        }

        const refund = await razorpay.payments.refund(booking.payment.providerPaymentId, {
            amount: amount ? Math.round(amount * 100) : undefined, // in paise
            speed: 'normal'
        });

        // Create refund transaction
        await Transaction.create({
            booking: booking._id,
            user: booking.user,
            amount: refund.amount / 100,
            type: 'refund',
            provider: 'razorpay',
            providerId: refund.id,
            status: 'completed',
            metadata: { refund, originalPaymentId: booking.payment.providerPaymentId }
        });

        // Update booking
        booking.status = 'cancelled';
        booking.payment.status = 'refunded';
        await booking.save();

        res.json({ success: true, refund });
    } catch (err) {
        console.error('[Razorpay Refund] Error:', err);
        next(err);
    }
};

// ==================== SAVED CARDS METHODS ====================

exports.attachPaymentMethod = async (req, res, next) => {
    try {
        const { paymentMethodId } = req.body;
        
        // Get or create Stripe customer
        let user = await User.findById(req.user._id);
        
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId,
        });

        // Set as default if it's the first one
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });

        if (paymentMethods.data.length === 1) {
            await stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        res.json({ success: true, message: 'Payment method saved' });
    } catch (err) {
        console.error('[Stripe] Attach payment method error:', err);
        next(err);
    }
};

exports.listPaymentMethods = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.stripeCustomerId) {
            return res.json({ success: true, paymentMethods: [] });
        }

        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });

        res.json({ success: true, paymentMethods: paymentMethods.data });
    } catch (err) {
        console.error('[Stripe] List payment methods error:', err);
        next(err);
    }
};

exports.detachPaymentMethod = async (req, res, next) => {
    try {
        const { paymentMethodId } = req.params;
        
        await stripe.paymentMethods.detach(paymentMethodId);

        res.json({ success: true, message: 'Payment method removed' });
    } catch (err) {
        console.error('[Stripe] Detach payment method error:', err);
        next(err);
    }
};

// ==================== PAYMENT VERIFICATION ====================

exports.verifyRazorpayPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        // Verify signature
        const text = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = require('crypto')
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(text)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Update booking and populate all details
        const booking = await Booking.findById(bookingId).populate(['vehicle', 'user', 'vendor']);
        if (booking) {
            booking.payment = booking.payment || {};
            booking.payment.status = 'paid';
            booking.payment.providerPaymentId = razorpay_payment_id;
            booking.status = 'paid'; // Set status to 'paid'
            await booking.save();

            // Mark vehicle as unavailable during booking period
            await Vehicle.findByIdAndUpdate(booking.vehicle._id, { available: false });

            // Create/update transaction
            await Transaction.findOneAndUpdate(
                { booking: bookingId, provider: 'razorpay' },
                {
                    status: 'completed',
                    providerId: razorpay_payment_id,
                    metadata: { orderId: razorpay_order_id, signature: razorpay_signature }
                },
                { upsert: true, new: true }
            );

            // Send detailed booking confirmation email to user
            const { sendMail } = require('../services/email.service');
            const startDate = new Date(booking.start).toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            const endDate = new Date(booking.end).toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            sendMail({
                to: booking.user.email,
                subject: 'Booking Confirmed - Payment Successful',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                            <h2 style="color: #4CAF50;">🎉 Booking Confirmed!</h2>
                            <p>Dear ${booking.user.name},</p>
                            <p>Your payment has been successfully processed. Here are your booking details:</p>
                            
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Booking Details</h3>
                                <p><strong>Booking ID:</strong> ${booking._id}</p>
                                <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                                <p><strong>Type:</strong> ${booking.vehicle.type}</p>
                                <p><strong>Start:</strong> ${startDate}</p>
                                <p><strong>End:</strong> ${endDate}</p>
                                <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                                <p><strong>Payment Status:</strong> <span style="color: #4CAF50;">PAID</span></p>
                            </div>

                            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h4 style="margin-top: 0;">Vendor Contact</h4>
                                <p><strong>Name:</strong> ${booking.vendor.name}</p>
                                <p><strong>Email:</strong> ${booking.vendor.email}</p>
                                ${booking.vendor.phone ? `<p><strong>Phone:</strong> ${booking.vendor.phone}</p>` : ''}
                            </div>

                            <p style="color: #666;">Please arrive on time and bring a valid ID. Have a great experience!</p>
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                `
            }).catch(console.warn);

            // Send notification to vendor
            sendMail({
                to: booking.vendor.email,
                subject: 'New Booking Received - Payment Confirmed',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                            <h2 style="color: #4CAF50;">💰 Payment Received!</h2>
                            <p>Dear ${booking.vendor.name},</p>
                            <p>You have received a new booking with confirmed payment:</p>
                            
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Booking Details</h3>
                                <p><strong>Booking ID:</strong> ${booking._id}</p>
                                <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                                <p><strong>Customer:</strong> ${booking.user.name}</p>
                                <p><strong>Customer Email:</strong> ${booking.user.email}</p>
                                ${booking.user.phone ? `<p><strong>Customer Phone:</strong> ${booking.user.phone}</p>` : ''}
                                <p><strong>Start:</strong> ${startDate}</p>
                                <p><strong>End:</strong> ${endDate}</p>
                                <p><strong>Amount Received:</strong> ₹${booking.totalAmount}</p>
                            </div>

                            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0;">⚠️ Your vehicle <strong>${booking.vehicle.name}</strong> is now marked as unavailable until the booking ends.</p>
                            </div>

                            <p style="color: #666;">Please ensure the vehicle is ready for pickup at the scheduled time.</p>
                        </div>
                    </div>
                `
            }).catch(console.warn);

            // Notify via Socket.IO
            if (global.io) {
                global.io.to(`user:${String(booking.user._id)}`).emit('payment:success', { 
                    bookingId: booking._id,
                    amount: booking.totalAmount,
                    provider: 'razorpay'
                });
                
                global.io.to(`vendor:${String(booking.vendor._id)}`).emit('booking:paid', {
                    bookingId: booking._id,
                    vehicleName: booking.vehicle.name,
                    amount: booking.totalAmount,
                    customerName: booking.user.name
                });
            }

            res.json({ success: true, message: 'Payment verified', booking });
        } else {
            res.status(404).json({ success: false, message: 'Booking not found' });
        }
    } catch (err) {
        console.error('[Razorpay] Verification error:', err);
        next(err);
    }
};