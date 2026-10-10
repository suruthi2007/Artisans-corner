import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [category, setCategory] = useState('All');
    const [wishlistIds, setWishlistIds] = useState([]);

    const categoriesList = [
        { name: 'All', image: '/images/leather_journal_1790872455771.jpg' },
        { name: 'Pottery & Ceramics', image: '/images/ceramic_pot_1790872052367.jpg' },
        { name: 'Woodwork', image: '/images/wooden_spice_box_1790872581401.jpg' },
        { name: 'Knitwear & Textiles', image: '/images/macrame_wall_hanging_1790872242681.jpg' },
        { name: 'Jewelry', image: '/images/tribal_choker_1790872271516.jpg' },
        { name: 'Home Decor', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaygQucWuwmlEZetQVa4nm1RQU_QFOci-YlBdS-x048A&s=10' },
        { name: 'Art & Prints', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBQrIUYafJ6MgFUYb0yHa0qGY5LAz_dAmham0kXKfQmQ&s=10' },
        { name: 'Candles & Soaps', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_64CnfZrwqGVVlApQQV9KfLSv6JP4BPhfugAlGMdNCQ&s=10' },
        { name: 'Accessories', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVk12AB7xLkoBF3-hGxX5FDVX20Aaw8f-6OgyaKicQbA&s=10' }
    ];

    useEffect(() => {
        if (user) {
            axios.get('/api/auth/wishlist', { headers: { Authorization: `Bearer ${user.token}` }})
                .then(res => setWishlistIds(res.data.map(p => typeof p === 'object' ? p._id : p)))
                .catch(err => console.error(err));
        }
    }, [user]);

    const [currentSlide, setCurrentSlide] = useState(0);

    const heroSlides = [
        {
            image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1600",
            title: "Handcrafted with Passion",
            subtitle: "Discover unique, one-of-a-kind items made by independent artisans around the world."
        },
        {
            image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1600",
            title: "Authentic Ceramic Art",
            subtitle: "Elevate your living space with beautifully molded clay masterpieces."
        },
        {
            image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1600",
            title: "Sustainable & Natural",
            subtitle: "Find eco-friendly woodwork and textiles crafted from the finest materials."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = `/api/products?`;
                if (searchKeyword) url += `keyword=${searchKeyword}&`;
                if (category && category !== 'All') url += `category=${category}`;
                
                const { data } = await axios.get(url);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchKeyword, category]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchKeyword(keyword);
    };

    const toggleWishlist = async (productId) => {
        if (!user) return toast.error('Please login to save items to your wishlist');
        try {
            const { data } = await axios.post('/api/auth/wishlist', { productId }, { headers: { Authorization: `Bearer ${user.token}` }});
            setWishlistIds(data);
            if (wishlistIds.includes(productId)) {
                toast.success('Removed from wishlist');
            } else {
                toast.success('Added to wishlist!');
            }
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    if (loading && !products.length) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                {/* Hero Section Carousel */}
                <div className="relative rounded-3xl overflow-hidden mb-12 bg-gray-900 text-white shadow-2xl h-[500px]">
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <img src={slide.image} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="relative z-10 px-8 h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto pt-8">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight transform transition-transform duration-700 translate-y-0 text-white shadow-sm">
                                {slide.title.split(' ').map((word, i, arr) => 
                                    i === arr.length - 1 ? <span key={i} className="text-primary-400"> {word}</span> : <span key={i}>{word} </span>
                                )}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl shadow-sm">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}

                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-10 flex flex-col items-center">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-6">
                        <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden transition-shadow shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                            <div className="grid place-items-center h-full w-12 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-white"
                                type="text"
                                id="search"
                                placeholder="Search for unique artisan goods..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Carousel Indicators */}
                    <div className="flex gap-2 mb-4">
                        {heroSlides.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary-500' : 'bg-white/50 hover:bg-white/80'}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
            </div>


            {/* Thematic Collections (Etsy style) */}
            <div className="max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover Curated Collections</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div onClick={() => { setKeyword('Custom'); setSearchKeyword('Custom'); setCategory('All'); }} className="group cursor-pointer">
                        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100">
                            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600" alt="Personalized Gifts" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">Personalized Gifts</h3>
                    </div>
                    
                    {/* Card 2 */}
                    <div onClick={() => { setKeyword('Soap'); setSearchKeyword('Soap'); setCategory('All'); }} className="group cursor-pointer">
                        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_64CnfZrwqGVVlApQQV9KfLSv6JP4BPhfugAlGMdNCQ&s=10" alt="Self-Care" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">Self-Care Essentials</h3>
                    </div>
                    
                    {/* Card 3 */}
                    <div onClick={() => { setKeyword('Macrame'); setSearchKeyword('Macrame'); setCategory('All'); }} className="group cursor-pointer">
                        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaygQucWuwmlEZetQVa4nm1RQU_QFOci-YlBdS-x048A&s=10" alt="Boho Chic" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">Boho Chic Decor</h3>
                    </div>

                    {/* Card 4 */}
                    <div onClick={() => { setKeyword('Wood'); setSearchKeyword('Wood'); setCategory('All'); }} className="group cursor-pointer">
                        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100">
                            <img src="https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=600" alt="Rustic Home" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">Rustic Home Accents</h3>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {searchKeyword ? `Search Results for "${searchKeyword}"` : (category !== 'All' ? `${category} Collection` : 'All Products')}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {products.length} items found.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => { setKeyword(''); setSearchKeyword(''); setCategory('All'); }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700 px-6 py-2 rounded-full font-medium transition-colors border border-gray-200 shadow-sm"
                    >
                        View All Products
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="glass p-12 text-center rounded-2xl">
                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div key={product._id} className="group relative glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
                                    <img 
                                        src={product.image} 
                                        alt={product.title} 
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    <button 
                                        onClick={() => toggleWishlist(product._id)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={wishlistIds.includes(product._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${wishlistIds.includes(product._id) ? 'text-red-500' : 'text-gray-600'}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6 relative">
                                    {product.category && (
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 block">{product.category}</span>
                                    )}
                                    {product.vendor && (
                                        <Link to={`/store/${product.vendor._id || product.vendor}`} className="text-xs text-gray-500 hover:text-primary-600 mb-2 block truncate">
                                            By {product.vendor.storeProfile?.storeName || product.vendor.name || 'Artisan'}
                                        </Link>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                        <Link to={`/product/${product._id}`}>
                                            <span aria-hidden="true" className="absolute inset-0"></span>
                                            {product.title}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                    <div className="flex items-center justify-between z-10 relative">
                                        <p className="text-xl font-bold text-primary-600">₹{Number(product.price).toFixed(2)}</p>
                                        <Link to={`/product/${product._id}`} className="bg-gray-100 hover:bg-primary-600 hover:text-white p-2 rounded-full transition-colors duration-300 cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
