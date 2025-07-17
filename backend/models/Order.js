const mongoose = require('mongoose');
const addressSchema = require('./Address');

const itemSnapshotSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [itemSnapshotSchema],
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ['card', 'paypal', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    totalPrice: { type: Number, required: true, min: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
