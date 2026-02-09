import React from 'react';
import {
  View,   
  Text,
  ScrollView,   
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
       
export default function MyProgressScreen() {
  const router = useRouter();          

  const stats = [      
    { label: 'Bonus Points', value: '150', icon: 'star', color: '#8B5CF6' },
    { label: 'Courses Completed', value: '12', icon: 'book-outline', color: '#3B82F6' },
    { label: 'Events Attended', value: '8', icon: 'calendar-outline', color: '#10B981' },
    { label: 'Achievements', value: '6', icon: 'trophy-outline', color: '#EF4444' },
  ];    

  const achievements = [
    { title: 'First Step', description: 'Completed your first course', icon: '🎯', unlocked: true },
    { title: 'Dedicated Learner', description: '7-day learning streak', icon: '🔥', unlocked: true },
    { title: 'Community Member', description: 'Joined 5 groups', icon: '👥', unlocked: true },
    { title: 'Knowledge Seeker', description: 'Completed 10 courses', icon: '📚', unlocked: true },
    { title: 'Event Enthusiast', description: 'Attended 10 events', icon: '🎪', unlocked: false },
    { title: 'Master Learner', description: 'Completed 50 courses', icon: '🏆', unlocked: false },
  ];
    
  const recentActivity = [   
    { title: 'Completed "Meditation Basics"', time: '2 hours ago', icon: 'checkmark-circle', color: '#10B981' },
    { title: 'Joined "Spiritual Growth" group', time: '1 day ago', icon: 'people', color: '#3B82F6' },
    { title: 'Attended "Yoga Workshop"', time: '3 days ago', icon: 'calendar', color: '#F59E0B' },
    { title: 'Unlocked "Dedicated Learner"', time: '5 days ago', icon: 'trophy', color: '#EF4444' },
  ];
                                   
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" onPress={() => router.push('/(home)/menu')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Progress</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Bonus Points Card */}
        <TouchableOpacity 
          className="bg-gradient-to-r from-purple-600 to-pink-600 bg-purple-500 rounded-3xl p-6 mb-5 shadow-lg"
          onPress={() => router.push('/rewards')}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/80 text-xs mb-1">Your Bonus Points</Text>
              <Text className="text-5xl font-black text-white mb-1">150</Text>
              <Text className="text-white/90 text-sm font-semibold">
                Tap to view rewards & history
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-4">
              <Text className="text-5xl">🏆</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-4">
            <View className="bg-white/30 flex-1 rounded-full h-2 overflow-hidden">
              <View className="bg-white h-full rounded-full" style={{ width: '75%' }} />
            </View>
            <Text className="text-white/90 text-xs font-semibold">75%</Text>
          </View>
          <Text className="text-white/70 text-xs mt-2">50 points to next level</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {stats.map((stat, index) => (
            <View 
              key={index} 
              className="flex-1 min-w-[45%] bg-white p-4 rounded-xl border-l-4 items-center shadow-sm"
              style={{ borderLeftColor: stat.color }}
            >
              <Ionicons name={stat.icon as any} size={28} color={stat.color} />
              <Text className="text-[28px] font-bold text-gray-900 mt-2">{stat.value}</Text>
              <Text className="text-xs text-gray-500 text-center mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Achievements Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Achievements</Text>
          <View className="flex-row flex-wrap gap-3">
            {achievements.map((achievement, index) => (
              <View
                key={index}
                className={`flex-1 min-w-[45%] bg-white p-4 rounded-xl items-center shadow-sm relative ${
                  !achievement.unlocked ? 'opacity-50 bg-gray-100' : ''
                }`}
              >
                <Text className="text-4xl mb-2">{achievement.icon}</Text>
                <Text className="text-sm font-bold text-gray-900 text-center mb-1">{achievement.title}</Text>
                <Text className="text-[11px] text-gray-500 text-center">
                  {achievement.description}     
                </Text>
                {achievement.unlocked && (
                  <View className="absolute top-2 right-2">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
          {recentActivity.map((activity, index) => (
            <View key={index} className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
              <View 
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${activity.color}20` }}
              >
                <Ionicons name={activity.icon as any} size={20} color={activity.color} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-gray-900 mb-1">{activity.title}</Text>
                <Text className="text-[13px] text-gray-500">{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );                       
}
