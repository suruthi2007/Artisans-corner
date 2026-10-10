const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const query = {};
        if (req.query.keyword) {
            query.title = { $regex: req.query.keyword, $options: 'i' };
        }
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        const products = await Product.find(query).populate('vendor', 'name storeProfile');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'name storeProfile');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, stock, category } = req.body;
        const image = req.files && req.files.image ? req.files.image[0].path : (req.file ? req.file.path : '');

        const product = new Product({
            title,
            description,
            price,
            stock,
            category: category || 'Other',
            image,
            vendor: req.user._id
        });

        // Handle multiple uploaded images for gallery on create if needed (not typically sent on create but good to have)
        if (req.files && req.files.gallery) {
            product.gallery = req.files.gallery.map(file => file.path);
        }

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
    try {
        const { title, description, price, stock, category } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized to update this product' });
            }
            product.title = title || product.title;
            product.description = description || product.description;
            product.price = price || product.price;
            product.stock = stock || product.stock;
            if (category) product.category = category;
            
            if (req.files && req.files.image) {
                product.image = req.files.image[0].path;
            }

            // Handle multiple uploaded images for gallery
            if (req.files && req.files.gallery) {
                const newGalleryImages = req.files.gallery.map(file => file.path);
                product.gallery = product.gallery ? [...product.gallery, ...newGalleryImages] : newGalleryImages;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.vendor.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized to delete this product' });
            }
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
