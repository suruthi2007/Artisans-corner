const express = require('express');
const { getVendorProducts, getVendorAnalytics, getVendorStore } = require('../controllers/vendorController');
const { protect, vendor } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/products').get(protect, vendor, getVendorProducts);
router.route('/analytics').get(protect, vendor, getVendorAnalytics);
router.route('/:id').get(getVendorStore);

module.exports = router;
