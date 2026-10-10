const express = require('express');
const { register, login, becomeSeller, toggleWishlist, getWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/become-seller', protect, becomeSeller);
router.post('/wishlist', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
