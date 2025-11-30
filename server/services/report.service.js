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
            if (b.status !== 'cancelled') {
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
            }
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
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const writeStream = fs.createWriteStream(filePath);
            
            doc.pipe(writeStream);

            // Professional Header with background
            doc.rect(0, 0, 595, 80).fill('#1e40af');
            doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff')
                .text('MONTHLY REVENUE REPORT', 50, 25, { align: 'center' });
            doc.fontSize(11).font('Helvetica').fillColor('#e0e7ff')
                .text(`${moment(start).format('MMMM YYYY')}`, 50, 52, { align: 'center' });
            
            doc.moveDown(3);

            // Summary Cards Section
            const cardY = 100;
            const cardHeight = 85;
            const cardWidth = 155;
            const cardSpacing = 15;

            // Card 1: Report Period
            doc.roundedRect(50, cardY, cardWidth, cardHeight, 5).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fontSize(9).font('Helvetica').fillColor('#64748b')
                .text('REPORT PERIOD', 60, cardY + 15, { width: cardWidth - 20 });
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
                .text(moment(start).format('MMM DD, YYYY'), 60, cardY + 35, { width: cardWidth - 20 })
                .text('to', 60, cardY + 50, { width: cardWidth - 20, align: 'center' })
                .text(moment(end).format('MMM DD, YYYY'), 60, cardY + 65, { width: cardWidth - 20 });

            // Card 2: Total Bookings
            doc.roundedRect(50 + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, 5).fillAndStroke('#eff6ff', '#bfdbfe');
            doc.fontSize(9).font('Helvetica').fillColor('#1e40af')
                .text('TOTAL BOOKINGS', 60 + cardWidth + cardSpacing, cardY + 15, { width: cardWidth - 20 });
            doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af')
                .text(`${bookings.length}`, 60 + cardWidth + cardSpacing, cardY + 40, { width: cardWidth - 20, align: 'center' });

            // Card 3: Total Revenue
            doc.roundedRect(50 + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 5).fillAndStroke('#f0fdf4', '#bbf7d0');
            doc.fontSize(9).font('Helvetica').fillColor('#15803d')
                .text('TOTAL REVENUE', 60 + (cardWidth + cardSpacing) * 2, cardY + 15, { width: cardWidth - 20 });
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#15803d')
                .text(`₹${totalRevenue.toLocaleString('en-IN')}`, 60 + (cardWidth + cardSpacing) * 2, cardY + 45, { width: cardWidth - 20, align: 'center' });

            doc.moveDown(3.5);

            // Bookings Section Header
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text('Booking Details', 50);
            doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).strokeColor('#cbd5e1').lineWidth(1).stroke();
            doc.moveDown(1);

            if (bookings.length > 0) {
                // Compact Table
                const tableTop = doc.y;
                const col1X = 50;
                const col2X = 135;
                const col3X = 225;
                const col4X = 305;
                const col5X = 410;
                const col6X = 485;
                const rowHeight = 22;

                // Table Header
                doc.rect(col1X, tableTop, 495, 22).fill('#1e40af');
                
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.text('Booking ID', col1X + 5, tableTop + 6, { width: 80 });
                doc.text('Vehicle', col2X + 5, tableTop + 6, { width: 85 });
                doc.text('Customer', col3X + 5, tableTop + 6, { width: 75 });
                doc.text('Date Range', col4X + 5, tableTop + 6, { width: 100 });
                doc.text('Amount', col5X + 5, tableTop + 6, { width: 65, align: 'right' });
                doc.text('Status', col6X + 5, tableTop + 6, { width: 50, align: 'center' });

                let currentY = tableTop + rowHeight;
                let rowIndex = 0;

                bookings.forEach((b) => {
                    // Page break check
                    if (currentY > 680) {
                        doc.addPage();
                        currentY = 50;
                    }

                    // Row background
                    const rowColor = rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff';
                    doc.rect(col1X, currentY, 495, rowHeight).fill(rowColor);

                    doc.fontSize(8).font('Helvetica').fillColor('#334155');
                    
                    // Booking ID
                    const bookingId = String(b._id).substring(0, 8).toUpperCase();
                    doc.text(bookingId, col1X + 5, currentY + 6, { width: 80 });
                    
                    // Vehicle name
                    const vehicleName = (b.vehicle?.name || 'N/A').substring(0, 18);
                    doc.text(vehicleName, col2X + 5, currentY + 6, { width: 85, ellipsis: true });
                    
                    // User name
                    const userName = (b.user?.name || 'N/A').substring(0, 15);
                    doc.text(userName, col3X + 5, currentY + 6, { width: 75, ellipsis: true });
                    
                    // Date Range
                    const startDate = moment(b.startDate).format('DD MMM');
                    const endDate = moment(b.endDate).format('DD MMM');
                    doc.fontSize(7).text(`${startDate} - ${endDate}`, col4X + 5, currentY + 7, { width: 100 });
                    
                    // Amount
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#15803d')
                        .text(`₹${(b.totalAmount || 0).toLocaleString('en-IN')}`, col5X + 5, currentY + 6, { width: 65, align: 'right' });
                    
                    // Status badge
                    const statusColors = {
                        completed: '#15803d',
                        paid: '#1e40af',
                        active: '#0891b2',
                        cancelled: '#dc2626'
                    };
                    doc.fontSize(7).font('Helvetica-Bold').fillColor(statusColors[b.status] || '#6b7280')
                        .text(b.status.toUpperCase(), col6X + 5, currentY + 7, { width: 50, align: 'center' });

                    currentY += rowHeight;
                    rowIndex++;
                });

                doc.moveDown(2);
            } else {
                doc.fontSize(11).font('Helvetica').fillColor('#64748b')
                    .text('No bookings found for the selected period.', { align: 'center' });
                doc.moveDown(2);
            }

            // Vendor Earnings Section Header
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text('Vendor Earnings Summary', 50);
            doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).strokeColor('#cbd5e1').lineWidth(1).stroke();
            doc.moveDown(1);
            
            if (Object.keys(vendorRevenue).length > 0) {
                const vendorTableTop = doc.y;
                const vendorCol1X = 50;
                const vendorCol2X = 170;
                const vendorCol3X = 320;
                const vendorCol4X = 450;
                const vendorRowHeight = 22;

                // Table Header
                doc.rect(vendorCol1X, vendorTableTop, 495, 22).fill('#1e40af');
                
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.text('Vendor Name', vendorCol1X + 5, vendorTableTop + 6, { width: 115 });
                doc.text('Email', vendorCol2X + 5, vendorTableTop + 6, { width: 145 });
                doc.text('Vendor ID', vendorCol3X + 5, vendorTableTop + 6, { width: 125 });
                doc.text('Total Earnings', vendorCol4X + 5, vendorTableTop + 6, { width: 90, align: 'right' });

                let vendorY = vendorTableTop + vendorRowHeight;
                let vendorIndex = 0;

                Object.entries(vendorRevenue).forEach(([vid, vendorData]) => {
                    // Row background
                    const rowColor = vendorIndex % 2 === 0 ? '#f8fafc' : '#ffffff';
                    doc.rect(vendorCol1X, vendorY, 495, vendorRowHeight).fill(rowColor);

                    doc.fontSize(8).font('Helvetica').fillColor('#334155');
                    doc.text(vendorData.name, vendorCol1X + 5, vendorY + 6, { width: 115, ellipsis: true });
                    doc.text(vendorData.email, vendorCol2X + 5, vendorY + 6, { width: 145, ellipsis: true });
                    
                    const shortVid = vid.substring(0, 10).toUpperCase();
                    doc.text(shortVid, vendorCol3X + 5, vendorY + 6, { width: 125 });
                    
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#15803d')
                        .text(`₹${vendorData.earnings.toLocaleString('en-IN')}`, vendorCol4X + 5, vendorY + 6, { width: 90, align: 'right' });

                    vendorY += vendorRowHeight;
                    vendorIndex++;
                });
            } else {
                doc.fontSize(11).font('Helvetica').fillColor('#64748b')
                    .text('No vendor earnings recorded for this period.', { align: 'center' });
            }

            // Footer with generation timestamp
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                
                // Footer line
                doc.moveTo(50, 770).lineTo(545, 770).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
                
                // Footer text
                doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
                    .text(`Generated on ${moment().format('MMM DD, YYYY [at] hh:mm A')}`, 50, 775, { width: 250, align: 'left' })
                    .text(`Page ${i + 1} of ${pageCount}`, 295, 775, { width: 250, align: 'right' });
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