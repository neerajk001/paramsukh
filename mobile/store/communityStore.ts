import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface Author {
    _id: string;
    displayName: string;
    photoURL?: string;
    subscriptionPlan?: string;
}

export interface Post {
    _id: string;
    content: string;
    images?: string[];
    video?: string;
    audio?: string;
    postType?: 'image' | 'video' | 'audio' | 'text';
    likeCount: number;
    commentCount: number;
    isPinned: boolean;
    userLiked: boolean;
    author: Author;
    createdAt: string;
    updatedAt: string;
    timeAgo?: string; // Calculated on frontend
}

export interface Group {
    _id: string;
    name: string;
    description?: string;
    memberCount: number;
    coverImage?: string;
    course: {
        _id: string;
        title: string;
        category: string;
        thumbnail?: string;
    } | string;
    joinedAt: string;
    role: 'member' | 'moderator' | 'admin';
}

export interface Comment {
    _id: string;
    content: string;
    author: Author;
    likeCount: number;
    userLiked: boolean;
    createdAt: string;
    timeAgo?: string;
}

interface CommunityState {
    posts: Post[];
    groups: Group[];
    currentGroup: Group | null;
    comments: { [postId: string]: Comment[] }; // Store comments by postId
    isLoading: boolean;
    error: string | null;

    fetchMyGroups: () => Promise<void>;
    fetchGroupPosts: (groupId: string, page?: number) => Promise<void>;
    createPost: (groupId: string, content: string, images?: string[]) => Promise<boolean>;
    togglePostLike: (postId: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    uploadMedia: (uri: string, type: 'image' | 'video') => Promise<string | null>;
    fetchPostComments: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string) => Promise<boolean>;
    toggleCommentLike: (commentId: string, postId: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
    posts: [],
    groups: [],
    currentGroup: null,
    comments: {}, // Initialize comments object
    isLoading: false,
    error: null,

    fetchMyGroups: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/community/my-groups`);
            if (response.data.success) {
                set({ groups: response.data.groups, isLoading: false });
            } else {
                set({ groups: [], isLoading: false, error: response.data.message });
            }
        } catch (error: any) {
            console.error('Fetch Groups Error:', error);
            set({ groups: [], isLoading: false, error: 'Failed to load groups' });
        }
    },

    fetchGroupPosts: async (groupId: string, page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/community/groups/${groupId}/posts`, {
                params: { page }
            });
            if (response.data.success) {
                // If page 1, replace posts. If > 1, append (for pagination logic if implemented)
                const newPosts = response.data.posts;
                set(state => ({
                    posts: page === 1 ? newPosts : [...state.posts, ...newPosts],
                    isLoading: false
                }));
            } else {
                set({ isLoading: false, error: 'Failed to load posts' });
            }
        } catch (error: any) {
            console.error('Fetch Posts Error:', error);
            set({ isLoading: false, error: 'Failed to load posts' });
        }
    },

    uploadMedia: async (uri: string, type: 'image' | 'video') => {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'upload';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : type === 'image' ? 'jpg' : 'mp4';

        // React Native specific FormData append - use type assertion to bypass TS check
        formData.append('file', {
            uri,
            name: `upload.${ext}`,
            type: type === 'image' ? `image/${ext}` : `video/${ext}`
        } as any);

        const endpoint = type === 'image' ? '/upload/image?folder=community' : '/upload/video?folder=community_videos';

        try {
            const response = await axios.post(`${API_URL}${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                return response.data.data.url;
            }
            return null;
        } catch (error: any) {
            console.error('Upload Media Error:', error);
            return null;
        }
    },

    createPost: async (groupId: string, content: string, images?: string[]) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/community/groups/${groupId}/posts`, {
                content,
                images
            });

            if (response.data.success) {
                const newPost = response.data.post;
                // Optimistically add to top of feed
                set(state => ({
                    posts: [newPost, ...state.posts],
                    isLoading: false
                }));
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Create Post Error:', error);
            set({ isLoading: false, error: 'Failed to create post' });
            return false;
        }
    },

    togglePostLike: async (postId: string) => {
        // Optimistic update
        set(state => ({
            posts: state.posts.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        userLiked: !p.userLiked,
                        likeCount: p.userLiked ? p.likeCount - 1 : p.likeCount + 1
                    };
                }
                return p;
            })
        }));

        try {
            await axios.post(`${API_URL}/community/posts/${postId}/like`);
            // Backend handles actual logic
        } catch (error) {
            console.error('Like Post Error:', error);
            // Revert changes on error
            set(state => ({
                posts: state.posts.map(p => {
                    if (p._id === postId) {
                        return {
                            ...p,
                            userLiked: !p.userLiked,
                            likeCount: p.userLiked ? p.likeCount - 1 : p.likeCount + 1
                        };
                    }
                    return p;
                })
            }));
        }
    },

    deletePost: async (postId: string) => {
        // Optimistic update
        const previousPosts = get().posts;
        set(state => ({
            posts: state.posts.filter(p => p._id !== postId)
        }));

        try {
            await axios.delete(`${API_URL}/community/posts/${postId}`);
        } catch (error) {
            console.error('Delete Post Error:', error);
            // Revert
            set({ posts: previousPosts });
        }
    },

    fetchPostComments: async (postId: string) => {
        try {
            const response = await axios.get(`${API_URL}/community/posts/${postId}/comments`);
            if (response.data.success) {
                set(state => ({
                    comments: {
                        ...state.comments,
                        [postId]: response.data.comments
                    }
                }));
            }
        } catch (error) {
            console.error('Fetch Comments Error:', error);
        }
    },

    addComment: async (postId: string, content: string) => {
        try {
            const response = await axios.post(`${API_URL}/community/posts/${postId}/comments`, {
                content
            });

            if (response.data.success) {
                // Add new comment to the list
                const newComment = response.data.comment;
                set(state => ({
                    comments: {
                        ...state.comments,
                        [postId]: [...(state.comments[postId] || []), newComment]
                    },
                    // Update comment count on the post
                    posts: state.posts.map(p =>
                        p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
                    )
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Add Comment Error:', error);
            return false;
        }
    },

    toggleCommentLike: async (commentId: string, postId: string) => {
        try {
            await axios.post(`${API_URL}/community/comments/${commentId}/like`);

            // Update comment like status
            set(state => ({
                comments: {
                    ...state.comments,
                    [postId]: state.comments[postId]?.map(c => {
                        if (c._id === commentId) {
                            return {
                                ...c,
                                userLiked: !c.userLiked,
                                likeCount: c.userLiked ? c.likeCount - 1 : c.likeCount + 1
                            };
                        }
                        return c;
                    }) || []
                }
            }));
        } catch (error) {
            console.error('Toggle Comment Like Error:', error);
        }
    }
}));
