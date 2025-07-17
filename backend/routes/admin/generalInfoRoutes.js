// routes/admin/generalInfoRoutes.js
const express = require('express');
const router = express.Router();
const GeneralInfo = require('../../models/GeneralInfo');
const { requireAdmin } = require('../../middleware/auth');

// GET /api/admin/info
router.get('/', requireAdmin, async (req, res) => {
  try {
    const info = await GeneralInfo.findOne().lean();
    if (!info) {
      return res.status(404).json({ message: 'General information not found' });
    }
    res.json(info);
  } catch (err) {
    console.error('Admin GET GeneralInfo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/info
// Partially updates any provided fields; others remain untouched
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { contactEmail, contactPhone, address } = req.body;
    const info = await GeneralInfo.findOne();
    if (!info) {
      return res.status(404).json({ message: 'General information not found' });
    }

    // Patch top‐level fields
    if (contactEmail != null) info.contactEmail = contactEmail;
    if (contactPhone != null) info.contactPhone = contactPhone;

    // Patch nested address fields if provided
    if (address && typeof address === 'object') {
      const addr = info.address;
      ['title', 'street', 'city', 'state', 'zip', 'country'].forEach(field => {
        if (address[field] != null) {
          addr[field] = address[field];
        }
      });
    }

    await info.save();
    res.json(info);
  } catch (err) {
    console.error('Admin UPDATE GeneralInfo error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
