const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const adminCtrl = require('../controllers/admin.controller');

router.get('/stats', authenticate, allowRoles('admin'), adminCtrl.getStats);
router.get('/users', authenticate, allowRoles('admin'), adminCtrl.listUsers);
router.post('/vendor/:id/approve', authenticate, allowRoles('admin'), adminCtrl.approveVendor);

module.exports = router;