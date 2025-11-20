const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { sendMail } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');

exports.createBooking = async (req, res, next) => {
    try {
        const { vehicleId, start, end } = req.body;
        const user = req.user;
        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (endDate <= startDate) {
            return res.status(400).json({ error: 'Invalid dates' });
        }

        const diffHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
        const totalAmount = diffHours * vehicle.pricePerHour;

        const booking = new Booking({
            vehicle: vehicle._id,
            user: user._id,
            vendor: vehicle.owner,
            start: startDate,
            end: endDate,
            totalAmount
        });

        await booking.save();

        // sockets
        if (global.io) {
            global.io.to(`vendor:${String(vehicle.owner)}`).emit('booking:new', booking);
        }

        // emails & sms
        sendMail({ to: user.email, subject: 'Booking created', text: `Your booking request created for ${vehicle.name}` }).catch(console.warn);
        
        if (user.phone) {
            sendSMS({ 
                to: user.phone, 
                body: `Booking created for ${vehicle.name}.` 
            }).catch(console.warn);
        }
        
        const vendor = await User.findById(vehicle.owner);
        
        if (vendor?.phone) {
            sendSMS({ 
                to: vendor.phone, 
                body: `New booking request for ${vehicle.name}` 
            }).catch(console.warn);
        }

        res.status(201).json(booking);
    } catch (err) {
        next(err);
    }
};

exports.vendorAction = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('vehicle user');
        
        if (!booking) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        if (String(booking.vendor) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { action } = req.body; // 'approve' or 'reject'
        
        if (action === 'approve') {
            booking.status = 'approved';
        } 
        else if (action === 'reject') {
            booking.status = 'rejected';
        } 
        else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await booking.save();

        if (global.io) {
            global.io.to(`user:${String(booking.user)}`).emit('booking:update', booking);
            global.io.to(`vendor:${String(booking.vendor)}`).emit('booking:update', booking);
        }

        sendMail({ 
            to: booking.user.email, 
            subject: `Booking ${booking.status}`, 
            text: `Your booking is ${booking.status}` 
        }).catch(console.warn);

        res.json(booking);
    } catch (err) {
        next(err);
    }
};

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
