const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const Transaction = require('../models/Transaction');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');

// Validation rules
const idValidation = [
    param('id').isMongoId().withMessage('Invalid transaction ID')
];

const queryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid status'),
    query('type').optional().isIn(['charge', 'payout', 'refund', 'late_fee', 'deposit']).withMessage('Invalid type'),
    query('provider').optional().isIn(['razorpay', 'cash']).withMessage('Invalid provider')
];

// Get user's own transactions
router.get('/my-transactions', authenticate, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const transactions = await Transaction.find({ user: req.user._id })
            .populate('booking', 'start end vehicle totalAmount status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Transaction.countDocuments({ user: req.user._id });
        
        res.json({ 
            success: true, 
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (err) {
        console.error('[Transaction] Error:', err);
        next(err);
    }
});

// Get transaction by ID
router.get('/:id', authenticate, idValidation, validate, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('booking')
            .populate('user', 'name email phone');
        
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        
        // Check authorization - only admin or transaction owner can view
        if (req.user.role !== 'admin' && transaction.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        res.json({ success: true, transaction });
    } catch (err) {
        console.error('[Transaction] Error:', err);
        next(err);
    }
});

// Get all transactions (admin only)
router.get('/', authenticate, allowRoles('admin'), queryValidation, validate, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, type, provider } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (provider) query.provider = provider;
        
        const transactions = await Transaction.find(query)
            .populate('booking', 'start end totalAmount status')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Transaction.countDocuments(query);
        
        res.json({
            success: true,
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (err) {
        console.error('[Transaction] Error:', err);
        next(err);
    }
});

// Get transaction statistics (admin only)
router.get('/stats/summary', authenticate, allowRoles('admin'), async (req, res, next) => {
    try {
        const stats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const byProvider = await Transaction.aggregate([
            {
                $group: {
                    _id: '$provider',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                byStatus: stats,
                byProvider: byProvider
            }
        });
    } catch (err) {
        console.error('[Transaction Stats] Error:', err);
        next(err);
    }
});

module.exports = router;
