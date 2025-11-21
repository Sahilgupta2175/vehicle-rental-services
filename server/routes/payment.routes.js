const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// Stripe routes
router.post('/stripe/create-intent', authenticate, paymentLimiter, paymentCtrl.createStripeIntent);
router.post('/stripe/refund', authenticate, allowRoles('admin', 'vendor'), paymentCtrl.createStripeRefund);
router.post('/stripe/attach-payment-method', authenticate, paymentCtrl.attachPaymentMethod);
router.get('/stripe/payment-methods', authenticate, paymentCtrl.listPaymentMethods);
router.delete('/stripe/payment-method/:paymentMethodId', authenticate, paymentCtrl.detachPaymentMethod);

// Note: Stripe webhook route is handled separately in app.js (uses raw body)

// Razorpay routes
router.post('/razorpay/create-order', authenticate, paymentLimiter, paymentCtrl.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, paymentCtrl.verifyRazorpayPayment);
router.post('/razorpay/refund', authenticate, allowRoles('admin', 'vendor'), paymentCtrl.createRazorpayRefund);
router.post('/razorpay/webhook', paymentCtrl.razorpayWebhook);

module.exports = router;