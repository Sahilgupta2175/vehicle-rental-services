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
});

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', UserSchema);