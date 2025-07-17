const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const { requireAdmin } = require('../../middleware/auth');

// ─── GET ALL ORDERS ────────────────────────────────────────────────────────────
// GET /api/admin/orders
// Returns all orders with user info, items, address, paymentMethod, status, totalPrice, timestamps
router.get('/', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .lean();

        const formatted = orders.map(o => ({
            id: o._id,
            user: o.user,
            items: o.items,           // snapshots
            shippingAddress: o.shippingAddress, // full embedded
            paymentMethod: o.paymentMethod,
            status: o.status,
            totalPrice: o.totalPrice,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Admin GET orders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── DELETE AN ORDER ───────────────────────────────────────────────────────────
// DELETE /api/admin/orders/:id
// Deletes an order (order items’ images are already stored/copied elsewhere)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id).lean();
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted' });
    } catch (err) {
        console.error('Admin DELETE order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── CHANGE ORDER STATUS ───────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/status
// Body: { status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled' }
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json({
            id: order._id,
            status: order.status,
            updatedAt: order.updatedAt
        });
    } catch (err) {
        console.error('Admin UPDATE order-status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
