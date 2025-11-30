const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendMail, sendBookingConfirmation } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');
const { processRefund } = require('../services/payment.service');

exports.createBooking = async (req, res, next) => {
    try {
        const { vehicleId, start, end } = req.body;
        const user = req.user;
        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (!vehicle.available) {
            return res.status(400).json({ success: false, message: 'Vehicle is not available' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (endDate <= startDate) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        // Check for minimum booking duration (e.g., 1 hour)
        const diffHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
        if (diffHours < 1) {
            return res.status(400).json({ success: false, message: 'Minimum booking duration is 1 hour' });
        }

        // Check if start date is in the past
        if (startDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
        }

        // CHECK FOR OVERLAPPING BOOKINGS (NEW)
        const overlappingBooking = await Booking.findOne({
            vehicle: vehicleId,
            status: { $in: ['approved', 'paid'] },
            $or: [
                // New booking starts during existing booking
                { start: { $lte: startDate }, end: { $gte: startDate } },
                // New booking ends during existing booking
                { start: { $lte: endDate }, end: { $gte: endDate } },
                // New booking completely contains existing booking
                { start: { $gte: startDate }, end: { $lte: endDate } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vehicle is already booked for the selected time period',
                conflictingBooking: {
                    start: overlappingBooking.start,
                    end: overlappingBooking.end
                }
            });
        }

        const totalAmount = diffHours * vehicle.pricePerHour;

        const booking = new Booking({
            vehicle: vehicle._id,
            user: user._id,
            vendor: vehicle.owner,
            start: startDate,
            end: endDate,
            totalAmount,
            status: 'approved' // Auto-approve bookings
        });

        await booking.save();

        // Populate for notifications
        await booking.populate(['vehicle', 'user']);

        // Socket notification
        if (global.io) {
            global.io.to(`vendor:${String(vehicle.owner)}`).emit('booking:new', booking);
        }

        // Send professional email with template
        sendBookingConfirmation(booking, user, vehicle).catch(err => 
            console.warn('[Email] Error sending booking confirmation:', err)
        );
        
        // Send SMS to user
        if (user.phone) {
            sendSMS({ 
                to: user.phone, 
                body: `Booking created for ${vehicle.name}. Start: ${startDate.toLocaleDateString()}. Check your email for details.` 
            }).catch(console.warn);
        }
        
        // Notify vendor
        const vendor = await User.findById(vehicle.owner);
        if (vendor?.phone) {
            sendSMS({ 
                to: vendor.phone, 
                body: `New booking request for ${vehicle.name} from ${user.name}. Check dashboard for details.` 
            }).catch(console.warn);
        }

        res.status(201).json({ 
            success: true, 
            booking,
            message: 'Booking created successfully. Please proceed with payment.' 
        });
    } catch (err) {
        console.error('[Booking] Create error:', err);
        next(err);
    }
};

// Vendor action removed - bookings are auto-approved

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('vehicle user');
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        // Check if user owns this booking
        if (String(booking.user._id) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }

        // Only allow cancellation of approved or paid bookings
        if (!['approved', 'paid'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel booking with status: ${booking.status}` });
        }

        // Check if cancellation is within allowed time window
        // User can cancel from booking date until 30 minutes before rental starts
        const now = new Date();
        const rentalStartTime = new Date(booking.startDate);
        const thirtyMinutesBeforeRental = new Date(rentalStartTime.getTime() - 30 * 60 * 1000);

        if (now >= thirtyMinutesBeforeRental) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot cancel booking within 30 minutes of rental start time' 
            });
        }

        // Process refund if booking was paid
        let refundResult = null;
        const wasPaid = booking.status === 'paid';
        
        if (wasPaid && booking.payment) {
            // Find the payment transaction
            const paymentTransaction = await Transaction.findOne({
                booking: booking._id,
                type: 'charge',
                status: 'completed'
            });

            if (paymentTransaction) {
                // Process refund through payment provider
                refundResult = await processRefund({
                    paymentId: paymentTransaction.providerId,
                    amount: booking.totalPrice,
                    provider: paymentTransaction.provider
                });

                if (refundResult.success) {
                    // Create refund transaction record
                    await Transaction.create({
                        booking: booking._id,
                        user: booking.user._id,
                        amount: booking.totalPrice,
                        type: 'refund',
                        provider: paymentTransaction.provider,
                        providerId: refundResult.refundId,
                        status: 'completed',
                        metadata: {
                            originalTransaction: paymentTransaction._id,
                            refundReason: 'User cancelled booking'
                        }
                    });

                    // Update payment transaction status
                    paymentTransaction.status = 'refunded';
                    await paymentTransaction.save();

                    // Update booking payment status
                    booking.payment.status = 'refunded';
                } else {
                    console.error('[Booking] Refund failed:', refundResult.error);
                    // Still cancel the booking but notify about refund failure
                }
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        // Mark vehicle as available again after cancellation
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { available: true });

        // Notify vendor via socket
        if (global.io) {
            global.io.to(`vendor:${String(booking.vendor)}`).emit('booking:cancelled', booking);
        }

        // Format dates for email
        const startDate = new Date(booking.start).toLocaleString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        const endDate = new Date(booking.end).toLocaleString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // Send detailed cancellation email to user
        const userEmailHtml = refundResult?.success ? `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #ff6b6b;">❌ Booking Cancelled</h2>
                    <p>Dear ${booking.user.name},</p>
                    <p>Your booking has been cancelled successfully. We understand plans change, and we're here to help.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                        <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                        <p><strong>Type:</strong> ${booking.vehicle.type}</p>
                        <p><strong>Original Start Time:</strong> ${startDate}</p>
                        <p><strong>Original End Time:</strong> ${endDate}</p>
                        <p><strong>Booking Amount:</strong> ₹${booking.totalPrice}</p>
                        <p><strong>Status:</strong> <span style="color: #ff6b6b;">CANCELLED</span></p>
                    </div>

                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="margin-top: 0; color: #2e7d32;">💰 Refund Information</h3>
                        <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${booking.totalPrice}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Refund Status:</strong> <span style="color: #4CAF50;">Initiated</span></p>
                        <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                            ⏱️ The refund has been successfully processed and will be credited to your original payment method within <strong>3-5 working days</strong>.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                            Please note: The exact time may vary depending on your bank's processing time. You will receive a confirmation once the amount is credited to your account.
                        </p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404;">
                            <strong>Note:</strong> If you don't receive the refund within 5-7 working days, please contact your bank or reach out to our support team with your booking ID.
                        </p>
                    </div>

                    <p style="margin-top: 20px;">We hope to serve you again in the future. If you have any questions or concerns, please don't hesitate to contact us.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">Need help? Contact our support team</p>
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        ` : `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #ff6b6b;">❌ Booking Cancelled</h2>
                    <p>Dear ${booking.user.name},</p>
                    <p>Your booking has been cancelled successfully.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                        <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                        <p><strong>Type:</strong> ${booking.vehicle.type}</p>
                        <p><strong>Original Start Time:</strong> ${startDate}</p>
                        <p><strong>Original End Time:</strong> ${endDate}</p>
                        <p><strong>Status:</strong> <span style="color: #ff6b6b;">CANCELLED</span></p>
                    </div>

                    ${wasPaid ? `
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <h3 style="margin-top: 0; color: #2e7d32;">💰 Refund Information</h3>
                            <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${booking.totalPrice}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Refund Status:</strong> <span style="color: #ff9800;">Processing</span></p>
                            <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                                ⏱️ Your refund is being processed and will be credited to your original payment method within <strong>3-5 working days</strong>.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                                Please note: The exact time may vary depending on your bank's processing time. You will receive a confirmation once the amount is credited to your account.
                            </p>
                        </div>

                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                <strong>Note:</strong> If you don't receive the refund within 5-7 working days, please contact your bank or reach out to our support team with your booking ID.
                            </p>
                        </div>
                    ` : ''}

                    <p style="margin-top: 20px;">We hope to serve you again in the future. If you have any questions, please contact our support team.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        `;

        sendMail({ 
            to: booking.user.email, 
            subject: refundResult?.success ? 'Booking Cancelled - Refund Initiated' : 'Booking Cancelled',
            html: userEmailHtml
        }).catch(console.warn);

        // Send notification to vendor
        sendMail({
            to: booking.vendor.email,
            subject: 'Booking Cancellation Notice',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #ff6b6b;">🔔 Booking Cancelled</h2>
                        <p>Dear ${booking.vendor.name},</p>
                        <p>A customer has cancelled their booking for your vehicle.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Cancellation Details</h3>
                            <p><strong>Booking ID:</strong> ${booking._id}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                            <p><strong>Customer:</strong> ${booking.user.name}</p>
                            <p><strong>Original Start Time:</strong> ${startDate}</p>
                            <p><strong>Original End Time:</strong> ${endDate}</p>
                            <p><strong>Amount:</strong> ₹${booking.totalPrice}</p>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
                            <p style="margin: 0;">
                                ✅ Your vehicle <strong>${booking.vehicle.name}</strong> is now marked as <strong style="color: #4CAF50;">available</strong> and can be booked by other customers.
                            </p>
                        </div>

                        ${refundResult?.success ? `
                            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0; color: #856404;">
                                    <strong>Note:</strong> A refund of ₹${booking.totalPrice} has been initiated to the customer and will be processed within 3-5 working days.
                                </p>
                            </div>
                        ` : ''}

                        <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            `
        }).catch(console.warn);

        res.json({ 
            success: true, 
            booking, 
            refund: refundResult,
            message: refundResult?.success 
                ? 'Booking cancelled successfully. Refund has been processed.'
                : 'Booking cancelled successfully.' 
        });
    } catch (err) {
        console.error('[Booking] Cancel error:', err);
        next(err);
    }
};

exports.getUserBookings = async (req, res, next) => {
    try {
        // Check and complete any expired bookings before fetching
        const { completeExpiredBookings } = require('../cron/jobs');
        await completeExpiredBookings();
        
        const bookings = await Booking.find({ user: req.user._id }).populate('vehicle');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

exports.getVendorBookings = async (req, res, next) => {
    try {
        // Check and complete any expired bookings before fetching
        const { completeExpiredBookings } = require('../cron/jobs');
        await completeExpiredBookings();
        
        const bookings = await Booking.find({ vendor: req.user._id }).populate('vehicle user');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle')
            .populate('user', 'name email phone')
            .populate('vendor', 'name email phone');
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Only allow the customer who made the booking to access details
        const userId = String(req.user._id);
        const bookingUserId = String(booking.user._id);
        
        if (userId !== bookingUserId) {
            return res.status(403).json({ error: 'Access denied. This page is only accessible to the customer who made the booking.' });
        }

        // Only allow access if payment is completed
        if (booking.payment?.status !== 'paid') {
            return res.status(403).json({ error: 'This page is only accessible after payment completion' });
        }

        res.json(booking);
    } catch (err) {
        next(err);
    }
};

// Complete expired bookings and make vehicles available
exports.completeExpiredBookings = async (req, res, next) => {
    try {
        const { completeExpiredBookings } = require('../cron/jobs');
        await completeExpiredBookings();
        res.json({ success: true, message: 'Expired bookings processed successfully' });
    } catch (err) {
        next(err);
    }
};
