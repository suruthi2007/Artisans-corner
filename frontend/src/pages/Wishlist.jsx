import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { user } = useSelector(state => state.auth);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchWishlist = async () => {
            try {
                const { data } = await axios.get('/api/auth/wishlist', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setWishlist(data);
            } catch (error) {
                toast.error('Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [user, navigate]);

    const removeFromWishlist = async (productId) => {
        try {
            await axios.post('/api/auth/wishlist', { productId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setWishlist(wishlist.filter(item => item._id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
            
            {wishlist.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <h2 className="text-2xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6">Explore the artisan corner and find something you love!</p>
                    <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlist.map(product => (
                        <div key={product._id} className="group relative glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                            <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
                                <img 
                                    src={product.image} 
                                    alt={product.title} 
                                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110" 
                                />
                                <button 
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 relative">
                                {product.category && (
                                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 block">{product.category}</span>
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
    );
};

export default Wishlist;
