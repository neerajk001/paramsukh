import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';

interface Video {
  id: number;
  title: string;
  duration: string;
  thumbnailUrl?: string;
  completed: boolean;
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse course data from params
  const courseId = params.id as string;
  const courseTitle = params.title as string || 'Course';
  const courseColor = params.color as string || '#8B5CF6';
  const courseDuration = params.duration as string || '6 weeks';
  const totalVideos = parseInt(params.videos as string) || 4;

  // Generate sample videos - in real app, this would come from API
  const videos: Video[] = [
    { id: 1, title: 'Introduction to Physical Wellness', duration: '15:30', completed: true },
    { id: 2, title: 'Understanding Your Body', duration: '20:00', completed: true },
    { id: 3, title: 'Nutrition Basics', duration: '18:45', completed: false },
    { id: 4, title: 'Exercise Fundamentals', duration: '25:00', completed: false },
  ].slice(0, totalVideos);

  const completedVideos = videos.filter(v => v.completed).length;
  const progressPercentage = videos.length > 0 ? (completedVideos / videos.length) * 100 : 0;
  const allVideosCompleted = completedVideos === videos.length && videos.length > 0;

  const handleVideoPress = (video: Video) => {
    router.push({
      pathname: '/video-player',
      params: {
        courseId: courseId,
        courseTitle: courseTitle,
        courseColor: courseColor,
        videoId: video.id.toString(),
        videoTitle: video.title,
        videoDuration: video.duration,
      }
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <View className="px-4 pt-4 pb-6" style={{ backgroundColor: courseColor }}>
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mr-3">
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white mb-1">{courseTitle}</Text>
              <Text className="text-sm text-white/90">{courseDuration}</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View className="bg-white/20 rounded-lg p-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-white">Progress</Text>
              <Text className="text-sm font-bold text-white">{progressPercentage.toFixed(0)}%</Text>
            </View>
            <View className="h-2 bg-white/30 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full" 
                style={{ width: `${progressPercentage}%`, backgroundColor: '#FFFFFF' }} 
              />
            </View>
            <Text className="text-xs text-white/80 mt-2">
              {completedVideos} of {videos.length} videos completed
            </Text>
          </View>
        </View>

        {/* Videos Grid */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Course Videos</Text>
          
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => handleVideoPress(video)}
                activeOpacity={0.8}
              >
                {/* Video Thumbnail */}
                <View className="relative">
                  <View 
                    className="w-full rounded-t-xl items-center justify-center"
                    style={{ 
                      height: 120, 
                      backgroundColor: courseColor + '20' 
                    }}
                  >
                    {video.thumbnailUrl ? (
                      <Image 
                        source={{ uri: video.thumbnailUrl }} 
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                        <Ionicons name="play" size={32} color={courseColor} />
                      </View>
                    )}
                    {/* Play Button Overlay */}
                    <View className="absolute inset-0 items-center justify-center">
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: courseColor + 'E6' }}
                      >
                        <Ionicons name="play" size={24} color="#FFFFFF" />
                      </View>
                    </View>
                    {/* Duration Badge */}
                    <View 
                      className="absolute bottom-2 right-2 px-2 py-1 rounded"
                      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    >
                      <Text className="text-xs font-semibold text-white">{video.duration}</Text>
                    </View>
                  </View>
                  
                  {/* Completed Badge */}
                  {video.completed && (
                    <View 
                      className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                
                {/* Video Info */}
                <View className="p-3">
                  <Text 
                    className="text-base font-semibold mb-1" 
                    numberOfLines={2}
                    style={{ color: '#111827' }}
                  >
                    {video.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="videocam-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500">Video</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course Certification Section */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Course Certification</Text>
          
          <TouchableOpacity
            style={[
              styles.certificationCard,
              !allVideosCompleted && styles.certificationCardDisabled
            ]}
            onPress={() => {
              if (allVideosCompleted) {
                // Handle certification download/view
                router.push({
                  pathname: '/course-certificate',
                  params: {
                    courseId: courseId,
                    courseTitle: courseTitle,
                    courseColor: courseColor,
                  }
                });
              } else {
                // Show message about completing all videos
                const remaining = videos.length - completedVideos;
                Alert.alert(
                  'Certificate Locked',
                  `Please complete all ${videos.length} videos to unlock your certificate. You have ${remaining} video${remaining > 1 ? 's' : ''} remaining.`,
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={!allVideosCompleted}
            activeOpacity={allVideosCompleted ? 0.8 : 1}
          >
            <View className="flex-row items-center">
              {/* Certificate Icon */}
              <View 
                className="w-16 h-16 rounded-xl items-center justify-center mr-4"
                style={{ 
                  backgroundColor: allVideosCompleted ? courseColor + '20' : '#E5E7EB'
                }}
              >
                <Ionicons 
                  name={allVideosCompleted ? "trophy" : "lock-closed"} 
                  size={32} 
                  color={allVideosCompleted ? courseColor : '#9CA3AF'} 
                />
              </View>
              
              {/* Certification Info */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text 
                    className="text-lg font-bold"
                    style={{ color: allVideosCompleted ? '#111827' : '#9CA3AF' }}
                  >
                    Course Completion Certificate
                  </Text>
                  {!allVideosCompleted && (
                    <View className="px-2 py-0.5 rounded bg-gray-200">
                      <Text className="text-xs font-semibold text-gray-600">Locked</Text>
                    </View>
                  )}
                </View>
                <Text 
                  className="text-sm"
                  style={{ color: allVideosCompleted ? '#6B7280' : '#9CA3AF' }}
                >
                  {allVideosCompleted 
                    ? 'Download your certificate of completion'
                    : `Complete all ${videos.length} videos to unlock`
                  }
                </Text>
              </View>
              
              {/* Arrow Icon */}
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={allVideosCompleted ? courseColor : '#9CA3AF'} 
              />
            </View>
            
            {/* Progress Indicator */}
            {!allVideosCompleted && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-medium text-gray-500">
                    Progress to Certification
                  </Text>
                  <Text className="text-xs font-semibold text-gray-600">
                    {completedVideos}/{videos.length} videos
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${progressPercentage}%`, 
                      backgroundColor: courseColor 
                    }} 
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  certificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  certificationCardDisabled: {
    opacity: 0.7,
    borderColor: '#E5E7EB',
  },
});
