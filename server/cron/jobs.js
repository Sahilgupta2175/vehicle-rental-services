const cron = require('node-cron');
const Booking = require('../models/Booking');
const moment = require('moment');
const { sendSMS } = require('../services/sms.service');
const { generateMonthlyReport } = require('../services/report.service');

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