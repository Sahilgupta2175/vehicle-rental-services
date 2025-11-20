const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    },
    amount: Number,
    type: { 
        type: String, 
        enum: ['charge', 'payout', 'refund'], 
        default: 'charge' 
    },
    provider: String,
    providerId: String,
    status: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);