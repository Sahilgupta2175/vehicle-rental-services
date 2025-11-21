const express = require('express');
const router = express.Router();
const { sendSMSController } = require('../controllers/sms.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { smsLimiter } = require('../middleware/rateLimiter.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');

// Validation for SMS
const smsValidation = [
    body('to')
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Invalid phone number format'),
    body('body')
        .trim()
        .isLength({ min: 1, max: 160 })
        .withMessage('SMS body must be between 1 and 160 characters')
];

// Only admin and vendor can send SMS (prevents abuse and controls costs)
router.post('/send', smsLimiter, authenticate, allowRoles('admin', 'vendor'), smsValidation, validate, sendSMSController);

module.exports = router;