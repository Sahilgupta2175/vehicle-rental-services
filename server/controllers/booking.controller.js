const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { sendMail, sendBookingConfirmation } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');

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

exports.getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('vehicle');
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

exports.getVendorBookings = async (req, res, next) => {
    try {
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
