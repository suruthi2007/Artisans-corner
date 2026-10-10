const Order = require('../models/Order');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order and process payment intent
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            const platformFee = totalAmount * 0.05;
            const vendorPayout = totalAmount * 0.95;

            const order = new Order({
                buyer: req.user._id,
                products: orderItems.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingAddress,
                paymentMethod,
                totalAmount,
                platformFee,
                vendorPayout
            });

            const createdOrder = await order.save();

            // Create Payment Intent with Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Stripe expects amounts in cents
                currency: 'usd',
                description: 'Artisan Corner Order',
                shipping: {
                    name: req.user.name,
                    address: {
                        line1: shippingAddress.address,
                        city: shippingAddress.city,
                        postal_code: shippingAddress.postalCode,
                        country: shippingAddress.country.substring(0, 2).toUpperCase() || 'US',
                    }
                },
                metadata: { orderId: createdOrder._id.toString() }
            });

            res.status(201).json({
                order: createdOrder,
                clientSecret: paymentIntent.client_secret
            });
        }
    } catch (error) {
        console.error("Stripe/Order Error:", error);
        res.status(500).json({ message: error.message || 'Error processing order' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (order) {
            order.paymentStatus = 'Completed';
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id }).populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
