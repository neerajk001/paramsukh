import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import AssessmentModal from '@/components/AssessmentModal';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

interface Post {
  id: number;
  user: string;
  userAvatar: string;
  content: string;
  image?: string;
  video?: string;
  audio?: string;
  postType?: 'image' | 'video' | 'audio' | 'text';
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  liked: boolean;
}

type ViewType = 'feed' | 'groups' | 'message';

export default function CommunityScreen() {     
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [postType, setPostType] = useState<'feed' | 'channel'>('feed');
  const [showPostTypeFilter, setShowPostTypeFilter] = useState(false);
  const [selectedPostFilter, setSelectedPostFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'text'>('all');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // Get user's initials
  const getUserInitial = () => {
    if (user?.displayName) {
      const name = user.displayName.trim();
      const words = name.split(/\s+/).filter(word => word.length > 0);
      if (words.length === 0) return 'U';
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return 'U';
  };

  const navigateToProfile = () => {
    router.push('/profile-menu');
  };

  const navigateToNotifications = () => {
    router.push('/(home)/notifications');
  };

  const [posts, setPosts] = useState<Post[]>([
    {                              
      id: 1,                              
      user: 'Raj Kumar',    
      userAvatar: '👤',                    
      content: 'Just completed my morning meditation session. Feeling so peaceful and energized! 🧘‍♂️✨',
      image: '🖼️',
      postType: 'image',
      likes: 42,
      comments: 8,
      shares: 3,
      timeAgo: '2h ago',
      liked: false,
    },
    {
      id: 2,
      user: 'Priya Sharma',
      userAvatar: '👤',
      content: 'Attended an amazing spiritual discourse today. The teachings were truly enlightening! 🙏',
      postType: 'text',
      likes: 67,
      comments: 15,
      shares: 7,
      timeAgo: '5h ago',
      liked: true,
    },
    {
      id: 3,
      user: 'Amit Patel',
      userAvatar: '👤',
      content: 'Sharing some beautiful moments from today\'s temple visit. The atmosphere was divine! 🛕',
      image: '🖼️',
      postType: 'image',
      likes: 89,
      comments: 22,
      shares: 12,
      timeAgo: '1d ago',                        
      liked: false,
    },
    {
      id: 4,
      user: 'Sita Devi',
      userAvatar: '👤',
      content: 'Listening to beautiful bhajans today 🎵',
      video: '🎥',
      postType: 'video',
      likes: 34,
      comments: 5,
      shares: 2,
      timeAgo: '3h ago',
      liked: false,
    },
    {
      id: 5,
      user: 'Krishna Das',
      userAvatar: '👤',
      content: 'Morning meditation audio guide 🎧',
      audio: '🎵',
      postType: 'audio',
      likes: 56,
      comments: 12,
      shares: 8,
      timeAgo: '6h ago',
      liked: true,
    },
  ]);                         

  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [showPostTypeSelector, setShowPostTypeSelector] = useState(false);
                                       
  useEffect(() => {                                                     
    checkAssessmentStatus();            
  }, []);

  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: showSidebar ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSidebar]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setShowSidebar(false);
  };        
  const checkAssessmentStatus = async () => {
    try {                                                              
      const completed = await AsyncStorage.getItem('assessment_completed');
      setAssessmentCompleted(completed === 'true');
    } catch (error) {
      console.error('Error checking assessment status:', error);
    } 
  };          

  const handleAssessmentComplete = async (answers: Record<string, string | boolean>) => {
    try {
      await AsyncStorage.setItem('assessment_completed', 'true');
      await AsyncStorage.setItem('assessment_answers', JSON.stringify(answers));
      setAssessmentCompleted(true);
      setShowAssessment(false);
      console.log('Assessment completed:', answers);               
    } catch (error) {
      console.error('Error saving assessment:', error); 
    }
  };                 
 
 const handlePickImage = async () => {
    try {     
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType('image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const publishPost = (type: 'feed' | 'channel') => {
    const newPost: Post = {
      id: posts.length + 1,
      user: 'You',
      userAvatar: '👤',
      content: postContent,
      image: mediaType === 'image' ? selectedMedia || undefined : undefined,
      video: mediaType === 'video' ? selectedMedia || undefined : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      timeAgo: 'Just now',
      liked: false,
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setSelectedMedia(null);
    setMediaType(null);
    setPostType('feed');
    setShowCreatePost(false);
    setShowPostTypeSelector(false);
    
    // Show confirmation based on post type
    Alert.alert(
      'Post Published',
      type === 'feed' 
        ? 'Your post has been published to the feed!' 
        : 'Your post has been published to the channel!',
      [{ text: 'OK' }]
    );
  };

  const handleCreatePost = () => {
    if (!postContent.trim() && !selectedMedia) {
      Alert.alert('Empty Post', 'Please add some content or media to your post');
      return;
    }

    // Show post type selector
    setShowPostTypeSelector(true);
  };

  const handlePostTypeSelection = (type: 'feed' | 'channel') => {
    setPostType(type);
    publishPost(type);
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'feed':
        return 'Feed';
      case 'groups':
        return 'Groups';
      case 'message':
        return 'Messages';
      default:
        return 'Community';
    }
  };

  const handlePostFilterSelect = (filter: 'all' | 'image' | 'video' | 'audio' | 'text') => {
    setSelectedPostFilter(filter);
    setShowPostTypeFilter(false);
  };

  const getFilteredPosts = () => {
    if (selectedPostFilter === 'all') {
      return posts;
    }
    return posts.filter(post => post.postType === selectedPostFilter);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header with Menu Button */}
      <View style={styles.customHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{getViewTitle()}</Text>
          </View>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={navigateToNotifications}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#111827" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.profileButton}
              onPress={navigateToProfile}
              activeOpacity={0.7}
            >
              <View style={styles.profileIconContainer}>
                <Text style={styles.profileIconText}>{getUserInitial()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnimation }],
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={() => setShowSidebar(false)}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={[
              styles.sidebarItem,
              currentView === 'feed' && styles.sidebarItemActive,
            ]}
            onPress={() => handleViewChange('feed')}
          >
            <Ionicons
              name="home"
              size={24}
              color={currentView === 'feed' ? '#3B82F6' : '#6B7280'}
            />
            <Text
              style={[
                styles.sidebarItemText,
                currentView === 'feed' && styles.sidebarItemTextActive,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Sections</Text>
            
            <TouchableOpacity
              style={[
                styles.sidebarItem,
                currentView === 'groups' && styles.sidebarItemActive,
              ]}
              onPress={() => handleViewChange('groups')}
            >
              <Ionicons
                name="people"
                size={24}
                color={currentView === 'groups' ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.sidebarItemText,
                  currentView === 'groups' && styles.sidebarItemTextActive,
                ]}
              >
                Groups
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sidebarItem,
                currentView === 'message' && styles.sidebarItemActive,
              ]}
              onPress={() => handleViewChange('message')}
            >
              <Ionicons
                name="chatbubbles"
                size={24}
                color={currentView === 'message' ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.sidebarItemText,
                  currentView === 'message' && styles.sidebarItemTextActive,
                ]}
              >
                Messages
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Assessment Banner - Show if not completed */}
        {!assessmentCompleted && (
          <TouchableOpacity 
            style={styles.assessmentBanner}
            onPress={() => setShowAssessment(true)}
            activeOpacity={0.8}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconContainer}>
                <Ionicons name="clipboard-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Complete Your Assessment</Text>
                <Text style={styles.bannerSubtitle}>Help us personalize your experience</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Filter Buttons - Only show on Feed view */}
        {currentView === 'feed' && (
          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowPostTypeFilter(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>post-type</Text>
              <Ionicons name="chevron-down" size={16} color="#111827" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // Navigate to membership or handle membership filter
                router.push('/(home)/membership-new');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>membership</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTagFilter(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>tag</Text>
              <Ionicons name="chevron-down" size={16} color="#111827" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Create Post Button - Only show on Feed view */}
        {currentView === 'feed' && (
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => setShowCreatePost(true)}
            activeOpacity={0.8}
          >
            <View style={styles.createPostContent}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
              <Text style={styles.createPostText}>Share your thoughts, photos, or videos...</Text>
            </View>
            <View style={styles.mediaIcons}>
              <Ionicons name="image-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Ionicons name="videocam-outline" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        )}

        {/* View Content Based on Current View */}
        {currentView === 'feed' && (
          <>
            {/* Posts Feed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Community Posts</Text>
              
              {getFilteredPosts().map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>{post.userAvatar}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.timeAgo}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Post Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Post Image/Video */}
              {post.image && (
                <View style={styles.postMedia}>
                  <Text style={styles.mediaPlaceholder}>{post.image}</Text>
                  <Text style={styles.mediaLabel}>Image</Text>
                </View>
              )}
              {post.video && (
                <View style={styles.postMedia}>
                  <Text style={styles.mediaPlaceholder}>🎥</Text>
                  <Text style={styles.mediaLabel}>Video</Text>
                </View>
              )}
              {post.audio && (
                <View style={styles.postMedia}>
                  <Text style={styles.mediaPlaceholder}>🎵</Text>
                  <Text style={styles.mediaLabel}>Audio</Text>
                </View>
              )}

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleLike(post.id)}
                >
                  <Ionicons 
                    name={post.liked ? "heart" : "heart-outline"} 
                    size={22} 
                    color={post.liked ? "#EF4444" : "#6B7280"} 
                  />
                  <Text style={[styles.actionText, post.liked && styles.likedText]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={20} color="#6B7280" />
                  <Text style={styles.actionText}>{post.shares}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
          </>
        )}

        {currentView === 'groups' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Groups</Text>
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No groups yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Join or create groups to connect with others
              </Text>
            </View>
          </View>
        )}

        {currentView === 'message' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start a conversation with community members
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreatePost(false);
          setShowPostTypeSelector(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => {
                setShowCreatePost(false);
                setShowPostTypeSelector(false);
              }}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#9CA3AF"
              multiline
              value={postContent}
              onChangeText={setPostContent}
              maxLength={500}
            />

            {selectedMedia && (
              <View style={styles.selectedMediaContainer}>
                <View style={styles.selectedMediaPreview}>
                  <Text style={styles.selectedMediaText}>
                    {mediaType === 'image' ? '📷 Image selected' : '🎥 Video selected'}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setSelectedMedia(null);
                    setMediaType(null);
                  }}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={handlePickImage}
              >
                <Ionicons name="image-outline" size={24} color="#3B82F6" />
                <Text style={styles.mediaButtonText}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={handlePickVideo}
              >
                <Ionicons name="videocam-outline" size={24} color="#3B82F6" />
                <Text style={styles.mediaButtonText}>Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.publishButton,
                (!postContent.trim() && !selectedMedia) && styles.publishButtonDisabled
              ]}
              onPress={handleCreatePost}
              disabled={!postContent.trim() && !selectedMedia}
            >
              <Text style={styles.publishButtonText}>Publish Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Post Type Filter Bottom Sheet */}
      <Modal
        visible={showPostTypeFilter}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostTypeFilter(false)}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={styles.filterModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPostTypeFilter(false)}
          />
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter by Post Type</Text>
              <TouchableOpacity onPress={() => setShowPostTypeFilter(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPostFilter === 'all' && styles.filterOptionActive
                ]}
                onPress={() => handlePostFilterSelect('all')}
              >
                <Ionicons
                  name="grid-outline"
                  size={24}
                  color={selectedPostFilter === 'all' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPostFilter === 'all' && styles.filterOptionTextActive
                  ]}
                >
                  All Posts
                </Text>
                {selectedPostFilter === 'all' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPostFilter === 'image' && styles.filterOptionActive
                ]}
                onPress={() => handlePostFilterSelect('image')}
              >
                <Ionicons
                  name="image-outline"
                  size={24}
                  color={selectedPostFilter === 'image' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPostFilter === 'image' && styles.filterOptionTextActive
                  ]}
                >
                  Image
                </Text>
                {selectedPostFilter === 'image' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPostFilter === 'video' && styles.filterOptionActive
                ]}
                onPress={() => handlePostFilterSelect('video')}
              >
                <Ionicons
                  name="videocam-outline"
                  size={24}
                  color={selectedPostFilter === 'video' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPostFilter === 'video' && styles.filterOptionTextActive
                  ]}
                >
                  Video
                </Text>
                {selectedPostFilter === 'video' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPostFilter === 'audio' && styles.filterOptionActive
                ]}
                onPress={() => handlePostFilterSelect('audio')}
              >
                <Ionicons
                  name="musical-notes-outline"
                  size={24}
                  color={selectedPostFilter === 'audio' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPostFilter === 'audio' && styles.filterOptionTextActive
                  ]}
                >
                  Audio
                </Text>
                {selectedPostFilter === 'audio' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPostFilter === 'text' && styles.filterOptionActive
                ]}
                onPress={() => handlePostFilterSelect('text')}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={selectedPostFilter === 'text' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPostFilter === 'text' && styles.filterOptionTextActive
                  ]}
                >
                  Text
                </Text>
                {selectedPostFilter === 'text' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tag Filter Bottom Sheet */}
      <Modal
        visible={showTagFilter}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTagFilter(false)}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={styles.filterModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTagFilter(false)}
          />
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter by Tag</Text>
              <TouchableOpacity onPress={() => setShowTagFilter(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'all' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('all');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="pricetags-outline"
                  size={24}
                  color={selectedTag === 'all' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'all' && styles.filterOptionTextActive
                  ]}
                >
                  All Tags
                </Text>
                {selectedTag === 'all' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'meditation' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('meditation');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={24}
                  color={selectedTag === 'meditation' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'meditation' && styles.filterOptionTextActive
                  ]}
                >
                  Meditation
                </Text>
                {selectedTag === 'meditation' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'spiritual' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('spiritual');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="flower-outline"
                  size={24}
                  color={selectedTag === 'spiritual' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'spiritual' && styles.filterOptionTextActive
                  ]}
                >
                  Spiritual
                </Text>
                {selectedTag === 'spiritual' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'wellness' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('wellness');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="fitness-outline"
                  size={24}
                  color={selectedTag === 'wellness' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'wellness' && styles.filterOptionTextActive
                  ]}
                >
                  Wellness
                </Text>
                {selectedTag === 'wellness' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'learning' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('learning');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="book-outline"
                  size={24}
                  color={selectedTag === 'learning' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'learning' && styles.filterOptionTextActive
                  ]}
                >
                  Learning
                </Text>
                {selectedTag === 'learning' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTag === 'community' && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedTag('community');
                  setShowTagFilter(false);
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={selectedTag === 'community' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTag === 'community' && styles.filterOptionTextActive
                  ]}
                >
                  Community
                </Text>
                {selectedTag === 'community' && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Type Selector Modal */}
      <Modal
        visible={showPostTypeSelector}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPostTypeSelector(false)}
      >
        <View style={styles.postTypeModalOverlay}>
          <View style={styles.postTypeModalContent}>
            <Text style={styles.postTypeModalTitle}>Where would you like to post?</Text>
            
            <TouchableOpacity
              style={styles.postTypeOption}
              onPress={() => handlePostTypeSelection('feed')}
            >
              <View style={styles.postTypeOptionIcon}>
                <Ionicons name="home" size={24} color="#3B82F6" />
              </View>
              <View style={styles.postTypeOptionContent}>
                <Text style={styles.postTypeOptionTitle}>Post on Feed</Text>
                <Text style={styles.postTypeOptionDescription}>
                  Share with the entire community
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postTypeOption}
              onPress={() => handlePostTypeSelection('channel')}
            >
              <View style={styles.postTypeOptionIcon}>
                <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
              </View>
              <View style={styles.postTypeOptionContent}>
                <Text style={styles.postTypeOptionTitle}>Post in Channel</Text>
                <Text style={styles.postTypeOptionDescription}>
                  Share in a specific group channel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postTypeCancelButton}
              onPress={() => setShowPostTypeSelector(false)}
            >
              <Text style={styles.postTypeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assessment Modal */}
      <AssessmentModal
        visible={showAssessment}
        onClose={() => setShowAssessment(false)}
        onComplete={handleAssessmentComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  customHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 4,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileButton: {
    padding: 4,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  profileIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  sidebarContent: {
    paddingTop: 20,
  },
  sidebarSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  sidebarItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  sidebarItemTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  postTypeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  postTypeModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  postTypeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  postTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postTypeOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  postTypeOptionContent: {
    flex: 1,
  },
  postTypeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  postTypeOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  postTypeCancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  postTypeCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  assessmentBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#60A5FA',
  },
  createPostButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  createPostText: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 12,
  },
  mediaIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  postMedia: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mediaPlaceholder: {
    fontSize: 48,
    marginBottom: 8,
  },
  mediaLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  likedText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  selectedMediaContainer: {
    marginBottom: 16,
  },
  selectedMediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedMediaText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mediaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  publishButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  filterOptionsContainer: {
    gap: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  filterOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
