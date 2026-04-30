const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "cancelled", "paid", "completed"],
    default: "approved",
  },
  payment: {
    provider: String, // razorpay
    providerPaymentId: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  pickup: {
    defaultWaitingWindow: {
      type: Number,
      default: 30, // Default 30 minutes waiting window
    },
    userDeclaredLateTime: {
      type: Number,
      default: null, // User's declared late time in minutes
    },
    extensionRequested: {
      type: Boolean,
      default: false, // Has user requested extension
    },
    extensionRequestedAt: {
      type: Date,
      default: null, // When extension was requested
    },
    extensionReason: {
      type: String,
      default: null, // User-provided reason for late pickup extension
    },
    finalWaitingWindow: {
      type: Number,
      default: null, // Calculated final waiting window
    },
    pickedUp: {
      type: Boolean,
      default: false, // Has vehicle been picked up
    },
    pickedUpAt: {
      type: Date,
      default: null, // When vehicle was picked up
    },
    autoCancel: {
      scheduled: {
        type: Boolean,
        default: false, // Is auto-cancel scheduled
      },
      scheduledAt: {
        type: Date,
        default: null, // When auto-cancel is scheduled
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ vehicle: 1, start: 1, end: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ vendor: 1, status: 1 });
BookingSchema.index({ "payment.status": 1 });

module.exports = mongoose.model("Booking", BookingSchema);
