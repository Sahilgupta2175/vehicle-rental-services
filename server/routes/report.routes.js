const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const reportCtrl = require('../controllers/report.controller');

router.get('/stats', authenticate, allowRoles('admin'), reportCtrl.dashboardStats);
router.get('/monthly/:year/:month/download', authenticate, allowRoles('admin'), reportCtrl.downloadMonthlyReport);

module.exports = router;