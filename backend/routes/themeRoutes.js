const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const Product = require('../models/Product');

// GET /api/themes
// Returns all themes, each with up to 4 random products
router.get('/', async (req, res) => {
    try {
        // 1. Fetch all themes
        const themes = await Theme.find().lean();

        // 2. For each theme, grab up to 4 random products
        const themedData = await Promise.all(
            themes.map(async (theme) => {
                // Aggregate pipeline: match by theme, random sample, project needed fields
                const products = await Product.aggregate([
                    { $match: { theme: theme._id } },
                    { $sample: { size: 4 } },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            price: 1,
                            // take first image in images array
                            image: { $arrayElemAt: ['$images', 0] },
                        },
                    },
                ]);

                return {
                    id: theme._id,
                    name: theme.name,
                    description: theme.description,
                    image: theme.image,
                    color: theme.color,
                    products,
                };
            })
        );

        res.json(themedData);
    } catch (err) {
        console.error('Error fetching themes with products:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
