'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Search, MessageSquare, Heart, MessageCircle } from 'lucide-react';

interface Post {
    _id: string;
    author: { name: string };
    content: string;
    group: { name: string };
    likes: number;
    comments: number;
    createdAt: string;
}

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await apiClient.get('/api/community/all');
            setPosts(response.data.data?.posts || response.data.posts || response.data || []);
        } catch (error: any) {
            // Only show error for server errors, not for empty data
            if (error.response?.status !== 404) {
                console.error('Error fetching community posts:', error);
                if (error.response?.status >= 500) {
                    toast.error('Server error. Please try again later.');
                }
            }
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold text-secondary">Community Management</h1>
                    <p className="text-accent mt-1">Manage posts, comments, and groups</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-accent shadow-md">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-accent/30" />
                        <p>No community posts found</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-secondary">{post.author?.name}</h3>
                                        <p className="text-sm text-accent">{post.group?.name}</p>
                                    </div>
                                    <span className="text-sm text-accent">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-secondary">{post.content}</p>
                                <div className="flex items-center space-x-6 pt-4 border-t text-sm text-accent">
                                    <div className="flex items-center space-x-2">
                                        <Heart className="w-4 h-4" />
                                        <span>{post.likes || 0} likes</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{post.comments || 0} comments</span>
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
