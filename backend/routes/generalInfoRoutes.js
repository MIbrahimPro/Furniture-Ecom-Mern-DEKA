const express = require('express');
const router = express.Router();
const GeneralInfo = require('../models/GeneralInfo');

// GET /api/info/footer
// Public route: returns contact info formatted for the site footer
router.get('/footer', async (req, res) => {
    try {
        // Assuming there's only one GeneralInfo document
        const info = await GeneralInfo.findOne().lean();
        if (!info) {
            return res.status(404).json({ message: 'General information not found' });
        }

        // Format for footer
        const footerData = {
            contactEmail: info.contactEmail,
            contactPhone: info.contactPhone,
            address: {
                title: info.address.title,
                street: info.address.street,
                city: info.address.city,
                state: info.address.state,
                zip: info.address.zip,
                country: info.address.country,
            },
            // you can add more fields here (e.g. social links) if desired
        };

        res.json(footerData);
    } catch (err) {
        console.error('Error fetching general info:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
