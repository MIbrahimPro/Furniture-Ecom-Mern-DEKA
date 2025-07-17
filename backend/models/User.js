const mongoose = require('mongoose');
const addressSchema = require('./Address');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },                  // hash stored here
    addresses: [addressSchema],                                   // embedded addresses
    phone: { type: String }, 
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
