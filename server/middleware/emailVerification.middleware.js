// Middleware to check if user's email is verified
exports.requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    // Skip verification check for admin users
    if (req.user.role === 'admin') {
        return next();
    }

    if (!req.user.emailVerified) {
        return res.status(403).json({ 
            success: false, 
            message: 'Please verify your email address to access this feature',
            requiresVerification: true
        });
    }

    next();
};
