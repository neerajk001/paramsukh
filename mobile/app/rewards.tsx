import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function RewardsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'rewards' | 'history'>('rewards');

  // User's current bonus points
  const totalPoints = 150;
  const currentLevel = 'Gold Member';
  const nextLevelPoints = 200;

  // Points history
  const pointsHistory = [
    {
      id: 1,
      activity: 'Completed Physical Wellness Course',
      points: 10,
      date: '2 days ago',
      icon: 'trophy',
      color: '#10B981',
    },
    {
      id: 2,
      activity: 'Attended Live Event',
      points: 10,
      date: '5 days ago',
      icon: 'calendar',
      color: '#F59E0B',
    },
    {
      id: 3,
      activity: '7-Day Learning Streak',
      points: 15,
      date: '1 week ago',
      icon: 'flame',
      color: '#EF4444',
    },
    {
      id: 4,
      activity: 'Completed Financial Wellness Module',
      points: 10,
      date: '2 weeks ago',
      icon: 'trophy',
      color: '#10B981',
    },
    {
      id: 5,
      activity: 'Referred a Friend',
      points: 20,
      date: '2 weeks ago',
      icon: 'people',
      color: '#3B82F6',
    },
    {
      id: 6,
      activity: 'First Course Completion',
      points: 10,
      date: '3 weeks ago',
      icon: 'star',
      color: '#F59E0B',
    },
  ];

  // Reward catalog
  const rewards = [
    {
      id: 1,
      title: 'Bronze Badge',
      description: 'Achievement badge for your profile',
      points: 50,
      emoji: '🥉',
      color: '#CD7F32',
      bgColor: '#FEF3C7',
      category: 'Badge',
      available: true,
    },
    {
      id: 2,
      title: 'Silver Badge',
      description: 'Exclusive silver achievement badge',
      points: 100,
      emoji: '🥈',
      color: '#C0C0C0',
      bgColor: '#F3F4F6',
      category: 'Badge',
      available: true,
    },
    {
      id: 3,
      title: 'Gold Badge',
      description: 'Premium gold achievement badge',
      points: 150,
      emoji: '🥇',
      color: '#FFD700',
      bgColor: '#FEF3C7',
      category: 'Badge',
      available: true,
    },
    {
      id: 4,
      title: 'Spiritual Gift Box',
      description: 'Curated spiritual items and books',
      points: 200,
      emoji: '🎁',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      category: 'Gift',
      available: false,
    },
    {
      id: 5,
      title: 'Premium Event Pass',
      description: 'Free entry to next premium event',
      points: 250,
      emoji: '🎟️',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      category: 'Benefit',
      available: false,
    },
    {
      id: 6,
      title: 'Meditation Essentials Kit',
      description: 'Incense, mala beads, and meditation cushion',
      points: 300,
      emoji: '🧘',
      color: '#10B981',
      bgColor: '#ECFDF5',
      category: 'Gift',
      available: false,
    },
    {
      id: 7,
      title: 'Diamond Badge',
      description: 'Ultimate achievement recognition',
      points: 500,
      emoji: '💎',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      category: 'Badge',
      available: false,
    },
    {
      id: 8,
      title: 'Personalized Consultation',
      description: '1-on-1 session with Gurudev (Free)',
      points: 1000,
      emoji: '🙏',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      category: 'Benefit',
      available: false,
    },
  ];

  const progressPercentage = (totalPoints / nextLevelPoints) * 100;
  const availableRewards = rewards.filter(r => r.available);
  const lockedRewards = rewards.filter(r => !r.available);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Bonus Points</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Points Summary Card */}
          <View className="bg-gradient-to-br from-purple-600 to-pink-600 bg-purple-500 rounded-3xl p-6 mb-5 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white/80 text-sm mb-1">Your Balance</Text>
                <Text className="text-5xl font-black text-white">{totalPoints}</Text>
                <Text className="text-white/90 text-base font-semibold mt-1">Bonus Points</Text>
              </View>
              <View className="items-center bg-white/20 rounded-2xl p-4">
                <Text className="text-6xl">🏆</Text>
              </View>
            </View>
            
            <View className="bg-white/20 rounded-xl p-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/90 text-sm font-semibold">{currentLevel}</Text>
                <Text className="text-white text-xs">{totalPoints}/{nextLevelPoints}</Text>
              </View>
              <View className="bg-white/30 rounded-full h-2 overflow-hidden">
                <View 
                  className="bg-white h-full rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              <Text className="text-white/70 text-xs mt-2">
                {nextLevelPoints - totalPoints} points to next level
              </Text>
            </View>
          </View>

          {/* How to Earn Points */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-5 border border-blue-200">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-sm font-bold text-blue-900">How to Earn Points</Text>
            </View>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-green-600 font-bold">+10</Text>
                <Text className="text-xs text-blue-700 flex-1">Complete a course or lesson</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-green-600 font-bold">+10</Text>
                <Text className="text-xs text-blue-700 flex-1">Attend an event</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-green-600 font-bold">+15</Text>
                <Text className="text-xs text-blue-700 flex-1">Maintain a 7-day learning streak</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-green-600 font-bold">+20</Text>
                <Text className="text-xs text-blue-700 flex-1">Refer a friend who joins</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-green-600 font-bold">+25</Text>
                <Text className="text-xs text-blue-700 flex-1">Write a course review</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-white rounded-xl p-1 mb-5 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                selectedTab === 'rewards' ? 'bg-purple-500' : ''
              }`}
              onPress={() => setSelectedTab('rewards')}
            >
              <Text className={`text-sm font-semibold ${
                selectedTab === 'rewards' ? 'text-white' : 'text-gray-500'
              }`}>
                Rewards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                selectedTab === 'history' ? 'bg-purple-500' : ''
              }`}
              onPress={() => setSelectedTab('history')}
            >
              <Text className={`text-sm font-semibold ${
                selectedTab === 'history' ? 'text-white' : 'text-gray-500'
              }`}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rewards Tab */}
          {selectedTab === 'rewards' && (
            <View>
              {/* Available Rewards */}
              {availableRewards.length > 0 && (
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-900 mb-3">Available Rewards</Text>
                  <View className="gap-3">
                    {availableRewards.map((reward) => (
                      <View
                        key={reward.id}
                        className="rounded-2xl p-4 border-2"
                        style={{
                          backgroundColor: reward.bgColor,
                          borderColor: reward.color,
                        }}
                      >
                        <View className="flex-row items-start gap-3">
                          <Text className="text-4xl">{reward.emoji}</Text>
                          <View className="flex-1">
                            <View className="flex-row items-start justify-between mb-1">
                              <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900">{reward.title}</Text>
                                <View className="bg-gray-100 self-start px-2 py-0.5 rounded-lg mt-1 mb-2">
                                  <Text className="text-[10px] font-bold text-gray-600">{reward.category}</Text>
                                </View>
                              </View>
                            </View>
                            <Text className="text-xs text-gray-600 mb-3">{reward.description}</Text>
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="star" size={16} style={{ color: reward.color }} />
                                <Text className="text-sm font-bold" style={{ color: reward.color }}>
                                  {reward.points} Points
                                </Text>
                              </View>
                              <TouchableOpacity
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: reward.color }}
                              >
                                <Text className="text-xs font-bold text-white">Redeem</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Locked Rewards */}
              {lockedRewards.length > 0 && (
                <View>
                  <Text className="text-base font-bold text-gray-900 mb-3">Coming Soon</Text>
                  <View className="gap-3">
                    {lockedRewards.map((reward) => (
                      <View
                        key={reward.id}
                        className="rounded-2xl p-4 border border-gray-200 bg-gray-50 opacity-60"
                      >
                        <View className="flex-row items-start gap-3">
                          <Text className="text-4xl opacity-50">{reward.emoji}</Text>
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-base font-bold text-gray-600">{reward.title}</Text>
                              <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                            </View>
                            <View className="bg-gray-200 self-start px-2 py-0.5 rounded-lg mt-1 mb-2">
                              <Text className="text-[10px] font-bold text-gray-500">{reward.category}</Text>
                            </View>
                            <Text className="text-xs text-gray-500 mb-3">{reward.description}</Text>
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="star" size={16} color="#9CA3AF" />
                              <Text className="text-sm font-bold text-gray-500">
                                {reward.points} Points
                              </Text>
                              <Text className="text-xs text-gray-400 ml-1">
                                ({reward.points - totalPoints} more needed)
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <View>
              <Text className="text-base font-bold text-gray-900 mb-3">Recent Activity</Text>
              <View className="gap-3">
                {pointsHistory.map((item) => (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center gap-3"
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: item.color + '20' }}
                    >
                      <Ionicons name={item.icon as any} size={20} style={{ color: item.color }} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900 mb-0.5">{item.activity}</Text>
                      <Text className="text-xs text-gray-500">{item.date}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-black text-green-600">+{item.points}</Text>
                      <Text className="text-[10px] text-gray-500">points</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="h-10" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
