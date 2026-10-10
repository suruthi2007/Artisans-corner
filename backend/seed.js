const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Clear everything
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared database');

        // 1. Create 4 Vendors
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const vendorsToCreate = [
            {
                name: 'Luna Smith',
                email: 'luna@demo.com',
                password: hashedPassword,
                role: 'Vendor',
                storeProfile: {
                    storeName: "Luna's Clay Studio",
                    storeDescription: "Hand-thrown pottery, ceramics, and handcrafted jewelry.",
                    storeLogo: "https://placehold.co/200x200/9b59b6/white?text=LCS"
                }
            },
            {
                name: 'William Thread',
                email: 'william@demo.com',
                password: hashedPassword,
                role: 'Vendor',
                storeProfile: {
                    storeName: "Willow & Thread",
                    storeDescription: "Macrame, knitwear, textiles and home decor.",
                    storeLogo: "https://placehold.co/200x200/2ecc71/white?text=W&T"
                }
            },
            {
                name: 'Candice Nook',
                email: 'candice@demo.com',
                password: hashedPassword,
                role: 'Vendor',
                storeProfile: {
                    storeName: "The Candle Nook",
                    storeDescription: "Small-batch scented soy candles, soaps, and accessories.",
                    storeLogo: "https://placehold.co/200x200/e67e22/white?text=TCN"
                }
            },
            {
                name: 'Arthur Timber',
                email: 'arthur@demo.com',
                password: hashedPassword,
                role: 'Vendor',
                storeProfile: {
                    storeName: "Timber & Canvas Co.",
                    storeDescription: "Handcrafted woodwork and original art prints.",
                    storeLogo: "https://placehold.co/200x200/34495e/white?text=T&C"
                }
            }
        ];

        const createdVendors = await User.insertMany(vendorsToCreate);
        console.log('Created vendors');

        const vLuna = createdVendors[0]._id;
        const vWillow = createdVendors[1]._id;
        const vCandle = createdVendors[2]._id;
        const vTimber = createdVendors[3]._id;

        // 2. Create Products
        const productsToCreate = [
            // Jewelry (Luna)
            { vendor: vLuna, title: 'Handmade Macrame Beaded Earrings', description: 'Beautiful handcrafted macrame earrings with beads.', price: 450, category: 'Jewelry', stock: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzuO5ExQwFDk__HWpqPmRMFeMj7z5rmLmiTQ6jy_wrmA&s=10' },
            { vendor: vLuna, title: 'Sterling Silver Wire-Wrapped Pendant', description: 'Elegant pendant on a sterling silver chain.', price: 850, category: 'Jewelry', stock: 8, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUEwvEEIo25xf0cycLFr7fxN0SvptJUVGaeQmEbQ2SJg&s=10' },
            { vendor: vLuna, title: 'Resin Ocean Wave Bracelet', description: 'Ocean inspired bracelet with real sand and resin waves.', price: 600, category: 'Jewelry', stock: 12, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc3YxPkBRvmCBIbr6hx0HJquV0due95IuBFDEWuTyQkQ&s=10' },
            { vendor: vLuna, title: 'Clay Flower Stud Earrings (Set of 3)', description: 'Set of 3 floral clay stud earrings.', price: 350, category: 'Jewelry', stock: 20, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tBw-wnS5Aamp9fcrLpfXEpuX4x9pRlshdoFSzxm6IA&s=10' },

            // Home Decor (Willow)
            { vendor: vWillow, title: 'Boho Macrame Wall Hanging', description: 'Large boho macrame piece.', price: 1200, category: 'Home Decor', stock: 5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaygQucWuwmlEZetQVa4nm1RQU_QFOci-YlBdS-x048A&s=10' },
            { vendor: vWillow, title: 'Hand-Painted Terracotta Planter', description: 'Vibrant painted planter for your indoor plants.', price: 550, category: 'Home Decor', stock: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeuFgKXHCOD7rSowq4ghyEX-udDz19XlImpxbE9HyPAw&s=10' },
            { vendor: vWillow, title: 'Driftwood & String Wall Art', description: 'Coastal inspired wall art made with reclaimed driftwood.', price: 900, category: 'Home Decor', stock: 4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxAqRtzrLMB7D3vAIBBNociKOPPkI7cQ5jICsXviulzw&s=10' },
            { vendor: vWillow, title: 'Woven Rattan Wall Basket', description: 'Natural rattan woven wall basket for a rustic touch.', price: 750, category: 'Home Decor', stock: 8, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXiCzoB6w9sU-HuBaPDzfxfEG9L7rcK1kMfupe9S033Q&s=10' },

            // Art & Prints (Timber)
            { vendor: vTimber, title: 'Watercolor Botanical Print (A4)', description: 'High quality A4 print of an original botanical watercolor.', price: 400, category: 'Art & Prints', stock: 30, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBQrIUYafJ6MgFUYb0yHa0qGY5LAz_dAmham0kXKfQmQ&s=10' },
            { vendor: vTimber, title: 'Hand-Lettered Motivational Quote Print', description: 'Inspiring quote printed on archival paper.', price: 300, category: 'Art & Prints', stock: 25, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5DN7F4NoW_NhTFKokWQsy4o16SZemcZocg8yvXXxInQ&s=10' },
            { vendor: vTimber, title: 'Minimalist Line Art Portrait (Custom)', description: 'Custom digital line art portrait, printed.', price: 1500, category: 'Art & Prints', stock: 5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk-ZnwGtW-AmTKO9WGH6IMeG4_ExfvtryGmsfwWxxUTg&s=10' },
            { vendor: vTimber, title: 'Abstract Acrylic Painting on Canvas', description: 'Original abstract artwork on a stretched canvas.', price: 2200, category: 'Art & Prints', stock: 1, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXKeGir1OnYsCtYpPzmCBsxraG_YjhpyRUXqCH1gIwYA&s=10' },

            // Candles & Soaps (Candle Nook)
            { vendor: vCandle, title: 'Lavender Soy Wax Candle in Glass Jar', description: 'Calming lavender scent. 8oz.', price: 350, category: 'Candles & Soaps', stock: 20, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_64CnfZrwqGVVlApQQV9KfLSv6JP4BPhfugAlGMdNCQ&s=10' },
            { vendor: vCandle, title: 'Handmade Oatmeal & Honey Soap Bar', description: 'Soothing natural soap bar.', price: 150, category: 'Candles & Soaps', stock: 40, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8D5kouOP2ZUCT517Y1BVziGMHXO0J52R3684z9oCC6g&s=10' },
            { vendor: vCandle, title: 'Scented Wooden Wick Candle (Sandalwood)', description: 'Deep, woody scent with a crackling wooden wick.', price: 450, category: 'Candles & Soaps', stock: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWnn0gOFmQG3fQ0uNvwWrsY7psfhIsbpuTrsCORDR1Lg&s=10' },
            { vendor: vCandle, title: 'Natural Charcoal Detox Soap Set (Pack of 3)', description: 'Pack of 3 detoxifying charcoal soaps.', price: 400, category: 'Candles & Soaps', stock: 18, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGeN4uLQsRC3sSqOWoc2G2Pm2sAJBvQlkx879e7EfOZw&s' },

            // Knitwear & Textiles (Willow)
            { vendor: vWillow, title: 'Hand-Knitted Wool Scarf', description: 'Warm chunky winter scarf made from merino wool.', price: 900, category: 'Knitwear & Textiles', stock: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLydkTEar_VYiMu-RUq1168J13BxNe1YeIU8EFIwo71w&s' },
            { vendor: vWillow, title: 'Crochet Baby Blanket', description: 'Soft handmade crochet blanket for babies.', price: 1100, category: 'Knitwear & Textiles', stock: 4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqjpTTmHYGxjUy_d9S8WC-c3zNLK1GSveLQEHi8srmrg&s=10' },
            { vendor: vWillow, title: 'Embroidered Cotton Tote Bag', description: 'Eco-friendly tote with floral hand embroidery.', price: 500, category: 'Knitwear & Textiles', stock: 20, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaI9T4CcUPWdlzHs6h9QOOYsB9rTnQ3GMubg2QVzNAew&s=10' },
            { vendor: vWillow, title: 'Hand-Woven Table Runner', description: 'Artisan woven table runner for your dining room.', price: 650, category: 'Knitwear & Textiles', stock: 6, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQexcZ7i0a5TKDcVlsYIbPtfYMzR8Ae5tzd0C9Mudi9wA&s=10' },

            // Woodwork (Timber)
            { vendor: vTimber, title: 'Engraved Wooden Cutting Board', description: 'Handcrafted walnut wood board with custom engraving.', price: 800, category: 'Woodwork', stock: 7, image: '/images/artisan_woodwork_1791034151490.jpg' },
            { vendor: vTimber, title: 'Handcrafted Wooden Jewelry Box', description: 'Beautifully finished hardwood box with felt lining.', price: 1400, category: 'Woodwork', stock: 3, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiehXtLRS7bhIr-ofwVBH6MuVywXleRRSN90e4jz_5Bw&s=10' },
            { vendor: vTimber, title: 'Live-Edge Wooden Coaster Set (4 pcs)', description: 'Rustic coaster set showing natural wood grain.', price: 1000, category: 'Woodwork', stock: 15, image: 'https://i.etsystatic.com/25257415/r/il/8c818f/5091878077/il_1080xN.5091878077_tlub.jpg' },
            { vendor: vTimber, title: 'Carved Wooden Spoon Set', description: 'Set of 3 hand-carved cooking spoons.', price: 900, category: 'Woodwork', stock: 12, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW8XnGBdR81zpj1j8X0wEVaBfrqAwkGOrAcT3zJbLRIw&s=10' },

            // Pottery & Ceramics (Luna)
            { vendor: vLuna, title: 'Hand-Thrown Ceramic Mug', description: 'Perfect for your morning coffee.', price: 400, category: 'Pottery & Ceramics', stock: 14, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTreQQg7mDrpApregD0qm3DEpjIqeK9zqZIOfGtpQ2UNQ&s=10' },
            { vendor: vLuna, title: 'Glazed Stoneware Fruit Bowl', description: 'Large speckled fruit bowl.', price: 700, category: 'Pottery & Ceramics', stock: 5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7vJuB9WdRgIC97SHwvRvTT-MGHpqAq7z-md5RLrmicQ2o_4v2ZesoPVA&s=10' },
            { vendor: vLuna, title: 'Ceramic Succulent Planter (Set of 2)', description: 'Cute small planters for your desk.', price: 600, category: 'Pottery & Ceramics', stock: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZfRzcILXFrRFlBUrLx73ikpvMnTaUSd5JoOe3Hc6E3g&s=10' },
            { vendor: vLuna, title: 'Handmade Clay Tea Cup Set (4 pcs)', description: 'Set of 4 traditional clay tea cups.', price: 900, category: 'Pottery & Ceramics', stock: 4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYQRMKS5ZJwH3n_2WdRObQ1Lbx9Q6tG1nlbBD8rdqL1g&s=10' },

            // Accessories (Candle Nook)
            { vendor: vCandle, title: 'Handwoven Straw Hat', description: 'Perfect for sunny summer days.', price: 550, category: 'Accessories', stock: 11, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVk12AB7xLkoBF3-hGxX5FDVX20Aaw8f-6OgyaKicQbA&s=10' },
            { vendor: vCandle, title: 'Leather Hand-Stitched Wallet', description: 'Genuine full-grain leather bifold wallet.', price: 350, category: 'Accessories', stock: 5, image: 'https://godbolegear.com/cdn/shop/collections/Unique_Gift_for_Wedding_for_the_Groom_-_Handmade_Leather_Wallet.jpg?v=1720423399&width=1500' },
            { vendor: vCandle, title: 'Beaded Keychain (Set of 2)', description: 'Colorful matching keychains.', price: 200, category: 'Accessories', stock: 25, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBjZ8NUKNg_fv_OjHZ450bqh4Yr2pKsSHyf5Qx_pA6xw&s=10' },
            { vendor: vCandle, title: 'Crochet Hair Scrunchie Set (3 pcs)', description: 'Soft and stretchy handmade scrunchies.', price: 250, category: 'Accessories', stock: 30, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp569pUGzAkMrhGSKB9uKyA9tdg1i5W3vYJgpAGlCjsQ&s=10' }
        ];

        const createdProducts = await Product.insertMany(productsToCreate);
        console.log(`Created ${createdProducts.length} products`);

        // 3. Create 3 Buyers
        const buyersToCreate = [
            { name: 'Alice Buyer', email: 'alice@demo.com', password: hashedPassword, role: 'Buyer' },
            { name: 'Bob Buyer', email: 'bob@demo.com', password: hashedPassword, role: 'Buyer' },
            { name: 'Charlie Buyer', email: 'charlie@demo.com', password: hashedPassword, role: 'Buyer' }
        ];

        const createdBuyers = await User.insertMany(buyersToCreate);
        console.log('Created buyers');

        const bAlice = createdBuyers[0]._id;
        const bBob = createdBuyers[1]._id;

        // 4. Create Orders & Reviews
        const p1 = createdProducts[0]; // Macrame Earrings
        const p2 = createdProducts[12]; // Lavender Candle
        const p3 = createdProducts[24]; // Ceramic Mug

        // Alice's Order (Delivered)
        const order1 = await Order.create({
            buyer: bAlice,
            products: [{ product: p1._id, quantity: 1, price: p1.price }],
            shippingAddress: { address: '123 Main St', city: 'Anytown', postalCode: '12345', country: 'IN' },
            paymentMethod: 'Stripe',
            paymentStatus: 'Completed',
            orderStatus: 'Delivered',
            totalAmount: p1.price
        });

        // Alice Reviews the Earrings
        await Review.create({
            product: p1._id, buyer: bAlice, rating: 5, comment: 'These are so gorgeous! Got so many compliments.'
        });

        // Bob's Order
        const order2 = await Order.create({
            buyer: bBob,
            products: [{ product: p2._id, quantity: 2, price: p2.price }, { product: p3._id, quantity: 1, price: p3.price }],
            shippingAddress: { address: '456 Oak Rd', city: 'Somewhere', postalCode: '67890', country: 'IN' },
            paymentMethod: 'Stripe',
            paymentStatus: 'Completed',
            orderStatus: 'Delivered',
            totalAmount: (p2.price * 2) + p3.price
        });

        // Bob Reviews Candle
        await Review.create({
            product: p2._id, buyer: bBob, rating: 4, comment: 'Smells amazing, but burns a bit fast.'
        });

        console.log('Created orders and reviews');
        console.log('--- SEEDING COMPLETE ---');
        console.log('Demo Vendor 1: luna@demo.com / password123');
        console.log('Demo Buyer 1: alice@demo.com / password123');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
