import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,  
  Image,          
  Platform,          
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Podcast {
  id: number;
  title: string;
  host: string;
  duration: string;
  category: string;
  description: string;
  thumbnail: string;
  isPlaying: boolean;
}

export default function PodcastsScreen() {
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([
    {
      id: 1,
      title: 'Morning Meditation Guide',
      host: 'Swami Anand',
      duration: '25:30',
      category: 'Meditation',
      description: 'Start your day with peaceful meditation practices',
      thumbnail: '🧘',
      isPlaying: false,
    },
    {
      id: 2,
      title: 'Spiritual Wisdom Talks',
      host: 'Guruji Prakash',
      duration: '45:20',
      category: 'Discourse',
      description: 'Deep dive into ancient spiritual teachings',
      thumbnail: '📿',
      isPlaying: false,        
    },
    {
      id: 3,
      title: 'Bhagavad Gita Explained',   
      host: 'Dr. Sharma',
      duration: '60:15',    
      category: 'Scripture',
      description: 'Chapter by chapter analysis of the Gita',
      thumbnail: '📖',
      isPlaying: false,
    },                   
    {
      id: 4,
      title: 'Mindfulness in Daily Life',   
      host: 'Priya Nair',   
      duration: '30:45',
      category: 'Mindfulness',  
      description: 'Practical tips for mindful living',        
      thumbnail: '🌸',
      isPlaying: false,
    },        
    {
      id: 5,
      title: 'Mantra Chanting Sessions',   
      host: 'Pandit Kumar',  
      duration: '40:00',
      category: 'Mantra',
      description: 'Powerful mantras for peace and prosperity',
      thumbnail: '🕉️',
      isPlaying: false,
    },
  ]);    

  const categories = ['All', 'Meditation', 'Discourse', 'Scripture', 'Mindfulness', 'Mantra'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const togglePlay = (id: number) => {
    setPodcasts((prev) =>
      prev.map((podcast) =>
        podcast.id === id
          ? { ...podcast, isPlaying: !podcast.isPlaying }
          : { ...podcast, isPlaying: false }              
      )
    );   
  };                      
  const filteredPodcasts =                    
    selectedCategory === 'All'  
      ? podcasts
      : podcasts.filter((p) => p.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Podcasts</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="search" size={24} color="#111827" />
        </TouchableOpacity>
      </View>              
      
      {/* Categories */}
      <View className="bg-white border-b border-gray-200 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`px-4 py-2 rounded-[20px] border ${
                selectedCategory === category 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-gray-100 border-gray-200'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === category ? 'text-white' : 'text-gray-500'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Podcasts List */}
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {filteredPodcasts.map((podcast) => (
          <View key={podcast.id} className="flex-row bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center mr-4 relative">
              <Text className="text-4xl">{podcast.thumbnail}</Text>
              {podcast.isPlaying && (
                <View className="absolute bottom-2 right-2 flex-row gap-0.5 items-end">
                  <View className="w-[3px] h-3 bg-blue-500 rounded-sm" />
                  <View className="w-[3px] h-2 bg-blue-500 rounded-sm" />
                  <View className="w-[3px] h-[14px] bg-blue-500 rounded-sm" />
                </View>
              )}
            </View>

            <View className="flex-1 mr-3">
              <Text className="text-base font-bold text-gray-900 mb-1">{podcast.title}</Text>
              <Text className="text-sm text-gray-500 mb-1.5">{podcast.host}</Text>
              <Text className="text-[13px] text-gray-400 mb-2">{podcast.description}</Text>

              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-500">{podcast.duration}</Text>
                </View>
                <View className="px-2 py-1 rounded-xl bg-blue-50">
                  <Text className="text-[11px] font-semibold text-blue-500">{podcast.category}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${
                podcast.isPlaying ? 'bg-blue-700' : 'bg-blue-500'
              }`}
              onPress={() => togglePlay(podcast.id)}
            >
              <Ionicons
                name={podcast.isPlaying ? 'pause' : 'play'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        ))}

        {filteredPodcasts.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="mic-off-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">No Podcasts Found</Text>
            <Text className="text-sm text-gray-500 text-center">
              Try selecting a different category
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
