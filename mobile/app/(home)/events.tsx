import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';

type EventTab = 'upcoming' | 'past';

export default function EventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>('past');

  const upcomingEvents = [
    {
      id: 1,
      title: 'Morning Meditation & Prayer',
      date: 'Nov 15, 2025',
      time: '6:00 AM',
      location: 'Peace Garden Temple',
      attendees: 85,
      icon: 'sunny',
      color: '#F59E0B',
      emoji: '🙏',
      category: 'Meditation',
      isPaid: false,
      notificationEnabled: true,
    },
    {
      id: 2,
      title: 'Spiritual Discourse',
      date: 'Nov 18, 2025',
      time: '5:00 PM',
      location: 'Sacred Heart Hall',
      attendees: 200,
      icon: 'book',
      color: '#8B5CF6',
      emoji: '📿',
      category: 'Discourse',
      isPaid: true,
      price: 500,
      notificationEnabled: false,
    },
    {
      id: 3,
      title: 'Yoga & Wellness Retreat',
      date: 'Nov 22, 2025',
      time: '7:00 AM',
      location: 'Himalayan Ashram',
      attendees: 50,
      icon: 'leaf',
      color: '#10B981',
      emoji: '🧘‍♀️',
      category: 'Wellness',
      isPaid: true,
      price: 2000,
      notificationEnabled: true,
    },
    {
      id: 4,
      title: 'Evening Bhajan Sandhya',
      date: 'Nov 25, 2025',
      time: '7:30 PM',
      location: 'Community Center',
      attendees: 150,
      icon: 'musical-notes',
      color: '#EC4899',
      emoji: '🎵',
      category: 'Devotional',
      isPaid: false,
      notificationEnabled: false,
    },
  ];

  const pastEvents = [
    {
      id: 101,
      title: 'Diwali Celebration 2024',
      date: 'Nov 1, 2025',
      time: '6:00 PM',
      location: 'Main Temple',
      attendees: 500,
      color: '#F59E0B',
      emoji: '🪔',
      category: 'Festival',
      hasRecording: true,
      hasImages: true,
      imageCount: 45,
    },
    {
      id: 102,
      title: 'Meditation Masterclass',
      date: 'Oct 28, 2025',
      time: '9:00 AM',
      location: 'Wellness Center',
      attendees: 120,
      color: '#8B5CF6',
      emoji: '🧘',
      category: 'Workshop',
      hasRecording: true,
      hasImages: true,
      imageCount: 28,
    },
    {
      id: 103,
      title: 'Spiritual Healing Session',
      date: 'Oct 20, 2025',
      time: '4:00 PM',
      location: 'Peace Garden',
      attendees: 75,
      color: '#10B981',
      emoji: '💫',
      category: 'Healing',
      hasRecording: false,
      hasImages: true,
      imageCount: 15,
    },
  ];

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Tab Switcher */}
          <View className="flex-row bg-white rounded-xl p-1 mb-4 shadow-sm">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg ${
                activeTab === 'upcoming' ? 'bg-gray-100' : ''
              }`}
              onPress={() => setActiveTab('upcoming')}
            >
              <Ionicons 
                name="calendar" 
                size={18} 
                color={activeTab === 'upcoming' ? '#8B5CF6' : '#9CA3AF'} 
              />
              <Text className={`text-sm font-medium ${
                activeTab === 'upcoming' ? 'text-purple-500 font-semibold' : 'text-gray-400'
              }`}>
                Upcoming
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg ${
                activeTab === 'past' ? 'bg-gray-100' : ''
              }`}
              onPress={() => setActiveTab('past')}
            >
              <Ionicons 
                name="time" 
                size={18} 
                color={activeTab === 'past' ? '#8B5CF6' : '#9CA3AF'} 
              />
              <Text className={`text-sm font-medium ${
                activeTab === 'past' ? 'text-purple-500 font-semibold' : 'text-gray-400'
              }`}>
                Past Events
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {events.map((event) => {
            const handleCardPress = () => {
              // For past events, navigate based on available content
              if (activeTab === 'past') {
                if ('hasRecording' in event && event.hasRecording) {
                  router.push({
                    pathname: '/event-videos',
                    params: {
                      eventId: event.id.toString(),
                      eventTitle: event.title,
                      eventColor: event.color,
                      eventEmoji: event.emoji,
                    }
                  });
                } else if ('hasImages' in event && event.hasImages) {
                  router.push({
                    pathname: '/event-photos',
                    params: {
                      eventId: event.id.toString(),
                      eventTitle: event.title,
                      eventColor: event.color,
                      eventEmoji: event.emoji,
                      imageCount: ('imageCount' in event ? event.imageCount : 0).toString(),
                    }
                  });
                }
              }
              // For upcoming events, you could navigate to event details
            };

            return (
            <TouchableOpacity 
              key={event.id} 
              className="bg-white rounded-2xl p-4.5 mb-4 shadow-sm"
              activeOpacity={0.7}
              onPress={handleCardPress}
            >
              {/* Header Row */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-start gap-3 flex-1">
                  <Text className="text-3xl">{event.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-0.5 leading-[22px]">{event.title}</Text>
                    <Text className="text-xs text-gray-400 font-medium">{event.category}</Text>
                  </View>
                </View>
                <View className="w-1 h-10 rounded" style={{ backgroundColor: event.color }} />
              </View>

              {/* Event Details */}
              <View className="gap-2 mb-3">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text className="text-[13px] text-gray-500">{event.date}</Text>
                  <Text className="text-[13px] text-gray-300 mx-0.5">•</Text>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className="text-[13px] text-gray-500">{event.time}</Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-[13px] text-gray-500">{event.location}</Text>
                </View>
              </View>

              {/* Footer - Different for upcoming vs past */}
              {activeTab === 'upcoming' ? (
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-400 font-medium">{event.attendees} attending</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {'notificationEnabled' in event && (
                      <TouchableOpacity className="p-1.5 rounded-lg bg-gray-50">
                        <Ionicons 
                          name={event.notificationEnabled ? "notifications" : "notifications-outline"} 
                          size={18} 
                          color={event.notificationEnabled ? event.color : '#9CA3AF'} 
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      className="flex-row items-center gap-1.5 py-2 px-3.5 rounded-lg"
                      style={{ backgroundColor: event.color }}
                    >
                      <Text className="text-white text-[13px] font-semibold">
                        {'isPaid' in event && event.isPaid ? `₹${event.price}` : 'Free'}
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="people" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-400 font-medium">{event.attendees} attended</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    {'hasRecording' in event && event.hasRecording && (
                      <TouchableOpacity 
                        className="flex-row items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gray-50"
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({
                            pathname: '/event-videos',
                            params: {
                              eventId: event.id.toString(),
                              eventTitle: event.title,
                              eventColor: event.color,
                              eventEmoji: event.emoji,
                            }
                          });
                        }}
                      >
                        <Ionicons name="play-circle" size={18} color={event.color} />
                        <Text className="text-xs font-semibold" style={{ color: event.color }}>Watch</Text>
                      </TouchableOpacity>
                    )}
                    {'hasImages' in event && event.hasImages && (
                      <TouchableOpacity 
                        className="flex-row items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gray-50"
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({
                            pathname: '/event-photos',
                            params: {
                              eventId: event.id.toString(),
                              eventTitle: event.title,
                              eventColor: event.color,
                              eventEmoji: event.emoji,
                              imageCount: ('imageCount' in event ? event.imageCount : 0).toString(),
                            }
                          });
                        }}
                      >
                        <Ionicons name="images" size={18} color={event.color} />
                        <Text className="text-xs font-semibold" style={{ color: event.color }}>
                          {event.imageCount} Photos
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
            );
          })}

          {/* Bottom spacing */}
          <View className="h-[100px]" />
        </View>
      </ScrollView>
    </View>
  );
}
