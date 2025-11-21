const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            user: req.user?._id || 'anonymous'
        };
        
        // Color code based on status
        if (res.statusCode >= 500) {
            console.error('❌ [Request Error]', JSON.stringify(logData));
        } else if (res.statusCode >= 400) {
            console.warn('⚠️  [Request Warning]', JSON.stringify(logData));
        } else {
            console.log('✅ [Request]', JSON.stringify(logData));
        }
    });
    
    next();
};

module.exports = requestLogger;
