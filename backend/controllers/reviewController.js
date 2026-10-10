const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { product, rating, comment } = req.body;

        // Check if user has purchased the product
        const hasPurchased = await Order.findOne({
            buyer: req.user._id,
            'products.product': product,
            paymentStatus: 'Completed'
        });

        if (!hasPurchased) {
            return res.status(400).json({ message: 'You must purchase this product before reviewing it' });
        }

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({
            buyer: req.user._id,
            product
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = new Review({
            product,
            buyer: req.user._id,
            rating: Number(rating),
            comment
        });

        await review.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).populate('buyer', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
