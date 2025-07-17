// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { copyProductImageToOrder } = require('../middleware/upload');


// POST /api/orders
// Create a new order from product IDs + quantities, a full shipping address payload, and paymentMethod
router.post('/', requireUser, async (req, res) => {
    try {
        const { items, address, paymentMethod } = req.body;

        // Validate
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }
        if (!address
            || !address.street
            || !address.city
            || !address.country
        ) {
            return res.status(400).json({ message: 'Shipping address (street, city, country at minimum) is required' });
        }
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Load all products in the order
        const productIds = items.map(i => i.productId);
        console.log('Product IDs:', productIds);
        const products = await Product.find({ _id: { $in: productIds } }).lean();
        console.log('Found products:', products.length);
        if (products.length !== productIds.length) {
            return res.status(400).json({ message: 'Some products were not found' });
        }

        // Build item snapshots & calculate total price
        let totalPrice = 0;
        const itemSnapshots = items.map(({ productId, quantity }) => {
            const prod = products.find(p => p._id.equals(productId));
            const price = prod.price;
            totalPrice += price * quantity;

            // copy first product image into orders folder
            const imagePath = prod.images[0];               // e.g. "uploads/products/foo.jpg"
            const filename = imagePath.split('/').pop();    // "foo.jpg"
            copyProductImageToOrder(filename);

            return {
                product: prod._id,
                name: prod.name,
                image: `uploads/orders/${filename}`,    // store full path prefixed with 'uploads/orders/'
                quantity: quantity,
                price: price
            };
        });

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: itemSnapshots,
            shippingAddress: address,
            paymentMethod,
            totalPrice
        });

        res.status(201).json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
