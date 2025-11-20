const { createStripePaymentIntent, createRazorpayOrder, verifyRazorpaySignature, stripe } = require('../services/payment.service');
const Booking = require('../models/Booking');

exports.createStripeIntent = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('vehicle');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const intent = await createStripePaymentIntent({
            amount: booking.totalAmount,
            currency: 'inr',
            metadata: { bookingId: booking._id.toString() }
        });

        booking.payment = booking.payment || {};
        booking.payment.provider = 'stripe';
        booking.payment.providerPaymentId = intent.id;

        await booking.save();

        res.json({ clientSecret: intent.client_secret, intentId: intent.id });
    } catch (err) {
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
            if (bookingId) {
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    booking.payment = booking.payment || {};
                    booking.payment.status = 'paid';
                    booking.payment.providerPaymentId = pi.id;

                    await booking.save();
                }
            }
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

        res.json({ order });
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
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    booking.payment.status = 'paid';
                    booking.payment.providerPaymentId = payload.id;

                    await booking.save();
                }
            }
        }

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};