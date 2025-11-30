const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const bookingCtrl = require('../controllers/booking.controller');

router.post('/', authenticate, allowRoles('user'), bookingCtrl.createBooking);
router.get('/me', authenticate, bookingCtrl.getUserBookings);
router.get('/vendor', authenticate, allowRoles('vendor'), bookingCtrl.getVendorBookings);
router.get('/:id', authenticate, bookingCtrl.getBookingById);
router.post('/:id/cancel', authenticate, allowRoles('user'), bookingCtrl.cancelBooking);
// Vendor action route removed - bookings are auto-approved

module.exports = router;