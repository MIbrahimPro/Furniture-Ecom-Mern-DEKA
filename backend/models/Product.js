const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema({
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    depth: { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
    brand: { type: String },
    color: { type: String },
    dimensions: { type: dimensionSchema, required: true },
    weight: { type: Number },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
