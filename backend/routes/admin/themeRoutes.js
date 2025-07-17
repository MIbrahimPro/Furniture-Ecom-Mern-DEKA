const express = require('express');
const router = express.Router();
const Theme = require('../../models/Theme');
const Product = require('../../models/Product');
const { requireAdmin } = require('../../middleware/auth');
const {
    uploadMiddleware,
    deleteImage
} = require('../../middleware/upload');

// GET /api/admin/themes
router.get('/', requireAdmin, async (req, res) => {
    try {
        const themes = await Theme.find().lean();
        res.json(themes);
    } catch (err) {
        console.error('Admin GET themes error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/themes
// Expects fields: name, description, color, and file field 'theme' containing the image
router.post(
    '/',
    requireAdmin,
    uploadMiddleware('theme'),
    async (req, res) => {
        try {
            const { name, description, color } = req.body;
            if (!name || !color) {
                return res.status(400).json({ message: 'Name & color are required' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'Theme image file is required' });
            }

            const imagePath = `uploads/theme/${req.file.filename}`;
            const theme = await Theme.create({ name, description, color, image: imagePath });
            res.status(201).json(theme);
        } catch (err) {
            console.error('Admin CREATE theme error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// PUT /api/admin/themes/:id
// Updates name/description/color; if file uploaded under 'theme', replaces image
router.put(
    '/:id',
    requireAdmin,
    uploadMiddleware('theme'),
    async (req, res) => {
        try {
            const theme = await Theme.findById(req.params.id);
            if (!theme) {
                return res.status(404).json({ message: 'Theme not found' });
            }

            const { name, description, color } = req.body;
            if (name != null) theme.name = name;
            if (description != null) theme.description = description;
            if (color != null) theme.color = color;

            if (req.file) {
                // delete old
                const oldFile = theme.image.split('/').pop();
                deleteImage('theme', oldFile);
                theme.image = `uploads/theme/${req.file.filename}`;
            }

            await theme.save();
            res.json(theme);
        } catch (err) {
            console.error('Admin UPDATE theme error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// DELETE /api/admin/themes/:id
// Deletes theme, its image, and all products/images under it
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }

        // delete theme image
        deleteImage('theme', theme.image.split('/').pop());

        // delete products & their images
        const products = await Product.find({ theme: theme._id }).lean();
        for (const p of products) {
            p.images.forEach(imgPath => {
                deleteImage('products', imgPath.split('/').pop());
            });
        }
        await Product.deleteMany({ theme: theme._id });

        await Theme.deleteOne({ _id: theme._id });
        res.json({ message: 'Theme, its products & images deleted' });
    } catch (err) {
        console.error('Admin DELETE theme error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
