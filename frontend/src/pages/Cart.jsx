import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems } = useSelector((state) => state.cart);

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/checkout');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            
            {cartItems.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any artisan goods to your cart yet. Discover unique handmade items.</p>
                    <Link to="/" className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-md">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="glass p-4 rounded-2xl flex items-center gap-6 shadow-sm">
                                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                            <Link to={`/product/${item.product}`}>{item.title}</Link>
                                        </h3>
                                        <p className="ml-4">₹{Number(item.price).toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Qty</span>
                                            <select 
                                                value={item.qty} 
                                                onChange={(e) => dispatch(addToCart({...item, qty: Number(e.target.value)}))}
                                                className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white"
                                            >
                                                {[...Array(item.stock).keys()].map((x) => (
                                                    <option key={x + 1} value={x + 1}>
                                                        {x + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex">
                                            <button
                                                type="button"
                                                onClick={() => removeFromCartHandler(item.product)}
                                                className="font-medium text-red-500 hover:text-red-400 p-2 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="glass p-6 rounded-2xl sticky top-28 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            
                            <div className="flex justify-between text-base text-gray-700 mb-4">
                                <p>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</p>
                                <p>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</p>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                                    <p>Total</p>
                                    <p>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={checkoutHandler}
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-4 px-4 rounded-xl transition-colors duration-300 shadow-md"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
