const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        set: v => v ? v.toLowerCase() : v,
        get: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v
    },
    email: { 
        type: String,
        required: true, 
        unique: true, 
        lowercase: true 
    },
    passwordHash: { 
        type: String 
    },
    role: { 
        type: String,
        enum: ['user', 'vendor', 'admin'], 
        default: 'user' 
    },
    phone: { 
        type: String 
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isVendorApproved: { 
        type: Boolean,
        default: false 
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
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
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('User', UserSchema);