const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

exports.getStats = async (req, res, next) => {
    try {
        const users = await User.countDocuments();
        const vendors = await User.countDocuments({ role: 'vendor' });
        const vehicles = await Vehicle.countDocuments();
        const bookings = await Booking.countDocuments();

        res.json({ users, vendors, vehicles, bookings });
    } catch (err) {
        next(err);
    }
};

exports.listUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-passwordHash').limit(200);
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.approveVendor = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        user.isVendorApproved = true;

        await user.save();
        
        res.json({ message: 'Vendor approved' });
    } catch (err) {
        next(err);
    }
};