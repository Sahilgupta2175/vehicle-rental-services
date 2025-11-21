const express = require('express');
const router = express.Router();
const { sendSMSController } = require('../controllers/sms.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// Only admin and vendor can send SMS (prevents abuse and controls costs)
router.post('/send', authenticate, allowRoles('admin', 'vendor'), sendSMSController);

module.exports = router;