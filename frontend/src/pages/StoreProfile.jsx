import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const StoreProfile = () => {
    const { vendorId } = useParams();
    const { user } = useSelector(state => state.auth);
    
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get('/api/auth/wishlist', { headers: { Authorization: `Bearer ${user.token}` }})
                .then(res => setWishlistIds(res.data.map(p => typeof p === 'object' ? p._id : p)))
                .catch(err => console.error(err));
        }
    }, [user]);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const { data } = await axios.get(`/api/vendors/${vendorId}`);
                setVendor(data.vendor);
                setProducts(data.products);
            } catch (error) {
                toast.error('Failed to load store profile');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [vendorId]);

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-500">Store not found</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Store Header */}
                <div className="glass rounded-3xl p-10 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex-shrink-0">
                        {vendor.storeProfile?.storeLogo ? (
                            <img src={vendor.storeProfile.storeLogo} alt={vendor.storeProfile.storeName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-500 text-4xl font-bold">
                                {vendor.storeProfile?.storeName?.charAt(0) || vendor.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                        <div className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full uppercase tracking-wider mb-3">Verified Artisan</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{vendor.storeProfile?.storeName || vendor.name}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                            {vendor.storeProfile?.storeDescription || 'Welcome to my artisan store! Take a look around at my handcrafted items.'}
                        </p>
                    </div>
                </div>

                {/* Store Products */}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">All Products from {vendor.storeProfile?.storeName}</h2>
                        <span className="text-gray-500 font-medium">{products.length} items</span>
                    </div>

                    {products.length === 0 ? (
                        <div className="glass p-12 text-center rounded-2xl">
                            <p className="text-gray-500 text-lg">This vendor hasn't uploaded any products yet.</p>
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
        </div>
    );
};

export default StoreProfile;
