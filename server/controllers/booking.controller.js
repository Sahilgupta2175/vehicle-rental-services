const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const {
  sendMail,
  sendBookingConfirmation,
} = require("../services/email.service");
const { sendSMS } = require("../services/sms.service");
const { processRefund } = require("../services/payment.service");

exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, start, end } = req.body;
    const user = req.user;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    if (!vehicle.available) {
      return res
        .status(400)
        .json({ success: false, message: "Vehicle is not available" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    // Check for minimum booking duration (e.g., 1 hour)
    const diffHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
    if (diffHours < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum booking duration is 1 hour",
      });
    }

    // Check if start date is in the past
    if (startDate < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Start date cannot be in the past" });
    }

    // CHECK FOR OVERLAPPING BOOKINGS (NEW)
    const overlappingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ["approved", "paid"] },
      $or: [
        // New booking starts during existing booking
        { start: { $lte: startDate }, end: { $gte: startDate } },
        // New booking ends during existing booking
        { start: { $lte: endDate }, end: { $gte: endDate } },
        // New booking completely contains existing booking
        { start: { $gte: startDate }, end: { $lte: endDate } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already booked for the selected time period",
        conflictingBooking: {
          start: overlappingBooking.start,
          end: overlappingBooking.end,
        },
      });
    }

    const totalAmount = diffHours * vehicle.pricePerHour;

    const booking = new Booking({
      vehicle: vehicle._id,
      user: user._id,
      vendor: vehicle.owner,
      start: startDate,
      end: endDate,
      totalAmount,
      status: "approved", // Auto-approve bookings
    });

    await booking.save();

    // Populate for notifications
    await booking.populate(["vehicle", "user"]);

    // Socket notification
    if (global.io) {
      global.io
        .to(`vendor:${String(vehicle.owner)}`)
        .emit("booking:new", booking);
    }

    // Send professional email with template
    sendBookingConfirmation(booking, user, vehicle).catch((err) =>
      console.warn("[Email] Error sending booking confirmation:", err),
    );

    // Send SMS to user
    if (user.phone) {
      sendSMS({
        to: user.phone,
        body: `Booking created for ${vehicle.name}. Start: ${startDate.toLocaleDateString()}. Check your email for details.`,
      }).catch(console.warn);
    }

    // Notify vendor
    const vendor = await User.findById(vehicle.owner);
    if (vendor?.phone) {
      sendSMS({
        to: vendor.phone,
        body: `New booking request for ${vehicle.name} from ${user.name}. Check dashboard for details.`,
      }).catch(console.warn);
    }

    res.status(201).json({
      success: true,
      booking,
      message: "Booking created successfully. Please proceed with payment.",
    });
  } catch (err) {
    console.error("[Booking] Create error:", err);
    next(err);
  }
};

