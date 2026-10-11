import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { becomeSeller, reset } from '../slices/authSlice';
import toast from 'react-hot-toast';

const BecomeSeller = () => {
    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        storeLogo: ''
    });

    const { storeName, storeDescription, storeLogo } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role === 'Vendor') {
            navigate('/dashboard/seller');
        }

        if (isError) {
            toast.error(message);
        }

        dispatch(reset());
    }, [user, isError, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        
        if (!storeName || !storeDescription) {
            toast.error('Store name and description are required');
            return;
        }

        dispatch(becomeSeller(formData)).then((action) => {
            if (becomeSeller.fulfilled.match(action)) {
                toast.success('Successfully became a seller!');
                navigate('/dashboard/seller');
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-dark-700">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white font-serif mb-4">
                        Become a Seller
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Open your artisan store and share your craft with the world.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Store Name</label>
                        <input
                            type="text"
                            name="storeName"
                            value={storeName}
                            onChange={onChange}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                            placeholder="e.g. Vintage Woodworks"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Store Description</label>
                        <textarea
                            name="storeDescription"
                            value={storeDescription}
                            onChange={onChange}
                            rows="4"
                            className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                            placeholder="Tell customers about your craft, your process, and your inspiration."
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Store Logo URL (Optional)</label>
                        <input
                            type="text"
                            name="storeLogo"
                            value={storeLogo}
                            onChange={onChange}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                            placeholder="https://example.com/my-logo.png"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-md ${
                            isLoading 
                            ? 'bg-primary-400 cursor-not-allowed' 
                            : 'bg-primary-600 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                        {isLoading ? 'Creating Store...' : 'Start Selling'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomeSeller;
