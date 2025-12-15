const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { requireEmailVerification } = require('../middleware/emailVerification.middleware');
const bookingCtrl = require('../controllers/booking.controller');

router.post('/', authenticate, requireEmailVerification, allowRoles('user'), bookingCtrl.createBooking);
router.get('/me', authenticate, requireEmailVerification, bookingCtrl.getUserBookings);
router.get('/vendor', authenticate, requireEmailVerification, allowRoles('vendor'), bookingCtrl.getVendorBookings);
router.get('/:id', authenticate, requireEmailVerification, bookingCtrl.getBookingById);
router.post('/:id/cancel', authenticate, requireEmailVerification, allowRoles('user'), bookingCtrl.cancelBooking);
router.post('/complete-expired', authenticate, allowRoles('admin', 'vendor'), bookingCtrl.completeExpiredBookings);
// Vendor action route removed - bookings are auto-approved

module.exports = router;