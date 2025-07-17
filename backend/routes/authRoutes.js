const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // adjust as needed

// POST /api/auth/signup
// Create a new user and return a JWT + user data (minus password)
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email & password are required' });
        }

        // Check for existing user/email
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res
                .status(409)
                .json({ message: 'Username or email already in use' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashed,
            addresses: [],
            role: 'user'
        });

        // Build JWT payload
        const payload = { id: user._id, username: user.username, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Respond
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
// Validate credentials and return a JWT + user data
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email & password are required' });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Build JWT
        const payload = { id: user._id, username: user.username, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });

        // Respond
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
