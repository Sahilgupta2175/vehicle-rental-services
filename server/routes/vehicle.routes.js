const express = require('express');
const router = express.Router();
const vehicleCtrl = require('../controllers/vehicle.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', vehicleCtrl.getVehicles);
router.get('/:id', vehicleCtrl.getVehicle);

router.post('/', authenticate, allowRoles('vendor', 'admin'), upload.array('images', 6), vehicleCtrl.createVehicle);
router.put('/:id', authenticate, allowRoles('vendor', 'admin'), upload.array('images', 6), vehicleCtrl.updateVehicle);
router.delete('/:id', authenticate, allowRoles('vendor', 'admin'), vehicleCtrl.deleteVehicle);

module.exports = router;