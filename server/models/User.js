const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true 
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
    isVendorApproved: { 
        type: Boolean,
        default: false 
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    }
});

module.exports = mongoose.model('User', UserSchema);