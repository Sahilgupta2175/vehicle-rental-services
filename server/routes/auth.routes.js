const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

const uploadProfilePic = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Apply rate limiting to auth routes
router.post('/register', authLimiter, authCtrl.registerValidators, authCtrl.register);
router.post('/login', authLimiter, authCtrl.login);
router.post('/admin/login', authLimiter, authCtrl.adminLogin);
router.get('/me', authenticate, authCtrl.me);

// Email verification routes
router.post('/verify-email', authCtrl.verifyEmail);
router.post('/resend-verification', authenticate, authCtrl.resendVerification);

// Password reset routes
router.post('/forgot-password', authLimiter, authCtrl.forgotPassword);
router.post('/reset-password', authLimiter, authCtrl.resetPassword);
router.post('/change-password', authenticate, authCtrl.changePassword);

// Profile routes
router.put('/profile', authenticate, authCtrl.updateProfile);
router.post('/profile-picture', authenticate, uploadProfilePic.single('profilePicture'), authCtrl.uploadProfilePicture);

module.exports = router;