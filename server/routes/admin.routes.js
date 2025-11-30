const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const adminCtrl = require('../controllers/admin.controller');

router.get('/stats', authenticate, allowRoles('admin'), adminCtrl.getStats);
router.get('/users', authenticate, allowRoles('admin'), adminCtrl.listUsers);
router.get('/bookings/recent', authenticate, allowRoles('admin'), adminCtrl.getRecentBookings);
router.get('/transactions/recent', authenticate, allowRoles('admin'), adminCtrl.getRecentTransactions);
router.post('/vendor/:id/approve', authenticate, allowRoles('admin'), adminCtrl.approveVendor);
router.delete('/vendor/:id/remove', authenticate, allowRoles('admin'), adminCtrl.removeVendor);

module.exports = router;