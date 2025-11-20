const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    vehicle: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    vendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    start: { 
        type: Date, 
        required: true 
    },
    end: { 
        type: Date, 
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    payment: {
        provider: String, // stripe / razorpay
        providerPaymentId: String,
        status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
