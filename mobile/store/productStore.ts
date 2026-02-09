import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

interface Product {
    _id: string;
    id: string; // for UI
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string; // Emoji or URL
    rating: {
        average: number;
        count: number;
    };
    inStock: boolean;
    reviewsCount: number;
}

interface ProductState {
    products: Product[];
    currentShop: any | null;
    isLoading: boolean;
    error: string | null;

    fetchProductsByShop: (shopId: string) => Promise<void>;
    fetchShopDetails: (shopId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    currentShop: null,
    isLoading: false,
    error: null,

    fetchProductsByShop: async (shopId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/shops/${shopId}/products`);

            if (response.data.success) {
                const backendProducts = response.data.data.products;

                const formattedProducts = backendProducts.map((p: any) => ({
                    id: p._id,
                    _id: p._id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    description: p.description,
                    image: p.images?.[0] || '📦', // Use first image or fallback emoji
                    rating: p.rating || { average: 0, count: 0 },
                    inStock: p.stock > 0,
                    reviewsCount: p.reviews?.length || 0
                }));

                set({ products: formattedProducts, isLoading: false });
            } else {
                set({ isLoading: false, error: 'Failed to fetch products' });
            }
        } catch (error: any) {
            // Fallback for demo if API fails or returns 404
            console.error('Fetch Products Error:', error);
            set({ isLoading: false, error: 'Failed to load products' });
        }
    },

    fetchShopDetails: async (shopId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/shops/${shopId}`);
            if (response.data.success) {
                const shop = response.data.data.shop;
                // Format if necessary
                const formattedShop = {
                    ...shop,
                    id: shop._id,
                    rating: shop.rating?.average || 0,
                    totalReviews: shop.rating?.count || 0,
                    image: shop.logo || '🏪',
                    location: shop.address?.city || 'India',
                    established: new Date(shop.createdAt).getFullYear().toString()
                };
                set({ currentShop: formattedShop, isLoading: false });
            }
        } catch (error) {
            console.error("Fetch Shop Details Error: ", error);
            set({ isLoading: false, error: "Failed to load shop details" });
        }
    }
}));
