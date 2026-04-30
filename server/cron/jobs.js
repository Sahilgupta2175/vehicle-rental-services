const cron = require("node-cron");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const moment = require("moment");
const { sendSMS } = require("../services/sms.service");
const { generateMonthlyReport } = require("../services/report.service");

// Export function to complete bookings (can be called manually or by cron)
const completeExpiredBookings = async () => {
  try {
    // Find all paid bookings that have ended
    const now = new Date();
    const endedBookings = await Booking.find({
      status: "paid",
      end: { $lt: now },
    }).populate("vehicle");

    for (const booking of endedBookings) {
      // Mark booking as completed
      booking.status = "completed";
      await booking.save();

      // Check if there are any other active bookings for this vehicle
      const activeBookings = await Booking.countDocuments({
        vehicle: booking.vehicle._id,
        status: { $in: ["paid", "approved", "pending"] },
        start: { $lte: now },
        end: { $gte: now },
      });

      // If no active bookings, make vehicle available
      if (activeBookings === 0) {
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
          available: true,
        });
        console.log(`[cron] Vehicle ${booking.vehicle.name} is now available`);
      }

      console.log(`[cron] Completed booking ${booking._id}`);
    }

    if (endedBookings.length > 0) {
      console.log(
        `[cron] Processed ${endedBookings.length} completed bookings`,
      );
    }
  } catch (err) {
    console.error("[cron] complete bookings error", err);
  }
};

// Run every 15 minutes to complete bookings and make vehicles available
cron.schedule("*/15 * * * *", completeExpiredBookings);

// ========== LATE PICKUP AUTO-CANCELLATION ==========

// Export function to handle late pickup auto-cancellation
const handleLatePickupCancellation = async () => {
  try {
    const now = new Date();

    // Find all paid bookings that:
    // 1. Haven't been picked up
    // 2. Have auto-cancel scheduled
    // 3. Auto-cancel time has passed
    const latePickupBookings = await Booking.find({
      status: "paid",
      "pickup.pickedUp": false,
      "pickup.autoCancel.scheduled": true,
      "pickup.autoCancel.scheduledAt": { $lte: now },
    }).populate("vehicle user vendor");

    for (const booking of latePickupBookings) {
      try {
        console.log(
          `[cron] Auto-cancelling late pickup booking ${booking._id}`,
        );

        // Update booking status to cancelled
        booking.status = "cancelled";
        booking.pickup.autoCancel.scheduled = false; // Clear the scheduled flag
        await booking.save();

        // Make vehicle available again
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
          available: true,
        });
        console.log(
          `[cron] Vehicle ${booking.vehicle.name} is now available after late pickup cancellation`,
        );

        // Process refund if payment was made
        if (booking.payment && booking.payment.status === "paid") {
          const Transaction = require("../models/Transaction");
          const { processRefund } = require("../services/payment.service");

          // Find the payment transaction
          const paymentTransaction = await Transaction.findOne({
            booking: booking._id,
            type: "charge",
            status: "completed",
          });

          if (paymentTransaction) {
            // Process refund
            const refundResult = await processRefund({
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
                  refundReason: "Late pickup - auto-cancelled",
                },
              });

              // Update payment transaction status
              paymentTransaction.status = "refunded";
              await paymentTransaction.save();

              // Update booking payment status
              booking.payment.status = "refunded";
              await booking.save();

              console.log(`[cron] Refund processed for booking ${booking._id}`);
            } else {
              console.error(
                `[cron] Refund failed for booking ${booking._id}:`,
                refundResult.error,
              );
            }
          }
        }

        // Send notification email to user
        const { sendMail } = require("../services/email.service");
        const bookingStartTime = new Date(booking.start);
        const finalWaitingWindow =
          booking.pickup.finalWaitingWindow ||
          booking.pickup.defaultWaitingWindow ||
          30;

        sendMail({
          to: booking.user.email,
          subject: "Booking Auto-Cancelled - Late Pickup",
          html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #ff6b6b;">❌ Booking Automatically Cancelled</h2>
                                <p>Dear ${booking.user.name},</p>
                                <p>Your booking has been automatically cancelled due to late pickup.</p>
                                
                                <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
                                    <h3 style="margin-top: 0;">Cancellation Details</h3>
                                    <p><strong>Booking ID:</strong> ${booking._id}</p>
                                    <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                                    <p><strong>Booking Start Time:</strong> ${bookingStartTime.toLocaleString()}</p>
                                    <p><strong>Waiting Window:</strong> ${finalWaitingWindow + 5} minutes (including grace period)</p>
                                    <p><strong>Cancellation Time:</strong> ${now.toLocaleString()}</p>
                                    <p><strong>Reason:</strong> Vehicle not picked up within the extended waiting window</p>
                                </div>

                                ${
                                  booking.payment &&
                                  booking.payment.status === "refunded"
                                    ? `
                                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                                        <h3 style="margin-top: 0; color: #2e7d32;">💰 Refund Information</h3>
                                        <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${booking.totalAmount}</p>
                                        <p style="margin: 10px 0 0 0;"><strong>Refund Status:</strong> <span style="color: #4CAF50;">Initiated</span></p>
                                        <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                                            ⏱️ The refund will be credited to your original payment method within <strong>3-5 working days</strong>.
                                        </p>
                                    </div>
                                `
                                    : ""
                                }

                                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
                                    <p style="margin: 0;">
                                        ℹ️ The vehicle <strong>${booking.vehicle.name}</strong> has been made available for other customers.
                                    </p>
                                </div>

                                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <p style="margin: 0; color: #856404;">
                                        <strong>Need to rebook?</strong> You can create a new booking at any time through our platform.
                                    </p>
                                </div>

                                <p style="margin-top: 20px;">If you have any questions or believe this cancellation was in error, please contact our support team immediately.</p>
                                
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <p style="color: #999; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
                                </div>
                            </div>
                        </div>
                    `,
        }).catch(console.warn);

        // Send notification email to vendor
        sendMail({
          to: booking.vendor.email,
          subject: "Booking Auto-Cancelled - Customer Late Pickup",
          html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #ff9800;">🔔 Booking Auto-Cancelled</h2>
                                <p>Dear ${booking.vendor.name},</p>
                                <p>A booking for your vehicle has been automatically cancelled due to customer late pickup.</p>
                                
                                <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                                    <h3 style="margin-top: 0;">Cancellation Details</h3>
                                    <p><strong>Booking ID:</strong> ${booking._id}</p>
                                    <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                                    <p><strong>Customer:</strong> ${booking.user.name}</p>
                                    <p><strong>Booking Start Time:</strong> ${bookingStartTime.toLocaleString()}</p>
                                    <p><strong>Cancellation Time:</strong> ${now.toLocaleString()}</p>
                                    <p><strong>Reason:</strong> Customer did not pick up vehicle within waiting window</p>
                                </div>

                                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                                    <p style="margin: 0;">
                                        ✅ Your vehicle <strong>${booking.vehicle.name}</strong> is now marked as <strong style="color: #4CAF50;">available</strong> and can be booked by other customers.
                                    </p>
                                </div>

                                ${
                                  booking.payment &&
                                  booking.payment.status === "refunded"
                                    ? `
                                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                        <p style="margin: 0;">
                                            ℹ️ A refund of ₹${booking.totalAmount} has been automatically processed for the customer.
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

        // Send SMS notification to user
        if (booking.user.phone) {
          sendSMS({
            to: booking.user.phone,
            body: `Your booking for ${booking.vehicle.name} has been auto-cancelled due to late pickup. Refund will be processed within 3-5 working days. Booking ID: ${booking._id}`,
          }).catch(console.warn);
        }

        // Socket notification
        if (global.io) {
          global.io
            .to(`user:${String(booking.user._id)}`)
            .emit("booking:auto-cancelled", {
              bookingId: booking._id,
              reason: "late-pickup",
              message: "Booking cancelled due to late pickup",
            });

          global.io
            .to(`vendor:${String(booking.vendor._id)}`)
            .emit("booking:auto-cancelled", {
              bookingId: booking._id,
              vehicleName: booking.vehicle.name,
              customerName: booking.user.name,
              reason: "late-pickup",
            });
        }
      } catch (bookingErr) {
        console.error(
          `[cron] Error processing late pickup booking ${booking._id}:`,
          bookingErr,
        );
      }
    }

    if (latePickupBookings.length > 0) {
      console.log(
        `[cron] Processed ${latePickupBookings.length} late pickup auto-cancellations`,
      );
    }
  } catch (err) {
    console.error("[cron] Late pickup auto-cancellation error:", err);
  }
};

