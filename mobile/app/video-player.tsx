import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCourseStore } from '../store/courseStore';

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { markVideoComplete } = useCourseStore();

  const [isPlaying, setIsPlaying] = useState(false);

  // Parse params
  const courseTitle = params.courseTitle as string || 'Course';
  const courseColor = params.courseColor as string || '#8B5CF6';
  const videoTitle = params.videoTitle as string || 'Video';
  const videoDuration = params.videoDuration as string || '0:00';
  const videoUrl = params.videoUrl as string;
  const courseId = params.courseId as string;
  const videoId = params.videoId as string;

  const handlePlay = async () => {
    if (videoUrl) {
      // Mark video as complete when user starts watching
      if (courseId && videoId) {
        await markVideoComplete(courseId, videoId);
      }
      await WebBrowser.openBrowserAsync(videoUrl);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View
        className="flex-row items-center pt-[50px] px-4 pb-4"
        style={{ backgroundColor: courseColor }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {courseTitle}
          </Text>
          <Text className="text-xs text-white/80" numberOfLines={1}>
            {videoTitle}
          </Text>
        </View>
      </View>

      {/* Video Player */}
      <View className="flex-1 bg-black items-center justify-center">
        <View className="w-full bg-gray-900 items-center justify-center" style={{ height: width * 0.56 }}>
          {!isPlaying ? (
            <TouchableOpacity
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: courseColor + 'E6' }}
              onPress={handlePlay}
            >
              <Ionicons name="play" size={48} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-lg text-white mb-5">Video Playing...</Text>
              <TouchableOpacity
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: courseColor + 'E6' }}
                onPress={() => setIsPlaying(false)}
              >
                <Ionicons name="pause" size={36} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Video Info */}
      <View className="bg-gray-900 px-4 py-4">
        <Text className="text-xl font-bold text-white mb-2">{videoTitle}</Text>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">{videoDuration}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="videocam-outline" size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">Video</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="bg-gray-900 px-4 pb-6 pt-2">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
            style={{ backgroundColor: courseColor }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

