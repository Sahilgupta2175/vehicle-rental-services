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

// Trust proxy - Required when behind Render, Heroku, or other proxies
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet());
app.use(xss());

// CORS configuration - support multiple origins
const normalizeOrigin = (value) => {
    if (!value) return '';

    try {
        return new URL(value).origin.toLowerCase();
    } catch (error) {
        return value.replace(/\/+$/, '').toLowerCase();
    }
};

const configuredOrigins = [
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
]
    .map((origin) => normalizeOrigin((origin || '').trim()))
    .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

const isVercelPreviewOrigin = (origin) => {
    try {
        const { hostname } = new URL(origin);
        return hostname.endsWith('.vercel.app');
    } catch (error) {
        return false;
    }
};

app.use(cors({ 
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const requestOrigin = normalizeOrigin(origin);

        if (allowVercelPreviews && isVercelPreviewOrigin(requestOrigin)) {
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.size === 0 || allowedOrigins.has(requestOrigin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
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

// Root route for platform health checks
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Vehicle Rental Service API is running',
        health: '/api/health'
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
