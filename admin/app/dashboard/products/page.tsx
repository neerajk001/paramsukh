'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Package as PackageIcon } from 'lucide-react';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    category: string;
    stock: number;
    shop?: { name: string };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/api/products');
            // Backend returns: { success: true, data: { products: [...], pagination: {...} } }
            setProducts(response.data.data?.products || response.data.products || response.data || []);
        } catch (error: any) {
            // Only show error for server errors, not for empty data
            if (error.response?.status !== 404) {
                console.error('Error fetching products:', error);
                if (error.response?.status >= 500) {
                    toast.error('Server error. Please try again later.');
                }
            }
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Products Management</h1>
                    <p className="text-accent mt-1">Manage marketplace products</p>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 font-medium">
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-accent">No products found</div>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow card-hover">
                            <div className="relative h-48 bg-gray-200">
                                {product.images?.[0] ? (
                                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary to-primary-dark">
                                        <PackageIcon className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-secondary mb-2 line-clamp-1">{product.name}</h3>
                                    <p className="text-accent text-sm line-clamp-2">{product.description}</p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                        {product.category || 'General'}
                                    </span>
                                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Stock: {product.stock || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-2xl font-bold text-secondary">₹{product.price || 0}</span>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
