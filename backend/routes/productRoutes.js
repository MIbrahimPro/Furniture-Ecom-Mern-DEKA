const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Theme = require('../models/Theme');
const Category = require('../models/Category');

// GET /api/products/:id
// Returns a single product with full details, including theme & category
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch product and populate theme & category
        const product = await Product.findById(id)
            .populate('theme', 'name description image color')
            .populate('category', 'name description icon image')
            .lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Shape response
        const result = {
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            brand: product.brand,
            color: product.color,
            dimensions: product.dimensions,
            weight: product.weight,
            images: product.images, // array of all image paths
            theme: {
                id: product.theme._id,
                name: product.theme.name,
                description: product.theme.description,
                image: product.theme.image,
                color: product.theme.color,
            },
            category: {
                id: product.category._id,
                name: product.category.name,
                description: product.category.description,
                icon: product.category.icon,
            }
        };

        res.json(result);
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
