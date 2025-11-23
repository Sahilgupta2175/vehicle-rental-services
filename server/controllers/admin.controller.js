const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

exports.getStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments({ role: 'user' });
        const vendorsCount = await User.countDocuments({ role: 'vendor' });
        const bookingsCount = await Booking.countDocuments();
        
        // Calculate total revenue from all bookings
        const revenueData = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.json({ usersCount, vendorsCount, bookingsCount, totalRevenue });
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

exports.removeVendor = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        if (user.role !== 'vendor') {
            return res.status(400).json({ error: 'User is not a vendor' });
        }

        // Delete all vehicles owned by this vendor
        await Vehicle.deleteMany({ owner: user._id });

        // Delete the vendor account
        await User.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Vendor and their vehicles removed successfully' });
    } catch (err) {
        next(err);
    }
};