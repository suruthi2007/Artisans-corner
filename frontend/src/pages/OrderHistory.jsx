import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrderHistory = () => {
    const { user } = useSelector(state => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setOrders(data);
            } catch (error) {
                toast.error('Failed to load order history');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
            
            {orders.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <h2 className="text-2xl font-medium text-gray-900 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start exploring!</p>
                    <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="glass p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-medium text-gray-900">{order._id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Date Placed</p>
                                        <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {order.products.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                                {item.product && item.product.image ? (
                                                    <img src={item.product.image} alt="Product" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">{item.product ? item.product.title : 'Product Unavailable'}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-72 bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>Total Amount</span>
                                        <span className="font-medium text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payment Status</span>
                                        <span className={`font-medium ${order.paymentStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Order Status</span>
                                        <span className="font-medium text-primary-600">{order.orderStatus}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping To</h4>
                                    <p className="text-sm text-gray-700">{order.shippingAddress.address}</p>
                                    <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
