const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// Note: stripe webhook route is handled separately in app.js (uses raw body)
router.post('/stripe/create-intent', authenticate, paymentLimiter, paymentCtrl.createStripeIntent);

// Razorpay routes
router.post('/razorpay/create-order', authenticate, paymentLimiter, paymentCtrl.createRazorpayOrder);
router.post('/razorpay/webhook', paymentCtrl.razorpayWebhook);

module.exports = router;