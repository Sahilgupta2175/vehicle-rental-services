const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// Razorpay routes
router.post('/razorpay/create-order', authenticate, paymentLimiter, paymentCtrl.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, paymentCtrl.verifyRazorpayPayment);
router.post('/razorpay/refund', authenticate, allowRoles('admin', 'vendor'), paymentCtrl.createRazorpayRefund);
router.post('/razorpay/webhook', paymentCtrl.razorpayWebhook);

module.exports = router;