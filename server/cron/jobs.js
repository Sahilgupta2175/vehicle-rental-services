const cron = require('node-cron');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const moment = require('moment');
const { sendSMS } = require('../services/sms.service');
const { generateMonthlyReport } = require('../services/report.service');

// Run every hour to complete bookings and make vehicles available
cron.schedule('0 * * * *', async () => {
    try {
        // Find all paid bookings that have ended
        const now = new Date();
        const endedBookings = await Booking.find({
            status: 'paid',
            end: { $lt: now }
        }).populate('vehicle');

        for (const booking of endedBookings) {
            // Mark booking as completed
            booking.status = 'completed';
            await booking.save();

            // Check if there are any other active bookings for this vehicle
            const activeBookings = await Booking.countDocuments({
                vehicle: booking.vehicle._id,
                status: { $in: ['paid', 'approved', 'pending'] },
                start: { $lte: now },
                end: { $gte: now }
            });

            // If no active bookings, make vehicle available
            if (activeBookings === 0) {
                await Vehicle.findByIdAndUpdate(booking.vehicle._id, { available: true });
                console.log(`[cron] Vehicle ${booking.vehicle.name} is now available`);
            }

            console.log(`[cron] Completed booking ${booking._id}`);
        }

        if (endedBookings.length > 0) {
            console.log(`[cron] Processed ${endedBookings.length} completed bookings`);
        }
    } catch (err) {
        console.error('[cron] complete bookings error', err);
    }
});

cron.schedule('0 2 * * *', async () => {
    // daily at 02:00 - auto cancel pending bookings older than AUTO_CANCEL_HOURS
    try {
        const hours = parseInt(process.env.AUTO_CANCEL_HOURS || '24', 10);
        const cutoff = moment().subtract(hours, 'hours').toDate();
        const res = await Booking.updateMany({ status: 'pending', createdAt: { $lt: cutoff } }, { status: 'cancelled' });
        console.log(`[cron] Auto-cancel result:`, res);
    } catch (err) {
        console.error('[cron] auto-cancel error', err);
    }
});

// hourly reminders for bookings that start in ~24 hours
cron.schedule('0 * * * *', async () => {
    try {
        const startWindow = moment().add(24, 'hours').startOf('hour').toDate();
        const endWindow = moment().add(24, 'hours').endOf('hour').toDate();
        const bookings = await Booking.find({ start: { $gte: startWindow, $lte: endWindow }, status: 'approved' }).populate('user vehicle');
        
        for (const b of bookings) {
            if (b.user?.phone) {
                await sendSMS({ to: b.user.phone, body: `Reminder: Your booking for ${b.vehicle?.name || 'vehicle'} starts at ${moment(b.start).format('lll')}` }).catch(console.warn);
            }
        }
        
        console.log(`[cron] Sent reminders for ${bookings.length} bookings`);
    } catch (err) {
        console.error('[cron] reminders error', err);
    }
});

// weekly report (runs Monday 04:00)
cron.schedule('0 4 * * 1', async () => {
    try {
        const prevWeek = moment().subtract(1, 'weeks');
        const year = prevWeek.year();
        const month = prevWeek.month() + 1;
        const { filePath } = await generateMonthlyReport({ year, month });
        console.log(`[cron] Generated report ${filePath}`);
        // Optionally: email the report to admin here
    } catch (err) {
        console.error('[cron] weekly report error', err);
    }
});