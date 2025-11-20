const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

exports.registerValidators = [
    body('name').isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
];

exports.register = async (req, res, next) => {
  try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { name, email, password, role, phone } = req.body;
        const exists = await User.findOne({ email });
        
        if (exists) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, passwordHash, role, phone });

        await user.save();

        res.status(201).json({ 
            message: 'Registered', 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );
        
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        next(err);
    }
};

exports.me = async (req, res) => {
  res.json(req.user);
};
