const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Order = require('../models/Order');

const { requireUser } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me
// Requires a valid JWT; returns the full user profile (excluding password)
router.get('/me', requireUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// ────────────────────────────────────────────────────────────────────────────────
// GET   /api/users/profile
// Returns full user data (minus password) including their orders & addresses
// ────────────────────────────────────────────────────────────────────────────────
router.get('/profile', requireUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // fetch user's orders (you can .lean() or paginate)
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ ...user, orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/phone
// Adds or updates the phone number
// Body: { phone: String }
// ────────────────────────────────────────────────────────────────────────────────
router.patch('/phone', requireUser, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { phone },
            { new: true, select: '-password' }
        ).lean();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// POST   /api/users/addresses
// Adds a new address
// Body: { title, street, city, state, zip, country }
// ────────────────────────────────────────────────────────────────────────────────
router.post('/addresses', requireUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.push(req.body);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// PUT /api/users/addresses/:addrId
// Updates an existing address
// Body: any of { title, street, city, state, zip, country }
// ────────────────────────────────────────────────────────────────────────────────
router.put('/addresses/:addrId', requireUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addr = user.addresses.id(req.params.addrId);
        if (!addr) return res.status(404).json({ message: 'Address not found' });

        Object.assign(addr, req.body);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/addresses/:addrId
// Removes an address
// ────────────────────────────────────────────────────────────────────────────────
router.delete('/addresses/:addrId', requireUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.id(req.params.addrId).remove();
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/password
// Changes password (requires oldPassword & newPassword in body)
// ────────────────────────────────────────────────────────────────────────────────
router.patch('/password', requireUser, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    try {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/orders/:orderId/cancel
// Allows user to cancel their own order only if its status is 'pending'
// ────────────────────────────────────────────────────────────────────────────────
router.patch('/orders/:orderId/cancel', requireUser, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user._id,
            status: 'pending'
        });

        if (!order) {
            return res.status(400).json({ message: 'Order not found or cannot be cancelled' });
        }

        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Order cancelled', orderId: order._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;