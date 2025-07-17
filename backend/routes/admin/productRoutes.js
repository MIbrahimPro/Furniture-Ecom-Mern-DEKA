// routes/admin/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { requireAdmin } = require('../../middleware/auth');
const {
    uploadMiddlewareuu,
    deleteImage,
    convertFsPathToWebPath
} = require('../../middleware/upload');

// Helpers
function mapProduct(p) {
    return {
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.images,        // ["products/…jpg", …]
        category: {
            id: p.category._id,
            name: p.category.name,
            description: p.category.description,
            icon: p.category.icon
        },
        theme: {
            id: p.theme._id,
            name: p.theme.name,
            description: p.theme.description,
            image: p.theme.image,
            color: p.theme.color
        },
        brand: p.brand,
        color: p.color,
        dimensions: p.dimensions,
        weight: p.weight,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
    };
}

// ─── LIST ALL PRODUCTS WITH CATEGORY & THEME ─────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name description icon')
            .populate('theme', 'name description image color')
            .lean();

        const result = products.map(mapProduct);
        res.json(result);
    } catch (err) {
        console.error('Admin GET products error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// ─── CREATE PRODUCT ────────────────────────────────────────────────────────────
// Expects multipart/form-data with fields:
//   - name, description, price, category, theme, brand?, color?
//   - dimensions.width, dimensions.height, dimensions.depth
//   - weight?
//   - up to 5 files under field "images"
router.post(
    '/',
    requireAdmin,
    uploadMiddlewareuu('products').any(),
    async (req, res) => {
        try {
            const {
                name, description, price,
                category, theme, brand, color,
                weight
            } = req.body;
            const dims = req.body.dimensions && JSON.parse(req.body.dimensions);

            // Validate required
            if (![name, description, price, category, theme, dims].every(Boolean)) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            if (!Array.isArray(req.files) || req.files.length === 0) {
                return res.status(400).json({ message: 'At least one image is required' });
            }

            // Build images array of web‑paths
            const images = req.files.map(f =>
                "uploads/" + convertFsPathToWebPath(f.path)
            );

            const product = await Product.create({
                name, description,
                price: Number(price),
                images,
                category, theme,
                brand, color,
                dimensions: dims,
                weight: weight ? Number(weight) : undefined
            });

            res.status(201).json(mapProduct(product));
        } catch (err) {
            console.error('Admin CREATE product error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// ─── DELETE A PRODUCT ─────────────────────────────────────────────────────────
// Remove product and all its images from disk
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id).lean();
        if (!prod) return res.status(404).json({ message: 'Product not found' });

        // delete all files
        prod.images.forEach(pathStr => {
            const fn = pathStr.split('/').pop();
            deleteImage('products', fn);
        });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product and its images deleted' });
    } catch (err) {
        console.error('Admin DELETE product error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// ─── REMOVE ONE IMAGE ─────────────────────────────────────────────────────────
// DELETE /api/admin/products/:id/images/:filename
router.delete(
    '/:id/images/:filename',
    requireAdmin,
    async (req, res) => {
        try {
            const { id, filename } = req.params;
            const prod = await Product.findById(id);
            if (!prod) return res.status(404).json({ message: 'Product not found' });

            // Prevent removing last image
            if (prod.images.length <= 1) {
                return res.status(400).json({ message: 'Cannot remove the last image' });
            }

            // Find and remove
            const idx = prod.images.findIndex(p => p.endsWith(filename));
            if (idx === -1) {
                return res.status(404).json({ message: 'Image not found in product' });
            }

            prod.images.splice(idx, 1);
            deleteImage('products', filename);
            await prod.save();

            res.json({ images: prod.images });
        } catch (err) {
            console.error('Admin REMOVE product-image error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);


// ─── UPDATE PRODUCT (DETAILS + UPLOAD NEW IMAGES) ─────────────────────────────
// ─── UPDATE PRODUCT (DETAILS + UPLOAD NEW IMAGES) ─────────────────────────────
router.put(
  '/:id',
  requireAdmin,
  uploadMiddlewareuu('products').any(),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Product ID is required' });

      // 1) pull out & normalize your text fields (except images)
      const updates = { ...req.body };
      if (updates.price)      updates.price    = Number(updates.price);
      if (updates.weight)     updates.weight   = Number(updates.weight);
      if (updates.dimensions) updates.dimensions = JSON.parse(updates.dimensions);

      // 2) parse the **existing** images list
      let existingImages = [];
      if (typeof updates.images === 'string') {
        try {
          existingImages = JSON.parse(updates.images);
          if (!Array.isArray(existingImages)) {
            existingImages = [];
          }
        } catch (e) {
          console.warn('Could not parse updates.images, falling back to empty array', updates.images);
          existingImages = [];
        }
      }
      // remove it from updates so Object.assign won’t overwrite
      delete updates.images;

      // find your product
      const prod = await Product.findById(id);
      if (!prod) return res.status(404).json({ message: 'Product not found' });

      // 3) merge in non-image fields
      Object.assign(prod, updates);

      // 4) replace prod.images with the parsed existingImages
      prod.images = existingImages;

      // 5) now append any new file uploads
      if (Array.isArray(req.files) && req.files.length) {
        const newPaths = req.files.map(f =>
          // convertFsPathToWebPath returns "products/xxx.jpg"
          // prefix with your static mount "uploads/"
          `uploads/${convertFsPathToWebPath(f.path)}`
        );
        prod.images.push(...newPaths);
      }

      // save & return
      await prod.save();
      return res.json(mapProduct(prod));
    } catch (err) {
      console.error('Admin UPDATE product error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);



module.exports = router;
