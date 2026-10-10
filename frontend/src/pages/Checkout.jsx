import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart } from '../slices/cartSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key if available
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = ({ shippingAddress, totalPrice, itemsPrice, shippingPrice, taxPrice }) => {
    const { cartItems } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements || !user) {
            return;
        }

        // Validate shipping address
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            toast.error('Please fill in all shipping address fields');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // 1. Create order and get payment intent client secret
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product,
                    quantity: item.qty,
                    price: item.price
                })),
                shippingAddress,
                paymentMethod: 'Stripe',
                totalAmount: totalPrice
            };
            
            const { data } = await axios.post('/api/orders', orderData, config);
            const clientSecret = data.clientSecret;

            // 2. Confirm payment with Stripe
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user.name,
                        email: user.email,
                        address: {
                            line1: shippingAddress.address,
                            city: shippingAddress.city,
                            postal_code: shippingAddress.postalCode,
                            country: shippingAddress.country.substring(0, 2).toUpperCase() || 'US',
                        }
                    },
                },
            });

            if (paymentResult.error) {
                toast.error(paymentResult.error.message);
                setLoading(false);
                return;
            } else {
                if (paymentResult.paymentIntent.status === 'succeeded') {
                    // 3. Mark order as paid
                    await axios.put(`/api/orders/${data.order._id}/pay`, {}, config);
                    
                    toast.success('Order placed successfully!');
                    dispatch(clearCart());
                    navigate('/order-history');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error placing order');
            setLoading(false);
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.body.classList.contains('dark'));
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        
        return () => observer.disconnect();
    }, []);

    const cardOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: isDarkMode ? '#f9fafb' : '#424770',
                '::placeholder': { color: isDarkMode ? '#6b7280' : '#aab7c4' }
            },
            invalid: { color: '#ef4444' }
        }
    };

    return (
        <div className="lg:col-span-1">
            <div className="glass p-8 rounded-3xl shadow-sm bg-white sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item, index) => (
                        <div key={index} className="flex gap-4 border-b border-gray-100 pb-4">
                            <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                                <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
                                <p className="text-primary-600 font-bold text-sm">₹{Number(item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="space-y-3 text-sm border-b border-gray-100 pb-6 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Items</span>
                        <span className="font-medium text-gray-900">₹{itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium text-gray-900">${shippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span className="font-medium text-gray-900">${taxPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 mb-8">
                    <span>Total</span>
                    <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
                </div>

                <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <CardElement options={cardOptions} />
                </div>
                
                <button 
                    type="button" 
                    onClick={placeOrderHandler}
                    disabled={loading || !stripe}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-4 px-8 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Place Order'}
                </button>
            </div>
        </div>
    );
};

const Checkout = () => {
    const { cartItems } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    useEffect(() => {
        if (!user) {
            toast.error('You must be signed in to checkout');
            navigate('/login');
        }
    }, [user, navigate]);

    // Calculate totals
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = 0.15 * itemsPrice;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    if (cartItems.length === 0 || !user) {
        return null;
    }

    const handleChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Form */}
                <div className="lg:col-span-2">
                    <div className="glass p-8 rounded-3xl shadow-sm bg-white">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                <input 
                                    type="text" 
                                    name="address"
                                    required
                                    value={shippingAddress.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="123 Artisan Way"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input 
                                        type="text" 
                                        name="city"
                                        required
                                        value={shippingAddress.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="San Francisco"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                    <input 
                                        type="text" 
                                        name="postalCode"
                                        required
                                        value={shippingAddress.postalCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="94105"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input 
                                    type="text" 
                                    name="country"
                                    required
                                    value={shippingAddress.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="United States"
                                />
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Order Summary wrapped in Elements */}
                <Elements stripe={stripePromise}>
                    <CheckoutForm 
                        shippingAddress={shippingAddress} 
                        totalPrice={totalPrice} 
                        itemsPrice={itemsPrice} 
                        shippingPrice={shippingPrice} 
                        taxPrice={taxPrice} 
                    />
                </Elements>
            </div>
        </div>
    );
};

export default Checkout;
