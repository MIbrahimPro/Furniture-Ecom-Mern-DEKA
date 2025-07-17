// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const { deleteImage } = require('../../middleware/upload');

const User = require('../../models/User');
const Order = require('../../models/Order');

// GET /api/admin/users
// Returns list of all users (id, username, email, role, timestamps)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('_id username email role createdAt updatedAt')
            .lean();

        const formatted = users.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Admin get-users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/users/:id
// Deletes a user + all their orders + all order images
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent any admin from deleting their own account
        if (req.user._id.toString() === userId) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        // 1. Find orders for this user
        const orders = await Order.find({ user: userId }).lean();

        // 2. Delete images from 'orders' folder
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.image) {
                    deleteImage('orders', '', item.image);
                }
            });
        });

        // 3. Remove orders
        await Order.deleteMany({ user: userId });

        // 4. Remove user
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User and related orders/images deleted' });
    } catch (err) {
        console.error('Admin delete-user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/role
// Change a user’s role to 'user' or 'admin'
router.patch('/:id/role', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Prevent any admin from changing their own role
        if (req.user._id.toString() === userId) {
            return res.status(400).json({ message: 'You cannot change your own admin role' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        console.error('Admin change-role error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
