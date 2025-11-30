const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.getStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments({ role: 'user' });
        const vendorsCount = await User.countDocuments({ role: 'vendor' });
        const bookingsCount = await Booking.countDocuments();
        
        // Calculate total revenue from paid and completed bookings only (exclude cancelled)
        const revenueData = await Booking.aggregate([
            {
                $match: {
                    status: { $in: ['paid', 'completed'] }
                }
            },
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

exports.getRecentBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('vendor', 'name')
            .populate('vehicle', 'name type');
        
        res.json({ bookings });
    } catch (err) {
        next(err);
    }
};

exports.getRecentTransactions = async (req, res, next) => {
    try {
        // Clean up old pending transactions (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await Transaction.updateMany(
            {
                status: 'pending',
                createdAt: { $lt: oneHourAgo }
            },
            {
                status: 'failed',
                error: 'Transaction timeout - payment not completed',
                updatedAt: new Date()
            }
        );

        // Fetch recent transactions excluding pending ones older than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const transactions = await Transaction.find({
            $or: [
                { status: { $ne: 'pending' } },
                { status: 'pending', createdAt: { $gte: fiveMinutesAgo } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('booking', 'totalAmount');
        
        res.json({ transactions });
    } catch (err) {
        next(err);
    }
};