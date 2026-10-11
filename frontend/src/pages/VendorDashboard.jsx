import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: 'Other',
    });
    const [image, setImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    
    // Vendor products state
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState({ totalSales: 0, totalEarnings: 0 });
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        if (!user || user.role?.toLowerCase() !== 'vendor') {
            navigate('/login');
        } else {
            fetchVendorData();
        }
    }, [user, navigate]);

    const fetchVendorData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [productsRes, analyticsRes] = await Promise.all([
                axios.get('/api/vendors/products', config),
                axios.get('/api/vendors/analytics', config)
            ]);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setAnalytics(analyticsRes.data && typeof analyticsRes.data === 'object' ? analyticsRes.data : { totalSales: 0, totalEarnings: 0 });
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleGalleryChange = (e) => {
        setGallery(Array.from(e.target.files));
    };

    const handleEditProduct = (product) => {
        setEditMode(true);
        setEditProductId(product._id);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category || 'Other',
        });
        setImage(null);
        setGallery([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditProductId(null);
        setFormData({ title: '', description: '', price: '', stock: '', category: 'Other' });
        setImage(null);
        setGallery([]);
        if (document.getElementById('image-upload')) document.getElementById('image-upload').value = '';
        if (document.getElementById('gallery-upload')) document.getElementById('gallery-upload').value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        if (image) {
            data.append('image', image);
        }
        
        gallery.forEach(file => {
            data.append('gallery', file);
        });

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            if (editMode) {
                await axios.put(`/api/products/${editProductId}`, data, config);
                toast.success('Product updated successfully!');
            } else {
                await axios.post('/api/products', data, config);
                toast.success('Product created successfully!');
            }
            
            cancelEdit();
            fetchVendorData();
        } catch (error) {
            toast.error(error.response?.data?.message || `Error ${editMode ? 'updating' : 'creating'} product`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/products/${id}`, config);
                toast.success('Product deleted!');
                if (editProductId === id) cancelEdit();
                fetchVendorData();
            } catch (error) {
                toast.error('Error deleting product');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium">Total Items Sold</p>
                        <h3 className="text-3xl font-bold text-gray-900">{analytics?.totalSales ?? 0}</h3>
                    </div>
                    <div className="p-4 bg-primary-100 rounded-full text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium">Total Earnings</p>
                        <h3 className="text-3xl font-bold text-green-600">₹{(Number(analytics?.totalEarnings) || 0).toFixed(2)}</h3>
                    </div>
                    <div className="p-4 bg-green-100 rounded-full text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add/Edit Product Form */}
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-2xl shadow-sm bg-white sticky top-28">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
                                >
                                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                                    <option value="Woodwork">Woodwork</option>
                                    <option value="Knitwear & Textiles">Knitwear & Textiles</option>
                                    <option value="Jewelry">Jewelry</option>
                                    <option value="Home Decor">Home Decor</option>
                                    <option value="Art & Prints">Art & Prints</option>
                                    <option value="Candles & Soaps">Candles & Soaps</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Main Cover Image {editMode && '(Leave empty to keep)'}</label>
                                <input 
                                    id="image-upload"
                                    type="file" 
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required={!editMode}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                            </div>
                            
                            {editMode && (
                                <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Add Extra Angles (Gallery)</label>
                                    <p className="text-xs text-gray-500 mb-3">Upload multiple images to show different views of this product.</p>
                                    <input 
                                        id="gallery-upload"
                                        type="file" 
                                        name="gallery"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    />
                                    {gallery.length > 0 && <p className="text-sm mt-2 text-green-600">{gallery.length} file(s) selected.</p>}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : (editMode ? 'Update Product' : 'Create Product')}
                                </button>
                                {editMode && (
                                    <button 
                                        type="button" 
                                        onClick={cancelEdit}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Products List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Products</h2>
                    
                    {loadingProducts ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (!Array.isArray(products) || products.length === 0) ? (
                        <div className="glass p-12 text-center rounded-2xl">
                            <p className="text-gray-500">You haven't added any products yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {products.map(product => (
                                <div key={product._id} className="glass p-4 rounded-2xl flex gap-6 items-center">
                                    <div className="relative">
                                        <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                        {product.gallery && product.gallery.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                +{product.gallery.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.title}</h3>
                                        <p className="text-primary-600 font-bold mb-1">₹{Number(product.price).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">Stock: <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>{product.stock}</span></p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => handleEditProduct(product)}
                                            className="text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors border border-primary-200"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
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

export default VendorDashboard;
