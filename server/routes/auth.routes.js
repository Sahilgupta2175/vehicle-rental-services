const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

// Apply rate limiting to auth routes
router.post('/register', authLimiter, authCtrl.registerValidators, authCtrl.register);
router.post('/login', authLimiter, authCtrl.login);
router.get('/me', authenticate, authCtrl.me);

// Password reset routes
router.post('/forgot-password', authLimiter, authCtrl.forgotPassword);
router.post('/reset-password', authLimiter, authCtrl.resetPassword);
router.post('/change-password', authenticate, authCtrl.changePassword);

module.exports = router;