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
        
        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month are required' });
        }
        
        const yearNum = Number(year);
        const monthNum = Number(month);
        
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Invalid year or month' });
        }
        
        console.log(`Generating report for ${yearNum}-${monthNum}`);
        const { filePath, fileName } = await generateMonthlyReport({ year: yearNum, month: monthNum });
        
        console.log(`Report generated: ${filePath}`);
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to send report' });
                }
            }
        });
    } catch (err) {
        console.error('Download monthly report error:', err);
        next(err);
    }
};
