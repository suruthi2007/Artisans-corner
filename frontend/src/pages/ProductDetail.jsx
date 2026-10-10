import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { addToCart } from '../slices/cartSlice';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    const [product, setProduct] = useState({});
    const [activeImage, setActiveImage] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qty, setQty] = useState(1);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const [isWishlisted, setIsWishlisted] = useState(false);

    const fetchProductAndReviews = async () => {
        try {
            const [productRes, reviewsRes] = await Promise.all([
                axios.get(`/api/products/${id}`),
                axios.get(`/api/reviews/${id}`)
            ]);
            setProduct(productRes.data);
            setActiveImage(productRes.data.image);
            setReviews(reviewsRes.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch details');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductAndReviews();
        
        if (user) {
            axios.get('/api/auth/wishlist', { headers: { Authorization: `Bearer ${user.token}` }})
                .then(res => {
                    const ids = res.data.map(p => typeof p === 'object' ? p._id : p);
                    setIsWishlisted(ids.includes(id));
                })
                .catch(err => console.error(err));
        }
    }, [id, user]);

    const handleAddToCart = () => {
        dispatch(addToCart({
            product: product._id,
            title: product.title,
            image: product.image,
            price: product.price,
            stock: product.stock,
            qty: Number(qty)
        }));
        toast.success(`Added ${qty} ${product.title} to your cart!`);
        navigate('/cart');
    };

    const toggleWishlist = async () => {
        if (!user) return toast.error('Please login to save items to your wishlist');
        try {
            await axios.post('/api/auth/wishlist', { productId: id }, { headers: { Authorization: `Bearer ${user.token}` }});
            setIsWishlisted(!isWishlisted);
            toast.success(!isWishlisted ? 'Added to wishlist!' : 'Removed from wishlist');
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('/api/reviews', { product: id, rating, comment }, config);
            toast.success('Review submitted successfully!');
            setRating(5);
            setComment('');
            fetchProductAndReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.114-1.059.777l-4.69-2.981a.562.562 0 00-.592 0l-4.69 2.981c-.528.337-1.207-.156-1.059-.777l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
        ));
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error}</p>
            <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">Go back home</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to all products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Product Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div className="glass rounded-3xl overflow-hidden aspect-square relative shadow-lg">
                        <img 
                            src={activeImage || product.image} 
                            alt={product.title} 
                            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
                        />
                        <button 
                            onClick={toggleWishlist}
                            className="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={`w-6 h-6 ${isWishlisted ? 'text-red-500' : 'text-gray-600'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>
                    </div>
                    {product.gallery && product.gallery.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            <button 
                                onClick={() => setActiveImage(product.image)}
                                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={product.image} className="w-full h-full object-cover" alt="Main cover" />
                            </button>
                            {product.gallery.map((imgUrl, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveImage(imgUrl)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === imgUrl ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={imgUrl} className="w-full h-full object-cover" alt={`Gallery image ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    
                    {product.vendor && (
                        <p className="text-sm text-gray-500 mb-6 flex items-center">
                            By <Link to={`/store/${product.vendor._id || product.vendor}`} className="font-semibold text-primary-600 ml-1 hover:underline">{product.vendor.storeProfile?.storeName || product.vendor.name || 'Vendor'}</Link>
                        </p>
                    )}
                    
                    <p className="text-3xl font-bold text-gray-900 mb-6">₹{Number(product.price).toFixed(2)}</p>
                    
                    <div className="prose prose-sm text-gray-600 mb-8">
                        <p>{product.description}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-8 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-700 font-medium">Availability:</span>
                            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                            </span>
                        </div>

                        {product.stock > 0 && (
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-gray-700 font-medium">Quantity:</span>
                                <select 
                                    value={qty} 
                                    onChange={(e) => setQty(e.target.value)}
                                    className="block w-24 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white shadow-sm"
                                >
                                    {[...Array(product.stock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-4 px-8 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-16 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
                    <p className="text-gray-500 mt-2">See what others are saying about this artisan product.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Reviews List */}
                    <div className="md:col-span-7 space-y-6 order-2 md:order-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Recent Reviews</h3>
                        {reviews.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-100 p-8 text-center rounded-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-300 mb-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                <p className="text-gray-500 font-medium">No reviews yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {review.buyer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{review.buyer.name}</h4>
                                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Write Review Form */}
                    <div className="md:col-span-5 order-1 md:order-2">
                        <div className="glass p-8 rounded-3xl shadow-sm sticky top-28 bg-white border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 text-center text-gray-900">Write a Review</h3>
                            
                            {!user ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 mb-6">Please login to write a review</p>
                                    <Link to="/login" className="inline-block w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-colors shadow-md">
                                        Login to Review
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={submitReviewHandler} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <div className="relative">
                                            <select 
                                                value={rating} 
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 appearance-none bg-gray-50 font-medium"
                                            >
                                                <option value="5">5 ⭐️ - Excellent</option>
                                                <option value="4">4 ⭐️ - Very Good</option>
                                                <option value="3">3 ⭐️ - Good</option>
                                                <option value="2">2 ⭐️ - Fair</option>
                                                <option value="1">1 ⭐️ - Poor</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                        <textarea 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50 resize-none text-sm"
                                            placeholder="What did you like or dislike?"
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={submittingReview}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 mt-2"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
