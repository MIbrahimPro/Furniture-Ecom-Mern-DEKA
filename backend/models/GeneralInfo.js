const mongoose = require('mongoose');
const addressSchema = require('./Address');

const generalInfoSchema = new mongoose.Schema({
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    address: { type: addressSchema, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('GeneralInfo', generalInfoSchema);
