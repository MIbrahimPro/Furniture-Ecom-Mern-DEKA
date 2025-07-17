const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    title: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String },
    country: { type: String, required: true },
}, {
    _id: true
});

module.exports = addressSchema; // export as subdocument schema
