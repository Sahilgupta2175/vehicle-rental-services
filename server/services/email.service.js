const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
    }
});

// Base send email function
async function sendMail({ to, subject, text, html }) {
    if (!process.env.SMTP_USER) {
        console.warn('SMTP not configured; skipping email');
        return null;
    }
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html: html || text
    });
    return info;
}

// Email templates
const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px 20px; }
        .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .details-label { font-weight: 600; color: #555; }
        .details-value { color: #333; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .button:hover { background: #5568d3; }
        .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .highlight { background: #fef3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .content { padding: 20px 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Vehicle Rental Service</strong></p>
            <p>© ${new Date().getFullYear()} Vehicle Rental. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.SMTP_USER}</p>
        </div>
    </div>
</body>
</html>
`;

// Booking confirmation email
async function sendBookingConfirmation(booking, user, vehicle) {
    const content = `
        <h2>🎉 Booking Confirmed!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your booking has been successfully confirmed. Here are your booking details:</p>
        
        <div class="details">
            <div class="details-row">
                <span class="details-label">Booking ID:</span>
                <span class="details-value"><strong>#${booking._id.toString().slice(-8).toUpperCase()}</strong></span>
            </div>
            <div class="details-row">
                <span class="details-label">Vehicle:</span>
                <span class="details-value">${vehicle.name}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Start Date:</span>
                <span class="details-value">${new Date(booking.start).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
            </div>
            <div class="details-row">
                <span class="details-label">End Date:</span>
                <span class="details-value">${new Date(booking.end).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Total Amount:</span>
                <span class="details-value"><strong>₹${booking.totalAmount.toLocaleString()}</strong></span>
            </div>
        </div>
        
        <div class="highlight">
            <strong>📍 Important:</strong> Please arrive 15 minutes before your scheduled pickup time. Bring a valid ID and driving license.
        </div>
        
        <p>Have a safe and enjoyable journey!</p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: `Booking Confirmed - ${vehicle.name} #${booking._id.toString().slice(-8).toUpperCase()}`,
        html: emailTemplate('Booking Confirmed', content)
    });
}

// Payment receipt email
async function sendPaymentReceipt(transaction, booking, user, vehicle) {
    const content = `
        <h2>💳 Payment Receipt</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for your payment. Your transaction has been processed successfully.</p>
        
        <div class="details">
            <div class="details-row">
                <span class="details-label">Transaction ID:</span>
                <span class="details-value">${transaction._id}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Date:</span>
                <span class="details-value">${new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Payment Method:</span>
                <span class="details-value">${transaction.provider.toUpperCase()}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Booking ID:</span>
                <span class="details-value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Vehicle:</span>
                <span class="details-value">${vehicle?.name || 'N/A'}</span>
            </div>
            <div class="details-row" style="background: #e8f5e9; padding: 15px; margin-top: 10px;">
                <span class="details-label" style="font-size: 18px;">Amount Paid:</span>
                <span class="details-value" style="font-size: 22px; color: #2e7d32; font-weight: bold;">₹${transaction.amount.toLocaleString()}</span>
            </div>
        </div>
        
        <p style="text-align: center; color: #666; margin-top: 30px;">
            This is an automated receipt. Please keep it for your records.
        </p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: `Payment Receipt - ₹${transaction.amount} Received`,
        html: emailTemplate('Payment Receipt', content)
    });
}

// Booking cancellation email
async function sendCancellationEmail(booking, user, vehicle, reason) {
    const content = `
        <h2>❌ Booking Cancelled</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your booking for <strong>${vehicle.name}</strong> has been cancelled.</p>
        
        <div class="details">
            <div class="details-row">
                <span class="details-label">Booking ID:</span>
                <span class="details-value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Vehicle:</span>
                <span class="details-value">${vehicle.name}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Amount:</span>
                <span class="details-value">₹${booking.totalAmount.toLocaleString()}</span>
            </div>
            ${reason ? `
            <div class="details-row">
                <span class="details-label">Reason:</span>
                <span class="details-value">${reason}</span>
            </div>
            ` : ''}
        </div>
        
        ${booking.payment?.status === 'paid' ? `
        <div class="highlight">
            <strong>💰 Refund:</strong> Your payment will be refunded within 5-7 business days to your original payment method.
        </div>
        ` : ''}
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: `Booking Cancelled - ${vehicle.name}`,
        html: emailTemplate('Booking Cancelled', content)
    });
}

// Password reset email
async function sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const content = `
        <h2>🔐 Password Reset Request</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <div class="highlight">
            <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <p style="color: #999; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            Or copy this link: ${resetUrl}
        </p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: 'Password Reset Request - Vehicle Rental',
        html: emailTemplate('Password Reset', content)
    });
}

// Welcome email
async function sendWelcomeEmail(user) {
    const content = `
        <h2>👋 Welcome to Vehicle Rental!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for registering with us. We're excited to have you on board!</p>
        
        <div class="details">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <p>✓ Browse our wide selection of vehicles</p>
            <p>✓ Book your favorite vehicle in minutes</p>
            <p>✓ Enjoy seamless payment options</p>
            <p>✓ Get 24/7 customer support</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/vehicles" class="button">Browse Vehicles</a>
        </div>
        
        <p>If you have any questions, our support team is here to help!</p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: 'Welcome to Vehicle Rental! 🚗',
        html: emailTemplate('Welcome!', content)
    });
}

// Booking reminder email
async function sendBookingReminder(booking, user, vehicle, hoursUntilStart) {
    const content = `
        <h2>⏰ Booking Reminder</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>This is a friendly reminder that your booking starts in <strong>${hoursUntilStart} hours</strong>.</p>
        
        <div class="details">
            <div class="details-row">
                <span class="details-label">Vehicle:</span>
                <span class="details-value">${vehicle.name}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Start Time:</span>
                <span class="details-value">${new Date(booking.start).toLocaleString()}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Booking ID:</span>
                <span class="details-value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
            </div>
        </div>
        
        <div class="highlight">
            <strong>📋 Checklist:</strong>
            <p style="margin: 10px 0 5px 0;">• Valid driving license</p>
            <p style="margin: 5px 0;">• Government-issued ID</p>
            <p style="margin: 5px 0;">• Arrive 15 minutes early</p>
        </div>
        
        <p>Looking forward to serving you!</p>
    `;
    
    return await sendMail({
        to: user.email,
        subject: `Reminder: Your ${vehicle.name} booking starts in ${hoursUntilStart}h`,
        html: emailTemplate('Booking Reminder', content)
    });
}

module.exports = { 
    sendMail, 
    sendBookingConfirmation,
    sendPaymentReceipt,
    sendCancellationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendBookingReminder
};
