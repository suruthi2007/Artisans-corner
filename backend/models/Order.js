const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    vendorPayout: { type: Number, default: 0 },
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true, default: 'Stripe' },
    paymentStatus: { type: String, default: 'Pending' }, // Pending, Completed, Failed
    orderStatus: { type: String, default: 'Processing' } // Processing, Shipped, Delivered
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
