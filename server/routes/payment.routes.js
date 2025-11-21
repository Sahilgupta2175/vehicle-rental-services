const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');

// Note: stripe webhook route is handled separately in app.js (uses raw body)
router.post('/stripe/create-intent', paymentCtrl.createStripeIntent);

// webhook installed in app.js using raw body
router.post('/razorpay/create-order', paymentCtrl.createRazorpayOrder);
router.post('/razorpay/webhook', paymentCtrl.razorpayWebhook);

module.exports = router;
