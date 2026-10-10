const express = require('express');
const { addOrderItems, updateOrderToPaid, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/pay').put(protect, updateOrderToPaid);

module.exports = router;
