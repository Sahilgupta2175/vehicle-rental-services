const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const {
  requireEmailVerification,
} = require("../middleware/emailVerification.middleware");
const bookingCtrl = require("../controllers/booking.controller");
const latePickupMiddleware = require("../middleware/latePickup.middleware");

router.post(
  "/",
  authenticate,
  requireEmailVerification,
  allowRoles("user"),
  bookingCtrl.createBooking,
);
router.get(
  "/me",
  authenticate,
  requireEmailVerification,
  bookingCtrl.getUserBookings,
);
router.get(
  "/vendor",
  authenticate,
  requireEmailVerification,
  allowRoles("vendor"),
  bookingCtrl.getVendorBookings,
);
router.get(
  "/:id",
  authenticate,
  requireEmailVerification,
  bookingCtrl.getBookingById,
);
router.post(
  "/:id/cancel",
  authenticate,
  requireEmailVerification,
  allowRoles("user"),
  bookingCtrl.cancelBooking,
);
router.post(
  "/complete-expired",
  authenticate,
  allowRoles("admin", "vendor"),
  bookingCtrl.completeExpiredBookings,
);

// Late Pickup Management Routes (with comprehensive validation)
router.post(
  "/late-pickup/request-extension",
  authenticate,
  requireEmailVerification,
  allowRoles("user"),
  latePickupMiddleware.sanitizeInput,
  latePickupMiddleware.validateBookingEligibility,
  latePickupMiddleware.checkAlreadyPickedUp,
  latePickupMiddleware.preventDuplicateExtension,
  latePickupMiddleware.checkWindowExpiry,
  latePickupMiddleware.validateLatePickupExtension,
  bookingCtrl.requestLatePickupExtension,
);

router.post(
  "/late-pickup/confirm-pickup",
  authenticate,
  requireEmailVerification,
  allowRoles("user"),
  latePickupMiddleware.sanitizeInput,
  latePickupMiddleware.validateBookingEligibility,
  latePickupMiddleware.checkAlreadyPickedUp,
  bookingCtrl.confirmPickup,
);

router.get(
  "/late-pickup/status/:bookingId",
  authenticate,
  requireEmailVerification,
  allowRoles("user"),
  bookingCtrl.getLatePickupStatus,
);

// Vendor action route removed - bookings are auto-approved

module.exports = router;
