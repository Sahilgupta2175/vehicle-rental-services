/**
 * Late Pickup Validation Middleware
 * Handles validation and edge cases for late pickup extension requests
 */

const Booking = require("../models/Booking");

/**
 * Validate late pickup extension request
 */
exports.validateLatePickupExtension = async (req, res, next) => {
  try {
    const { declaredLateTime, extensionReason } = req.body;

    // Check if declaredLateTime is provided
    if (
      declaredLateTime === undefined ||
      declaredLateTime === null ||
      declaredLateTime === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Declared late time is required",
        errorCode: "MISSING_LATE_TIME",
      });
    }

    // Validate that declaredLateTime is a number
    const lateTimeMinutes = parseInt(declaredLateTime, 10);

    if (isNaN(lateTimeMinutes)) {
      return res.status(400).json({
        success: false,
        message: "Declared late time must be a valid number (in minutes)",
        errorCode: "INVALID_NUMBER_FORMAT",
        example: "Please enter a number like 45, 50, 60, etc.",
      });
    }

    // Check if late time is negative
    if (lateTimeMinutes < 0) {
      return res.status(400).json({
        success: false,
        message: "Declared late time cannot be negative",
        errorCode: "NEGATIVE_TIME",
      });
    }

    // Check if late time is less than or equal to 30 minutes
    if (lateTimeMinutes <= 30) {
      return res.status(400).json({
        success: false,
        message:
          "Extension is not needed for delays under 30 minutes. The default waiting window covers you.",
        errorCode: "BELOW_MINIMUM_THRESHOLD",
        info: {
          declaredTime: lateTimeMinutes,
          defaultWindow: 30,
          suggestion:
            "No extension required - you are covered by the default 30-minute waiting window",
        },
      });
    }

    // Check if late time is unreasonably long (e.g., more than 4 hours = 240 minutes)
    if (lateTimeMinutes > 240) {
      return res.status(400).json({
        success: false,
        message:
          "Extension cannot exceed 4 hours (240 minutes). If you need more time, please cancel and rebook.",
        errorCode: "EXCEEDS_MAXIMUM_THRESHOLD",
        info: {
          declaredTime: lateTimeMinutes,
          maxAllowed: 240,
        },
      });
    }

    // Validate reason
    if (
      extensionReason === undefined ||
      extensionReason === null ||
      String(extensionReason).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for late pickup extension",
        errorCode: "MISSING_EXTENSION_REASON",
      });
    }

    const normalizedReason = String(extensionReason).trim();

    if (normalizedReason.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Reason must be at least 5 characters long",
        errorCode: "REASON_TOO_SHORT",
      });
    }

    if (normalizedReason.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Reason cannot exceed 300 characters",
        errorCode: "REASON_TOO_LONG",
      });
    }

    // Attach validated late time to request for controller use
    req.validatedLateTime = lateTimeMinutes;
    req.validatedExtensionReason = normalizedReason;

    next();
  } catch (err) {
    console.error("[Middleware] Late pickup validation error:", err);
    return res.status(500).json({
      success: false,
      message: "Error validating late pickup extension",
      errorCode: "VALIDATION_ERROR",
    });
  }
};

/**
 * Validate booking exists and is eligible for late pickup operations
 */
exports.validateBookingEligibility = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
        errorCode: "MISSING_BOOKING_ID",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errorCode: "BOOKING_NOT_FOUND",
      });
    }

    // Check if user owns this booking
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this booking",
        errorCode: "UNAUTHORIZED_ACCESS",
      });
    }

    // Check if booking is in correct status (must be paid)
    if (booking.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: `This operation can only be performed on paid bookings. Current status: ${booking.status}`,
        errorCode: "INVALID_BOOKING_STATUS",
        currentStatus: booking.status,
      });
    }

    // Attach booking to request for controller use
    req.validatedBooking = booking;

    next();
  } catch (err) {
    console.error("[Middleware] Booking eligibility validation error:", err);
    return res.status(500).json({
      success: false,
      message: "Error validating booking eligibility",
      errorCode: "VALIDATION_ERROR",
    });
  }
};

