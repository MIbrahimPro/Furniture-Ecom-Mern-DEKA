const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const Category = require('../models/Category');
const Product = require('../models/Product');

// 1) GET /api/menu/themes
//    Returns a slim list of all themes: { id, name, color }
router.get('/themes', async (req, res) => {
    try {
        const themes = await Theme.find()
            .select('_id name color')
            .lean();

        res.json(
            themes.map(t => ({
                id: t._id,
                name: t.name,
                color: t.color,
            }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2) GET /api/menu/categories
//    Returns a slim list of all categories: { id, name, icon }
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.find()
            .select('_id name icon')
            .lean();

        res.json(
            cats.map(c => ({
                id: c._id,
                name: c.name,
                icon: c.icon,
            }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3) GET /api/menu
//    Main menu endpoint with optional ?themeId=&categoryId=&search=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const {
            themeId,
            categoryId,
            search = '',
            page = 1,
            limit = 12
        } = req.query;

        const pageNum = Math.max(parseInt(page), 1);
        const perPage = Math.max(parseInt(limit), 1);
        const skip = (pageNum - 1) * perPage;

        // Build filter
        const filter = {};
        if (themeId) filter.theme = themeId;
        if (categoryId) filter.category = categoryId;
        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { name: regex },
                { description: regex }
            ];
        }

        // Count total matching
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / perPage);

        // Fetch paginated products
        const products = await Product.find(filter)
            .select('_id name price images description')
            .skip(skip)
            .limit(perPage)
            .lean();

        // Map to desired shape
        const data = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            image: p.images[0] || null
        }));

        // If themeId/categoryId provided, fetch their full data
        let theme = null, category = null;
        if (themeId) {
            const t = await Theme.findById(themeId).lean();
            if (t) {
                theme = {
                    id: t._id,
                    name: t.name,
                    description: t.description,
                    image: t.image,
                    color: t.color
                };
            }
        }
        if (categoryId) {
            const c = await Category.findById(categoryId).lean();
            if (c) {
                category = {
                    id: c._id,
                    name: c.name,
                    description: c.description,
                    icon: c.icon,
                    image: c.image
                };
            }
        }

        res.json({
            products: data,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: pageNum,
                perPage
            },
            theme,      // null if none selected
            category    // null if none selected
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
