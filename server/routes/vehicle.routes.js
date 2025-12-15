const express = require('express');
const router = express.Router();
const vehicleCtrl = require('../controllers/vehicle.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { requireEmailVerification } = require('../middleware/emailVerification.middleware');
const upload = require('../middleware/upload.middleware');

// Optional authentication - allows both authenticated and unauthenticated access
const optionalAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
        return authenticate(req, res, next);
    }
    next();
};

router.get('/', optionalAuth, vehicleCtrl.getVehicles);
router.get('/nearby', vehicleCtrl.getNearbyVehicles);
router.get('/:id', vehicleCtrl.getVehicle);

router.post('/', authenticate, requireEmailVerification, allowRoles('vendor', 'admin'), upload.array('images', 6), vehicleCtrl.createVehicle);
router.put('/:id', authenticate, requireEmailVerification, allowRoles('vendor', 'admin'), upload.array('images', 6), vehicleCtrl.updateVehicle);
router.delete('/:id', authenticate, requireEmailVerification, allowRoles('vendor', 'admin'), vehicleCtrl.deleteVehicle);

module.exports = router;