const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get vendor's public store profile and products
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorStore = async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id).select('name storeProfile role');
        if (!vendor || vendor.role !== 'Vendor') {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        const products = await Product.find({ vendor: vendor._id });
        
        res.json({
            vendor,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get vendor's products
// @route   GET /api/vendors/products
// @access  Private/Vendor
exports.getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get vendor analytics (sales, earnings)
// @route   GET /api/vendors/analytics
// @access  Private/Vendor
exports.getVendorAnalytics = async (req, res) => {
    try {
        // Find all orders that contain products from this vendor
        const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
        const vendorProductIds = vendorProducts.map(p => p._id);

        const orders = await Order.find({
            'products.product': { $in: vendorProductIds },
            paymentStatus: 'Completed'
        }).populate('products.product');

        let totalEarnings = 0;
        let totalSales = 0;

        orders.forEach(order => {
            order.products.forEach(item => {
                if (vendorProductIds.includes(item.product._id)) {
                    totalSales += item.quantity;
                    // Platform fee is 5%, vendor payout is 95%
                    const itemTotal = item.quantity * item.price;
                    totalEarnings += itemTotal * 0.95;
                }
            });
        });

        res.json({ totalSales, totalEarnings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
