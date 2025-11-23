const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const Booking = require('../models/Booking');

async function generateMonthlyReport({ year, month }) {
    try {
        const start = moment.utc([year, month - 1, 1]).startOf('month').toDate();
        const end = moment(start).endOf('month').toDate();

        console.log(`Fetching bookings from ${start} to ${end}`);
        const bookings = await Booking.find({ 
            createdAt: { $gte: start, $lte: end }, 
            'payment.status': 'paid' 
        }).populate('vehicle user vendor');

        console.log(`Found ${bookings.length} paid bookings`);

        let totalRevenue = 0;
        const vendorRevenue = {};

        bookings.forEach((b) => {
            totalRevenue += b.totalAmount || 0;
            const vendorId = String(b.vendor?._id || b.vendor);
            if (!vendorRevenue[vendorId]) {
                vendorRevenue[vendorId] = {
                    name: b.vendor?.name || 'Unknown Vendor',
                    email: b.vendor?.email || 'N/A',
                    earnings: 0
                };
            }
            vendorRevenue[vendorId].earnings += (b.totalAmount || 0);
        });

        const reportsDir = process.env.REPORTS_PATH || path.join(process.cwd(), 'reports');

        if (!fs.existsSync(reportsDir)) {
            console.log(`Creating reports directory: ${reportsDir}`);
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const fileName = `monthly-report-${year}-${month}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        console.log(`Generating PDF: ${filePath}`);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const writeStream = fs.createWriteStream(filePath);
            
            doc.pipe(writeStream);

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('Monthly Revenue Report', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').fillColor('#666666')
                .text(`Generated on: ${moment().format('MMMM DD, YYYY hh:mm A')}`, { align: 'center' });
            doc.moveDown(1.5);

            // Summary Section
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Report Summary');
            doc.moveDown(0.5);
            
            const summaryY = doc.y;
            doc.fontSize(10).font('Helvetica')
                .text(`Report Period:`, 70, summaryY)
                .font('Helvetica-Bold').text(`${moment(start).format('MMMM DD, YYYY')} to ${moment(end).format('MMMM DD, YYYY')}`, 180, summaryY);
            
            doc.font('Helvetica').text(`Total Bookings:`, 70, summaryY + 20)
                .font('Helvetica-Bold').text(`${bookings.length}`, 180, summaryY + 20);
            
            doc.font('Helvetica').text(`Total Revenue:`, 70, summaryY + 40)
                .font('Helvetica-Bold').fillColor('#10b981').text(`Rs. ${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 180, summaryY + 40);
            
            doc.moveDown(3);

            // Bookings Section
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Booking Details', 50);
            doc.moveDown(0.5);

            if (bookings.length > 0) {
                // Table Header
                const tableTop = doc.y;
                const col1X = 50;
                const col2X = 140;
                const col3X = 230;
                const col4X = 360;
                const col5X = 480;
                const rowHeight = 25;

                // Header background
                doc.rect(col1X - 5, tableTop - 5, 495, 20).fillAndStroke('#3b82f6', '#3b82f6');
                
                // Header text
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.text('Booking ID', col1X, tableTop, { width: 85, align: 'left' });
                doc.text('Vehicle', col2X, tableTop, { width: 85, align: 'left' });
                doc.text('Customer', col3X, tableTop, { width: 125, align: 'left' });
                doc.text('Amount', col4X, tableTop, { width: 115, align: 'right' });
                doc.text('Status', col5X, tableTop, { width: 60, align: 'center' });

                let currentY = tableTop + rowHeight;
                let rowIndex = 0;

                bookings.forEach((b) => {
                    // Check if we need a new page
                    if (currentY > 720) {
                        doc.addPage();
                        currentY = 50;
                    }

                    // Alternating row colors
                    if (rowIndex % 2 === 0) {
                        doc.rect(col1X - 5, currentY - 7, 495, rowHeight).fill('#f8fafc');
                    }

                    doc.fontSize(8).font('Helvetica').fillColor('#000000');
                    
                    // Booking ID (shortened)
                    const bookingId = String(b._id).substring(0, 12) + '...';
                    doc.text(bookingId, col1X, currentY, { width: 85, align: 'left' });
                    
                    // Vehicle name
                    const vehicleName = b.vehicle?.name || 'N/A';
                    doc.text(vehicleName, col2X, currentY, { width: 85, align: 'left', ellipsis: true });
                    
                    // User name
                    const userName = b.user?.name || 'N/A';
                    doc.text(userName, col3X, currentY, { width: 125, align: 'left', ellipsis: true });
                    
                    // Amount
                    doc.font('Helvetica-Bold').fillColor('#10b981')
                        .text(`Rs. ${(b.totalAmount || 0).toLocaleString('en-IN')}`, col4X, currentY, { width: 115, align: 'right' });
                    
                    // Status
                    const statusColor = b.status === 'completed' ? '#10b981' : b.status === 'active' ? '#3b82f6' : '#f59e0b';
                    doc.font('Helvetica').fillColor(statusColor)
                        .text(b.status.toUpperCase(), col5X, currentY, { width: 60, align: 'center' });

                    currentY += rowHeight;
                    rowIndex++;
                });

                doc.moveDown(2);
            } else {
                doc.fontSize(10).font('Helvetica').fillColor('#666666')
                    .text('No paid bookings were found for the selected period.', { align: 'center' });
                doc.moveDown(2);
            }

            // Vendor Earnings Section
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Vendor Earnings Summary', 50);
            doc.moveDown(0.5);
            
            if (Object.keys(vendorRevenue).length > 0) {
                const vendorTableTop = doc.y;
                const vendorCol1X = 50;
                const vendorCol2X = 180;
                const vendorCol3X = 310;
                const vendorCol4X = 440;
                const vendorRowHeight = 20;

                // Header background
                doc.rect(vendorCol1X - 5, vendorTableTop - 5, 495, 18).fillAndStroke('#3b82f6', '#3b82f6');
                
                // Header text
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.text('Vendor Name', vendorCol1X, vendorTableTop, { width: 125, align: 'left' });
                doc.text('Email', vendorCol2X, vendorTableTop, { width: 125, align: 'left' });
                doc.text('Vendor ID', vendorCol3X, vendorTableTop, { width: 125, align: 'left' });
                doc.text('Total Earnings', vendorCol4X, vendorTableTop, { width: 100, align: 'right' });

                let vendorY = vendorTableTop + vendorRowHeight;
                let vendorIndex = 0;

                Object.entries(vendorRevenue).forEach(([vid, vendorData]) => {
                    // Alternating row colors
                    if (vendorIndex % 2 === 0) {
                        doc.rect(vendorCol1X - 5, vendorY - 5, 495, vendorRowHeight).fill('#f8fafc');
                    }

                    doc.fontSize(8).font('Helvetica').fillColor('#000000');
                    doc.text(vendorData.name, vendorCol1X, vendorY, { width: 125, align: 'left', ellipsis: true });
                    doc.text(vendorData.email, vendorCol2X, vendorY, { width: 125, align: 'left', ellipsis: true });
                    
                    const shortVid = vid.substring(0, 12) + '...';
                    doc.text(shortVid, vendorCol3X, vendorY, { width: 125, align: 'left' });
                    
                    doc.font('Helvetica-Bold').fillColor('#10b981')
                        .text(`Rs. ${vendorData.earnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, vendorCol4X, vendorY, { width: 100, align: 'right' });

                    vendorY += vendorRowHeight;
                    vendorIndex++;
                });
            } else {
                doc.fontSize(10).font('Helvetica').fillColor('#666666')
                    .text('No vendor earnings recorded for this period.', { align: 'center' });
            }

            // Footer
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).font('Helvetica').fillColor('#999999')
                    .text(`Page ${i + 1} of ${pageCount}`, 50, 770, { align: 'center', width: 495 });
            }

            doc.end();

            writeStream.on('finish', () => {
                console.log('PDF generation completed');
                resolve({ filePath, fileName });
            });

            writeStream.on('error', (err) => {
                console.error('PDF write error:', err);
                reject(err);
            });
        });
    } catch (err) {
        console.error('Generate monthly report error:', err);
        throw err;
    }
}

module.exports = { generateMonthlyReport };