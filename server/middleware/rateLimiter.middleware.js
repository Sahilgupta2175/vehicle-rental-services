const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes (reasonable for normal usage)
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for authentication routes
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment route limiter
exports.paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour
    message: {
        success: false,
        message: 'Too many payment attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// SMS rate limiter
exports.smsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 SMS per hour
    message: {
        success: false,
        message: 'Too many SMS requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
