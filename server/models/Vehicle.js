const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['car', 'bike', 'other'], 
        default: 'car' 
    },
    description: String,
    images: [
        { 
            url: String, 
            public_id: String 
        }
    ],
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
        lat: Number,
        lng: Number
    },
    pricePerHour: { 
        type: Number, 
        required: true 
    },
    available: { 
        type: Boolean, 
        default: true 
    },
    docs: [
        { 
            url: String, 
            public_id:
            String 
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

VehicleSchema.index({ name: 'text', 'location.city': 'text', type: 'text' });

module.exports = mongoose.model('Vehicle', VehicleSchema);