// Run every 2 minutes to check for late pickup auto-cancellations
cron.schedule("*/2 * * * *", handleLatePickupCancellation);

module.exports = { completeExpiredBookings, handleLatePickupCancellation };

cron.schedule("0 2 * * *", async () => {
  // daily at 02:00 - auto cancel pending bookings older than AUTO_CANCEL_HOURS
  try {
    const hours = parseInt(process.env.AUTO_CANCEL_HOURS || "24", 10);
    const cutoff = moment().subtract(hours, "hours").toDate();
    const res = await Booking.updateMany(
      { status: "pending", createdAt: { $lt: cutoff } },
      { status: "cancelled" },
    );
    console.log(`[cron] Auto-cancel result:`, res);
  } catch (err) {
    console.error("[cron] auto-cancel error", err);
  }
});

// hourly reminders for bookings that start in ~24 hours
cron.schedule("0 * * * *", async () => {
  try {
    const startWindow = moment().add(24, "hours").startOf("hour").toDate();
    const endWindow = moment().add(24, "hours").endOf("hour").toDate();
    const bookings = await Booking.find({
      start: { $gte: startWindow, $lte: endWindow },
      status: "approved",
    }).populate("user vehicle");

    for (const b of bookings) {
      if (b.user?.phone) {
        await sendSMS({
          to: b.user.phone,
          body: `Reminder: Your booking for ${b.vehicle?.name || "vehicle"} starts at ${moment(b.start).format("lll")}`,
        }).catch(console.warn);
      }
    }

    console.log(`[cron] Sent reminders for ${bookings.length} bookings`);
  } catch (err) {
    console.error("[cron] reminders error", err);
  }
});

// weekly report (runs Monday 04:00)
cron.schedule("0 4 * * 1", async () => {
  try {
    const prevWeek = moment().subtract(1, "weeks");
    const year = prevWeek.year();
    const month = prevWeek.month() + 1;
    const { filePath } = await generateMonthlyReport({ year, month });
    console.log(`[cron] Generated report ${filePath}`);
    // Optionally: email the report to admin here
  } catch (err) {
    console.error("[cron] weekly report error", err);
  }
});
