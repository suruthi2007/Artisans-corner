const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, vendor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, vendor, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 5 }]), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, vendor, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 5 }]), updateProduct)
    .delete(protect, vendor, deleteProduct);

module.exports = router;
