const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
router.get('/me', authenticate, authCtrl.me);

// Password reset routes
router.post('/forgot-password', authLimiter, authCtrl.forgotPassword);
router.post('/reset-password', authLimiter, authCtrl.resetPassword);
router.post('/change-password', authenticate, authCtrl.changePassword);

// Profile routes
router.put('/profile', authenticate, authCtrl.updateProfile);
router.post('/profile-picture', authenticate, uploadProfilePic.single('profilePicture'), authCtrl.uploadProfilePicture);

module.exports = router;