/**
 * Prevent duplicate extension requests
 */
exports.preventDuplicateExtension = async (req, res, next) => {
  try {
    const booking = req.validatedBooking;

    if (booking.pickup.extensionRequested) {
      return res.status(400).json({
        success: false,
        message:
          "You have already requested an extension for this booking. Only one extension is allowed.",
        errorCode: "DUPLICATE_EXTENSION_REQUEST",
        info: {
          extensionRequestedAt: booking.pickup.extensionRequestedAt,
          declaredLateTime: booking.pickup.userDeclaredLateTime,
          finalWaitingWindow: booking.pickup.finalWaitingWindow,
        },
      });
    }

    next();
  } catch (err) {
    console.error("[Middleware] Duplicate extension prevention error:", err);
    return res.status(500).json({
      success: false,
      message: "Error checking extension status",
      errorCode: "VALIDATION_ERROR",
    });
  }
};

/**
 * Check if booking window has already expired
 */
exports.checkWindowExpiry = async (req, res, next) => {
  try {
    const booking = req.validatedBooking;
    const now = new Date();
    const bookingStartTime = new Date(booking.start);
    const defaultWaitingWindow = booking.pickup.defaultWaitingWindow || 30;
    const finalWaitingWindow =
      booking.pickup.finalWaitingWindow || defaultWaitingWindow;
    const graceperiod = 5;

    // Calculate deadline
    const deadline = new Date(
      bookingStartTime.getTime() +
        (finalWaitingWindow + graceperiod) * 60 * 1000,
    );

    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message:
          "The waiting window has already expired. This booking may have been auto-cancelled.",
        errorCode: "WINDOW_EXPIRED",
        info: {
          bookingStartTime,
          deadline,
          currentTime: now,
          minutesOverdue: Math.floor((now - deadline) / (1000 * 60)),
        },
      });
    }

    // Check if too close to deadline for extension (e.g., less than 5 minutes remaining)
    const minutesRemaining = Math.floor((deadline - now) / (1000 * 60));

    if (req.path.includes("request-extension") && minutesRemaining < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot request extension with less than 5 minutes remaining. Please contact support if you need assistance.",
        errorCode: "TOO_LATE_FOR_EXTENSION",
        info: {
          minutesRemaining,
          deadline,
        },
      });
    }

    next();
  } catch (err) {
    console.error("[Middleware] Window expiry check error:", err);
    return res.status(500).json({
      success: false,
      message: "Error checking window expiry",
      errorCode: "VALIDATION_ERROR",
    });
  }
};

/**
 * Check if vehicle has already been picked up
 */
exports.checkAlreadyPickedUp = async (req, res, next) => {
  try {
    const booking = req.validatedBooking;

    if (booking.pickup.pickedUp) {
      return res.status(400).json({
        success: false,
        message: "Vehicle has already been picked up",
        errorCode: "ALREADY_PICKED_UP",
        info: {
          pickedUpAt: booking.pickup.pickedUpAt,
        },
      });
    }

    next();
  } catch (err) {
    console.error("[Middleware] Pickup check error:", err);
    return res.status(500).json({
      success: false,
      message: "Error checking pickup status",
      errorCode: "VALIDATION_ERROR",
    });
  }
};

/**
 * Sanitize and normalize input
 */
exports.sanitizeInput = (req, res, next) => {
  try {
    // Trim whitespace from string inputs
    if (req.body.bookingId && typeof req.body.bookingId === "string") {
      req.body.bookingId = req.body.bookingId.trim();
    }

    // Convert declaredLateTime to string if it's not already (to handle numeric inputs)
    if (
      req.body.declaredLateTime !== undefined &&
      req.body.declaredLateTime !== null
    ) {
      req.body.declaredLateTime = String(req.body.declaredLateTime).trim();
    }

    if (
      req.body.extensionReason !== undefined &&
      req.body.extensionReason !== null
    ) {
      req.body.extensionReason = String(req.body.extensionReason).trim();
    }

    next();
  } catch (err) {
    console.error("[Middleware] Input sanitization error:", err);
    next(err);
  }
};
