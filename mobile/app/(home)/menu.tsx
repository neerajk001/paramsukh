import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';

export default function HomeTab() {
  const router = useRouter();

  const handleWatchIntro = () => {
    Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      <Header />
    
      <ScrollView 
        className="px-5 pt-5" 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >  
        {/* Intro Video Section */}
        <View className="bg-gray-900 rounded-3xl p-5 mb-6 shadow-lg">
          <View className="w-full h-44 bg-gray-700 rounded-2xl items-center justify-center mb-4">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="play" size={32} color="#FFFFFF" />
            </View>
          </View>
          <View className="items-start">
            <Text className="text-2xl font-bold text-white mb-2">Welcome to ParamSukh</Text>
            <Text className="text-[15px] text-gray-300 leading-[22px] mb-4">
              Your spiritual companion for meditation, learning, and community connection. Discover courses, join events, and grow together.
            </Text>
            <TouchableOpacity className="flex-row items-center gap-2 bg-blue-500 py-3 px-5 rounded-xl" onPress={handleWatchIntro}>
              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
              <Text className="text-[15px] font-semibold text-white">Watch Intro</Text>
            </TouchableOpacity>
          </View>
        </View>
          
        {/* App Overview */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">What We Offer</Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="w-[48%] bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mb-3">
                <Ionicons name="book" size={28} color="#3B82F6" />
              </View>
              <Text className="text-[15px] font-bold text-gray-900 mb-1">Courses</Text>
              <Text className="text-xs text-gray-500 text-center">Learn at your own pace</Text>
            </View>
            <View className="w-[48%] bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-14 h-14 rounded-2xl bg-green-50 items-center justify-center mb-3">
                <Ionicons name="people" size={28} color="#10B981" />
              </View>
              <Text className="text-[15px] font-bold text-gray-900 mb-1">Community</Text>
              <Text className="text-xs text-gray-500 text-center">Connect with others</Text>
            </View>
            <View className="w-[48%] bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-14 h-14 rounded-2xl bg-yellow-50 items-center justify-center mb-3">
                <Ionicons name="calendar" size={28} color="#F59E0B" />
              </View>
              <Text className="text-[15px] font-bold text-gray-900 mb-1">Events</Text>
              <Text className="text-xs text-gray-500 text-center">Join live sessions</Text>
            </View>
            <View className="w-[48%] bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-14 h-14 rounded-2xl bg-pink-50 items-center justify-center mb-3">
                <Ionicons name="headset" size={28} color="#EC4899" />
              </View>
              <Text className="text-[15px] font-bold text-gray-900 mb-1">Podcasts</Text>
              <Text className="text-xs text-gray-500 text-center">Audio wisdom</Text>
            </View> 
          </View>
        </View>

        <Text className="text-sm font-semibold text-gray-600 mb-3">Quick Access</Text>

        {/* Sections: Counseling, Shops, Donations, Podcasts */}   
        <View className="gap-2.5">
          <TouchableOpacity className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3" onPress={() => router.push('/counseling')}>
            <View className="w-11 h-11 rounded-xl bg-purple-100 items-center justify-center">
              <Ionicons name="people" size={22} color="#8B5CF6" />
            </View>
            <View className="flex-1"> 
              <Text className="text-base font-bold text-gray-900">Counseling</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">Book 1-on-1 guidance sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
                  
          <TouchableOpacity className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3" onPress={() => router.push('/shops')}>
            <View className="w-11 h-11 rounded-xl bg-gray-100 items-center justify-center">
              <Text className="text-[22px]">🛍️</Text>    
            </View>       
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">Shops</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">Pooja items, idols, books & frames</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3" onPress={() => router.push('/donations')}>
            <View className="w-11 h-11 rounded-xl bg-gray-100 items-center justify-center">
              <Text className="text-[22px]">💝</Text>
            </View>  
            <View className="flex-1">  
              <Text className="text-base font-bold text-gray-900">Donations</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">Support ParamSukh initiatives</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3" onPress={() => router.push('/(home)/podcasts')}>
            <View className="w-11 h-11 rounded-xl bg-gray-100 items-center justify-center">
              <Text className="text-[22px]">🎙️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">Podcasts</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">Audio talks and meditations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3" onPress={() => router.push('/rewards')}>
            <View className="w-11 h-11 rounded-xl bg-yellow-100 items-center justify-center">
              <Ionicons name="trophy" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">Rewards</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">Bonus points & special gifts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


