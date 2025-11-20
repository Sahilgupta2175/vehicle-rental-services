const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', authCtrl.registerValidators, authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', authenticate, authCtrl.me);

module.exports = router;