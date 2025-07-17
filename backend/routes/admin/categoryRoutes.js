const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const { requireAdmin } = require('../../middleware/auth');
const {
    uploadMiddleware,
    deleteImage
} = require('../../middleware/upload');

// GET /api/admin/categories
router.get('/', requireAdmin, async (req, res) => {
    try {
        const cats = await Category.find().lean();
        res.json(cats);
    } catch (err) {
        console.error('Admin GET categories error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/categories
// Expects fields: name, description, and file field 'icon'
router.post(
    '/',
    requireAdmin,
    uploadMiddleware('category'),
    async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'Category icon file is required' });
            }

            const iconPath = `uploads/category/${req.file.filename}`;
            const cat = await Category.create({ name, description, icon: iconPath });
            res.status(201).json(cat);
        } catch (err) {
            console.error('Admin CREATE category error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// PUT /api/admin/categories/:id
// Updates name/description; if file 'icon' provided, replaces icon
router.put(
    '/:id',
    requireAdmin,
    uploadMiddleware('category'),
    async (req, res) => {
        try {
            const cat = await Category.findById(req.params.id);
            if (!cat) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const { name, description } = req.body;
            if (name != null) cat.name = name;
            if (description != null) cat.description = description;

            if (req.file) {
                const oldIcon = cat.icon.split('/').pop();
                deleteImage('category', oldIcon);
                cat.icon = `uploads/category/${req.file.filename}`;
            }

            await cat.save();
            res.json(cat);
        } catch (err) {
            console.error('Admin UPDATE category error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// DELETE /api/admin/categories/:id
// Deletes category, its icon, and all products/images under it
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if (!cat) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // delete icon
        deleteImage('category', cat.icon.split('/').pop());

        // delete products & their images
        const products = await Product.find({ category: cat._id }).lean();
        for (const p of products) {
            p.images.forEach(imgPath => {
                deleteImage('products', imgPath.split('/').pop());
            });
        }
        await Product.deleteMany({ category: cat._id });

        await Category.deleteOne({ _id: cat._id });
        res.json({ message: 'Category, its products & images deleted' });
    } catch (err) {
        console.error('Admin DELETE category error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
