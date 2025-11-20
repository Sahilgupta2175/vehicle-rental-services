const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const Booking = require('../models/Booking');

async function generateMonthlyReport({ year, month }) {
    const start = moment.utc([year, month - 1, 1]).startOf('month').toDate();
    const end = moment(start).endOf('month').toDate();

    const bookings = await Booking.find({ createdAt: { $gte: start, $lte: end }, 'payment.status': 'paid' }).populate('vehicle user vendor');

    let totalRevenue = 0;
    const vendorRevenue = {};

    bookings.forEach((b) => {
        totalRevenue += b.totalAmount || 0;
        const vid = String(b.vendor);
        vendorRevenue[vid] = (vendorRevenue[vid] || 0) + (b.totalAmount || 0);
    });

    const reportsDir = process.env.REPORTS_PATH || path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const fileName = `monthly-report-${year}-${month}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text('Monthly Revenue Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${moment(start).format('MMM DD, YYYY')} - ${moment(end).format('MMM DD, YYYY')}`);
    doc.text(`Total Bookings: ${bookings.length}`);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(14).text('Bookings:', { underline: true });
    doc.moveDown(0.5);

    bookings.forEach((b) =>
        doc.fontSize(10).text(`Booking ID: ${b._id} | Vehicle: ${b.vehicle?.name || '-'} | User: ${b.user?.name || '-'} | Amount: ₹${b.totalAmount} | Status: ${b.status}`)
    );

    doc.moveDown();
    doc.fontSize(14).text('Vendor Earnings', { underline: true });
    doc.moveDown(0.5);
    Object.entries(vendorRevenue).forEach(([vid, rev]) => doc.fontSize(10).text(`Vendor ${vid} -> ₹${rev.toFixed(2)}`));

    doc.end();

    return { filePath, fileName };
}

module.exports = { generateMonthlyReport };