// Vendor action removed - bookings are auto-approved

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "vehicle user",
    );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user owns this booking
    if (String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Only allow cancellation of approved or paid bookings
    if (!["approved", "paid"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`,
      });
    }

    // Check if cancellation is within allowed time window
    // User can cancel from booking date until 30 minutes before rental starts
    const now = new Date();
    const rentalStartTime = new Date(booking.start);
    const thirtyMinutesBeforeRental = new Date(
      rentalStartTime.getTime() - 30 * 60 * 1000,
    );

    if (now >= thirtyMinutesBeforeRental) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking within 30 minutes of rental start time",
      });
    }

    // Process refund if booking was paid
    let refundResult = null;
    const wasPaid = booking.status === "paid";

    if (wasPaid && booking.payment) {
      // Find the payment transaction
      const paymentTransaction = await Transaction.findOne({
        booking: booking._id,
        type: "charge",
        status: "completed",
      });

      if (paymentTransaction) {
        // Process refund through payment provider
        refundResult = await processRefund({
          paymentId: paymentTransaction.providerId,
          amount: booking.totalAmount,
          provider: paymentTransaction.provider,
        });

        if (refundResult.success) {
          // Create refund transaction record
          await Transaction.create({
            booking: booking._id,
            user: booking.user._id,
            amount: booking.totalAmount,
            type: "refund",
            provider: paymentTransaction.provider,
            providerId: refundResult.refundId,
            status: "completed",
            metadata: {
              originalTransaction: paymentTransaction._id,
              refundReason: "User cancelled booking",
            },
          });

          // Update payment transaction status
          paymentTransaction.status = "refunded";
          await paymentTransaction.save();

          // Update booking payment status
          booking.payment.status = "refunded";
        } else {
          console.error("[Booking] Refund failed:", refundResult.error);
          // Still cancel the booking but notify about refund failure
        }
      }
    }

    booking.status = "cancelled";
    await booking.save();

    // Mark vehicle as available again after cancellation
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { available: true });

    // Notify vendor via socket
    if (global.io) {
      global.io
        .to(`vendor:${String(booking.vendor)}`)
        .emit("booking:cancelled", booking);
    }

    // Format dates for email
    const startDate = new Date(booking.start).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const endDate = new Date(booking.end).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send detailed cancellation email to user
    const userEmailHtml = refundResult?.success
      ? `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #ff6b6b;">❌ Booking Cancelled</h2>
                    <p>Dear ${booking.user.name},</p>
                    <p>Your booking has been cancelled successfully. We understand plans change, and we're here to help.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                        <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                        <p><strong>Type:</strong> ${booking.vehicle.type}</p>
                        <p><strong>Original Start Time:</strong> ${startDate}</p>
                        <p><strong>Original End Time:</strong> ${endDate}</p>
                        <p><strong>Booking Amount:</strong> ₹${booking.totalAmount}</p>
                        <p><strong>Status:</strong> <span style="color: #ff6b6b;">CANCELLED</span></p>
                    </div>

                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="margin-top: 0; color: #2e7d32;">💰 Refund Information</h3>
                        <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${booking.totalAmount}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Refund Status:</strong> <span style="color: #4CAF50;">Initiated</span></p>
                        <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                            ⏱️ The refund has been successfully processed and will be credited to your original payment method within <strong>3-5 working days</strong>.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                            Please note: The exact time may vary depending on your bank's processing time. You will receive a confirmation once the amount is credited to your account.
                        </p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404;">
                            <strong>Note:</strong> If you don't receive the refund within 5-7 working days, please contact your bank or reach out to our support team with your booking ID.
                        </p>
                    </div>

                    <p style="margin-top: 20px;">We hope to serve you again in the future. If you have any questions or concerns, please don't hesitate to contact us.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">Need help? Contact our support team</p>
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        `
      : `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #ff6b6b;">❌ Booking Cancelled</h2>
                    <p>Dear ${booking.user.name},</p>
                    <p>Your booking has been cancelled successfully.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                        <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                        <p><strong>Type:</strong> ${booking.vehicle.type}</p>
                        <p><strong>Original Start Time:</strong> ${startDate}</p>
                        <p><strong>Original End Time:</strong> ${endDate}</p>
                        <p><strong>Status:</strong> <span style="color: #ff6b6b;">CANCELLED</span></p>
                    </div>

                    ${
                      wasPaid
                        ? `
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <h3 style="margin-top: 0; color: #2e7d32;">💰 Refund Information</h3>
                            <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${booking.totalAmount}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Refund Status:</strong> <span style="color: #ff9800;">Processing</span></p>
                            <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                                ⏱️ Your refund is being processed and will be credited to your original payment method within <strong>3-5 working days</strong>.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                                Please note: The exact time may vary depending on your bank's processing time. You will receive a confirmation once the amount is credited to your account.
                            </p>
                        </div>

                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                <strong>Note:</strong> If you don't receive the refund within 5-7 working days, please contact your bank or reach out to our support team with your booking ID.
                            </p>
                        </div>
                    `
                        : ""
                    }

                    <p style="margin-top: 20px;">We hope to serve you again in the future. If you have any questions, please contact our support team.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        `;

    sendMail({
      to: booking.user.email,
      subject: refundResult?.success
        ? "Booking Cancelled - Refund Initiated"
        : "Booking Cancelled",
      html: userEmailHtml,
    }).catch(console.warn);

    // Send notification to vendor
    sendMail({
      to: booking.vendor.email,
      subject: "Booking Cancellation Notice",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #ff6b6b;">🔔 Booking Cancelled</h2>
                        <p>Dear ${booking.vendor.name},</p>
                        <p>A customer has cancelled their booking for your vehicle.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Cancellation Details</h3>
                            <p><strong>Booking ID:</strong> ${booking._id}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                            <p><strong>Customer:</strong> ${booking.user.name}</p>
                            <p><strong>Original Start Time:</strong> ${startDate}</p>
                            <p><strong>Original End Time:</strong> ${endDate}</p>
                            <p><strong>Amount:</strong> ₹${booking.totalAmount}</p>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
                            <p style="margin: 0;">
                                ✅ Your vehicle <strong>${booking.vehicle.name}</strong> is now marked as <strong style="color: #4CAF50;">available</strong> and can be booked by other customers.
                            </p>
                        </div>

                        ${
                          refundResult?.success
                            ? `
                            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0; color: #856404;">
                                    <strong>Note:</strong> A refund of ₹${booking.totalAmount} has been initiated to the customer and will be processed within 3-5 working days.
                                </p>
                            </div>
                        `
                            : ""
                        }

                        <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            `,
    }).catch(console.warn);

    res.json({
      success: true,
      booking,
      refund: refundResult,
      message: refundResult?.success
        ? "Booking cancelled successfully. Refund has been processed."
        : "Booking cancelled successfully.",
    });
  } catch (err) {
    console.error("[Booking] Cancel error:", err);
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    // Check and complete any expired bookings before fetching
    const { completeExpiredBookings } = require("../cron/jobs");
    await completeExpiredBookings();

    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("vehicle");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getVendorBookings = async (req, res, next) => {
  try {
    // Check and complete any expired bookings before fetching
    const { completeExpiredBookings } = require("../cron/jobs");
    await completeExpiredBookings();

    const bookings = await Booking.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .populate("vehicle user");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("user", "name email phone")
      .populate("vendor", "name email phone");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow the customer who made the booking to access details
    const userId = String(req.user._id);
    const bookingUserId = String(booking.user._id);

    if (userId !== bookingUserId) {
      return res.status(403).json({
        error:
          "Access denied. This page is only accessible to the customer who made the booking.",
      });
    }

    // Only allow access if payment is completed
    if (booking.payment?.status !== "paid") {
      return res.status(403).json({
        error: "This page is only accessible after payment completion",
      });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// Complete expired bookings and make vehicles available
exports.completeExpiredBookings = async (req, res, next) => {
  try {
    const { completeExpiredBookings } = require("../cron/jobs");
    await completeExpiredBookings();
    res.json({
      success: true,
      message: "Expired bookings processed successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ========== LATE PICKUP MANAGEMENT SYSTEM ==========

/**
 * Request late pickup extension
 * User can request extension if they expect to be late more than 45 minutes
 */
exports.requestLatePickupExtension = async (req, res, next) => {
  try {
    const { bookingId, declaredLateTime } = req.body;
    const extensionReason =
      req.validatedExtensionReason ||
      (req.body.extensionReason ? String(req.body.extensionReason).trim() : "");

    // Validate input
    if (!bookingId || !declaredLateTime) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and declared late time are required",
      });
    }

    // Validate that declaredLateTime is a number
    const lateTimeMinutes = parseInt(declaredLateTime, 10);
    if (isNaN(lateTimeMinutes)) {
      return res.status(400).json({
        success: false,
        message: "Declared late time must be a valid number",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate(
      "vehicle user vendor",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this booking",
      });
    }

    // Only allow for paid bookings that haven't been picked up
    if (booking.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Extension can only be requested for paid bookings",
      });
    }

    if (booking.pickup.pickedUp) {
      return res.status(400).json({
        success: false,
        message: "Vehicle has already been picked up",
      });
    }

    // Check if extension has already been requested (only one extension allowed)
    if (booking.pickup.extensionRequested) {
      return res.status(400).json({
        success: false,
        message:
          "You have already requested a pickup extension. Only one extension is allowed per booking.",
      });
    }

    // Validate that declared late time is greater than 30 minutes
    if (lateTimeMinutes <= 30) {
      return res.status(400).json({
        success: false,
        message:
          "Extension is only needed if you will be late more than 30 minutes. For delays under 30 minutes, you are covered by the default waiting window.",
      });
    }

    // Check if booking has already expired
    const now = new Date();
    const bookingStartTime = new Date(booking.start);
    const defaultWaitingWindow = booking.pickup.defaultWaitingWindow || 30;
    const defaultExpiryTime = new Date(
      bookingStartTime.getTime() + defaultWaitingWindow * 60 * 1000,
    );

    if (now > defaultExpiryTime) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot request extension after the default waiting window has expired. Please contact support.",
      });
    }

    // Calculate final waiting window
    // Additional time = User declared time - Default window
    // Final waiting window = Default window + Additional time = User declared time
    const finalWaitingWindow = lateTimeMinutes;

    // Calculate when auto-cancel should be scheduled (final window + 5 minute grace period)
    const autoCancelTime = new Date(
      bookingStartTime.getTime() + (finalWaitingWindow + 5) * 60 * 1000,
    );

    // Update booking with extension details
    booking.pickup.userDeclaredLateTime = lateTimeMinutes;
    booking.pickup.extensionRequested = true;
    booking.pickup.extensionRequestedAt = now;
    booking.pickup.finalWaitingWindow = finalWaitingWindow;
    booking.pickup.extensionReason = extensionReason;
    booking.pickup.autoCancel.scheduled = true;
    booking.pickup.autoCancel.scheduledAt = autoCancelTime;

    await booking.save();

    // Send notifications
    // Email to user
    sendMail({
      to: booking.user.email,
      subject: "Late Pickup Extension Approved",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #4CAF50;">✅ Late Pickup Extension Approved</h2>
                        <p>Dear ${booking.user.name},</p>
                        <p>Your late pickup extension request has been approved.</p>
                        
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <h3 style="margin-top: 0;">Extension Details</h3>
                            <p><strong>Booking ID:</strong> ${booking._id}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                            <p><strong>Original Start Time:</strong> ${bookingStartTime.toLocaleString()}</p>
                            <p><strong>Default Waiting Window:</strong> ${defaultWaitingWindow} minutes</p>
                            <p><strong>Your Declared Late Time:</strong> ${lateTimeMinutes} minutes</p>
                            <p><strong>Your Reason:</strong> ${extensionReason}</p>
                            <p><strong>Extended Waiting Window:</strong> ${finalWaitingWindow} minutes</p>
                            <p><strong>Grace Period:</strong> 5 minutes (after extended window)</p>
                        </div>

                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                <strong>⚠️ Important:</strong> You must pick up the vehicle within <strong>${finalWaitingWindow + 5} minutes</strong> from the booking start time. 
                                After this period, your booking will be automatically cancelled and the vehicle will be made available to other users.
                            </p>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0;">
                                📅 <strong>Pick up by:</strong> ${autoCancelTime.toLocaleString()}
                            </p>
                        </div>

                        <p style="margin-top: 20px;">Please ensure you arrive on time. Safe travels!</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            `,
    }).catch(console.warn);

    // Notify vendor
    sendMail({
      to: booking.vendor.email,
      subject: "Customer Late Pickup Extension Request",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #ff9800;">⏰ Late Pickup Extension Notice</h2>
                        <p>Dear ${booking.vendor.name},</p>
                        <p>A customer has requested a late pickup extension for their booking.</p>
                        
                        <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                            <h3 style="margin-top: 0;">Booking Details</h3>
                            <p><strong>Booking ID:</strong> ${booking._id}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                            <p><strong>Customer:</strong> ${booking.user.name}</p>
                            <p><strong>Original Start Time:</strong> ${bookingStartTime.toLocaleString()}</p>
                            <p><strong>Declared Late Time:</strong> ${lateTimeMinutes} minutes</p>
                            <p><strong>Customer Reason:</strong> ${extensionReason}</p>
                            <p><strong>New Pickup Deadline:</strong> ${autoCancelTime.toLocaleString()}</p>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0;">
                                ℹ️ The system will automatically handle the extended waiting period. If the customer doesn't pick up by the deadline, the booking will be auto-cancelled.
                            </p>
                        </div>

                        <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            `,
    }).catch(console.warn);

    // SMS notification to user
    if (booking.user.phone) {
      sendSMS({
        to: booking.user.phone,
        body: `Late pickup extension approved! Reason noted: ${extensionReason}. Please pick up ${booking.vehicle.name} within ${finalWaitingWindow + 5} minutes from booking start time (by ${autoCancelTime.toLocaleTimeString()}). Auto-cancel after that.`,
      }).catch(console.warn);
    }

    // Socket notification
    if (global.io) {
      global.io
        .to(`user:${String(booking.user._id)}`)
        .emit("pickup:extension-approved", {
          bookingId: booking._id,
          finalWaitingWindow,
          autoCancelTime,
          extensionReason,
        });

      global.io
        .to(`vendor:${String(booking.vendor)}`)
        .emit("pickup:extension-requested", {
          bookingId: booking._id,
          customerName: booking.user.name,
          lateTimeMinutes,
          autoCancelTime,
          extensionReason,
        });
    }

    res.json({
      success: true,
      message: "Late pickup extension approved",
      data: {
        finalWaitingWindow,
        autoCancelTime,
        graceperiod: 5,
        extensionReason,
      },
    });
  } catch (err) {
    console.error("[Booking] Late pickup extension error:", err);
    next(err);
  }
};

/**
 * Confirm vehicle pickup
 * User confirms they have picked up the vehicle
 */
exports.confirmPickup = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate("vehicle user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to confirm pickup for this booking",
      });
    }

    // Only allow for paid bookings
    if (booking.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Pickup can only be confirmed for paid bookings",
      });
    }

    // Check if already picked up
    if (booking.pickup.pickedUp) {
      return res.status(400).json({
        success: false,
        message: "Vehicle has already been picked up",
      });
    }

    // Update booking
    const now = new Date();
    booking.pickup.pickedUp = true;
    booking.pickup.pickedUpAt = now;

    // Clear auto-cancel since vehicle is picked up
    booking.pickup.autoCancel.scheduled = false;
    booking.pickup.autoCancel.scheduledAt = null;

    await booking.save();

    // Send confirmation email
    sendMail({
      to: booking.user.email,
      subject: "Vehicle Pickup Confirmed",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #4CAF50;">🎉 Vehicle Pickup Confirmed!</h2>
                        <p>Dear ${booking.user.name},</p>
                        <p>Your vehicle pickup has been confirmed successfully!</p>
                        
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <h3 style="margin-top: 0;">Pickup Details</h3>
                            <p><strong>Booking ID:</strong> ${booking._id}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                            <p><strong>Picked Up At:</strong> ${now.toLocaleString()}</p>
                            <p><strong>Rental End Time:</strong> ${new Date(booking.end).toLocaleString()}</p>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
                            <p style="margin: 0;">
                                🚗 <strong>Enjoy your ride!</strong> Please return the vehicle by the scheduled end time to avoid additional charges.
                            </p>
                        </div>

                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404;">
                                <strong>⚠️ Remember:</strong> Inspect the vehicle before driving. Report any issues immediately to avoid liability.
                            </p>
                        </div>

                        <p style="margin-top: 20px;">Have a safe journey!</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            `,
    }).catch(console.warn);

    // SMS notification
    if (booking.user.phone) {
      sendSMS({
        to: booking.user.phone,
        body: `Vehicle pickup confirmed for ${booking.vehicle.name}! Return by ${new Date(booking.end).toLocaleString()}. Enjoy your ride!`,
      }).catch(console.warn);
    }

    // Socket notification
    if (global.io) {
      global.io
        .to(`user:${String(booking.user._id)}`)
        .emit("pickup:confirmed", {
          bookingId: booking._id,
          pickedUpAt: now,
        });
    }

    res.json({
      success: true,
      message: "Vehicle pickup confirmed successfully",
      data: {
        pickedUpAt: now,
        rentalEndTime: booking.end,
      },
    });
  } catch (err) {
    console.error("[Booking] Confirm pickup error:", err);
    next(err);
  }
};

/**
 * Check late pickup status
 * Get the current status of late pickup handling for a booking
 */
exports.getLatePickupStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    const now = new Date();
    const bookingStartTime = new Date(booking.start);
    const defaultWaitingWindow = booking.pickup.defaultWaitingWindow || 30;
    const finalWaitingWindow =
      booking.pickup.finalWaitingWindow || defaultWaitingWindow;
    const graceperiod = 5;

    // Calculate time remaining
    const pickupDeadline = new Date(
      bookingStartTime.getTime() +
        (finalWaitingWindow + graceperiod) * 60 * 1000,
    );
    const timeRemainingMs = pickupDeadline - now;
    const timeRemainingMinutes = Math.max(
      0,
      Math.floor(timeRemainingMs / (1000 * 60)),
    );

    const status = {
      bookingId: booking._id,
      vehicleName: booking.vehicle.name,
      bookingStartTime,
      pickedUp: booking.pickup.pickedUp,
      pickedUpAt: booking.pickup.pickedUpAt,
      extensionRequested: booking.pickup.extensionRequested,
      extensionRequestedAt: booking.pickup.extensionRequestedAt,
      extensionReason: booking.pickup.extensionReason,
      declaredLateTime: booking.pickup.userDeclaredLateTime,
      defaultWaitingWindow,
      finalWaitingWindow,
      graceperiod,
      pickupDeadline,
      timeRemainingMinutes,
      canRequestExtension:
        !booking.pickup.extensionRequested &&
        !booking.pickup.pickedUp &&
        booking.status === "paid" &&
        now <= pickupDeadline,
      isExpired: now > pickupDeadline && !booking.pickup.pickedUp,
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    console.error("[Booking] Get late pickup status error:", err);
    next(err);
  }
};
