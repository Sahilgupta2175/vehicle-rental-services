require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const xss = require('xss-clean');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const reportRoutes = require('./routes/report.routes');
const smsRoutes = require('./routes/sms.routes');
const transactionRoutes = require('./routes/transaction.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const requestLogger = require('./middleware/logger.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// Security middlewares
app.use(helmet());
app.use(xss());
app.use(cors({ 
    origin: process.env.CLIENT_URL || true, 
    credentials: true 
}));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsers for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for local uploads (if used)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
