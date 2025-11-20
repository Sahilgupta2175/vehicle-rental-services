const { generateMonthlyReport } = require('../services/report.service');

exports.dashboardStats = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const Vehicle = require('../models/Vehicle');
        const Booking = require('../models/Booking');

        const totalUsers = await User.countDocuments();
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalVehicles = await Vehicle.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const revenueAggregation = await Booking.aggregate([
            { $match: { 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = revenueAggregation[0]?.total || 0;

        res.json({ totalUsers, totalVendors, totalVehicles, totalBookings, revenue });
    } catch (err) {
        next(err);
    }
};

exports.downloadMonthlyReport = async (req, res, next) => {
    try {
        const { year, month } = req.params;
        const { filePath, fileName } = await generateMonthlyReport({ year: Number(year), month: Number(month) });
        
        res.download(filePath, fileName);
    } catch (err) {
        next(err);
    }
};
