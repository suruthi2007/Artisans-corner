const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, storeName, storeDescription, storeLogo } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserData = {
            name,
            email,
            password: hashedPassword,
            role: role === 'Vendor' ? 'Vendor' : 'Buyer'
        };

        if (role === 'Vendor') {
            newUserData.storeProfile = {
                name: storeName || `${name}'s Craft Store`,
                description: storeDescription || 'Handmade artisan crafts and goods.',
                logo: storeLogo || ''
            };
        }

        const user = await User.create(newUserData);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeProfile: user.storeProfile,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeProfile: user.storeProfile,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.becomeSeller = async (req, res) => {
    try {
        const { storeName, storeDescription, storeLogo } = req.body;
        const user = await User.findById(req.user.id);
        
        if (user) {
            user.role = 'Vendor';
            user.storeProfile = {
                name: storeName,
                description: storeDescription,
                logo: storeLogo
            };
            await user.save();
            res.json({ message: 'Successfully became a seller', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (user) {
            const index = user.wishlist.indexOf(productId);
            if (index === -1) {
                user.wishlist.push(productId);
            } else {
                user.wishlist.splice(index, 1);
            }
            await user.save();
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'vendor', select: 'name storeProfile' }
        });
        
        if (user) {
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
