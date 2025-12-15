const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');

exports.registerValidators = [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.register = async (req, res, next) => {
  try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { name, email, password, role, phone } = req.body;
        const exists = await User.findOne({ email });
        
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, passwordHash, role, phone });

        await user.save();

        // Send welcome email
        sendWelcomeEmail(user).catch(err => 
            console.warn('[Email] Error sending welcome email:', err)
        );

        // Generate token for automatic login
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        res.status(201).json({ 
            success: true,
            message: 'Registration successful', 
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture
            } 
        });
    } catch (err) {
        console.error('[Auth] Register error:', err);
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Prevent admin from logging in via standard login
        if (user.role === 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access restricted. Please use the Admin Login page.' 
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );
        
        res.json({ 
            success: true,
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture
            } 
        });
    } catch (err) {
        console.error('[Auth] Login error:', err);
        next(err);
    }
};

exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Only allow admin role
        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );
        
        res.json({ 
            success: true,
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture
            } 
        });
    } catch (err) {
        console.error('[Auth] Admin Login error:', err);
        next(err);
    }
};

exports.me = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// ==================== PASSWORD RESET ====================

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found (security best practice)
            return res.json({ 
                success: true, 
                message: 'If that email exists, a password reset link has been sent' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save token to user (valid for 1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with reset link
        await sendPasswordResetEmail(user, resetToken);

        res.json({ 
            success: true, 
            message: 'Password reset email sent' 
        });
    } catch (err) {
        console.error('[Auth] Forgot password error:', err);
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        // Hash the token from URL to compare with DB
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }

        // Hash new password and update user
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password reset successful. You can now login with your new password.' 
        });
    } catch (err) {
        console.error('[Auth] Reset password error:', err);
        next(err);
    }
};

// Change password (for logged-in users)
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters' 
            });
        }

        const user = await User.findById(req.user._id);

        // Verify current password
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!valid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (err) {
        console.error('[Auth] Change password error:', err);
        next(err);
    }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, location } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        
        // Update location fields if provided
        if (location) {
            if (location.address !== undefined) user.location.address = location.address;
            if (location.city !== undefined) user.location.city = location.city;
            if (location.state !== undefined) user.location.state = location.state;
            if (location.country !== undefined) user.location.country = location.country;
        }

        await user.save();

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture,
                location: user.location
            }
        });
    } catch (err) {
        console.error('[Auth] Update profile error:', err);
        next(err);
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Upload to Cloudinary
        const { uploadWithOptions, remove } = require('../services/storage.service');
        
        // Delete old profile picture from Cloudinary if exists
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
            try {
                // Extract public_id from URL
                const urlParts = user.profilePicture.split('/');
                const publicIdWithExt = urlParts.slice(-2).join('/');
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
                await remove(publicId);
            } catch (deleteErr) {
                console.warn('[Auth] Failed to delete old profile picture:', deleteErr);
            }
        }

        // Upload new profile picture
        const result = await uploadWithOptions(req.file.buffer, {
            folder: 'profiles',
            width: 400,
            height: 400,
            crop: 'fill',
            tags: ['profile', user.role]
        });

        // Store the Cloudinary URL
        user.profilePicture = result.secure_url;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture
        });
    } catch (err) {
        console.error('[Auth] Upload profile picture error:', err);
        next(err);
    }
};
