const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true,
        set: v => v ? v.toLowerCase() : v,
        get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
    },
    type: { 
        type: String, 
        enum: ['car', 'bike', 'scooter', 'other'], 
        default: 'car',
        set: v => v ? v.toLowerCase() : v
    },
    description: String,
    specifications: {
        transmission: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
        fuelType: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
        seating: Number,
        mileage: String,
        year: Number,
        color: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
        registrationNumber: {
            type: String,
            set: v => v ? v.toUpperCase() : v
        }
    },
    images: [
        { 
            url: String, 
            public_id: String 
        }
    ],
    location: {
        address: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : v
        },
        city: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
        state: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
        country: {
            type: String,
            set: v => v ? v.toLowerCase() : v,
            get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
        },
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
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Indexes for faster queries
VehicleSchema.index({ owner: 1 });
VehicleSchema.index({ type: 1, available: 1 });
VehicleSchema.index({ 'location.city': 1 });
VehicleSchema.index({ pricePerHour: 1 });
VehicleSchema.index({ name: 'text', 'location.city': 'text', type: 'text' });

module.exports = mongoose.model('Vehicle', VehicleSchema);