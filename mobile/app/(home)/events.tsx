import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { useEventStore } from '../../store/eventStore';

type EventTab = 'upcoming' | 'past';

export default function EventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>('past');
  const { events, fetchEvents, isLoading } = useEventStore();

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const openRegisterForm = (eventId: string) => {
    router.push({
      pathname: '/event-detail',
      params: {
        eventId,
        openRegister: '1'
      }
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Tab Switcher */}
          <View className="flex-row bg-white rounded-xl p-1 mb-4 shadow-sm">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg ${activeTab === 'upcoming' ? 'bg-gray-100' : ''
                }`}
              onPress={() => setActiveTab('upcoming')}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={activeTab === 'upcoming' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text className={`text-sm font-medium ${activeTab === 'upcoming' ? 'text-purple-500 font-semibold' : 'text-gray-400'
                }`}>
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg ${activeTab === 'past' ? 'bg-gray-100' : ''
                }`}
              onPress={() => setActiveTab('past')}
            >
              <Ionicons
                name="time"
                size={18}
                color={activeTab === 'past' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text className={`text-sm font-medium ${activeTab === 'past' ? 'text-purple-500 font-semibold' : 'text-gray-400'
                }`}>
                Past Events
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
          ) : (
            events.map((event) => {
              const handleCardPress = () => {
                // For past events, navigate based on available content
                if (activeTab === 'past') {
                  if (event.hasRecording) {
                    router.push({
                      pathname: '/event-videos',
                      params: {
                        eventId: event._id,
                        eventTitle: event.title,
                        eventColor: event.color,
                        eventEmoji: event.emoji,
                      }
                    });
                  } else if (event.imageCount > 0) {
                    router.push({
                      pathname: '/event-photos',
                      params: {
                        eventId: event._id,
                        eventTitle: event.title,
                        eventColor: event.color,
                        eventEmoji: event.emoji,
                        imageCount: event.imageCount.toString(),
                      }
                    });
                  }
                }
                if (activeTab === 'upcoming') {
                  router.push({
                    pathname: '/event-detail',
                    params: {
                      eventId: event._id
                    }
                  });
                }
              };

              return (
                <TouchableOpacity
                  key={event._id}
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
                      <Text className="text-[13px] text-gray-500">{formatDate(event.eventDate)}</Text>
                      <Text className="text-[13px] text-gray-300 mx-0.5">•</Text>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text className="text-[13px] text-gray-500">{event.eventTime}</Text>
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
                        <Text className="text-xs text-gray-400 font-medium">{event.currentAttendees} attending</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {event.notificationEnabled && (
                          <TouchableOpacity className="p-1.5 rounded-lg bg-gray-50">
                            <Ionicons
                              name="notifications"
                              size={18}
                              color={event.color}
                            />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          className="flex-row items-center gap-1.5 py-2 px-3.5 rounded-lg"
                          style={{ backgroundColor: event.color }}
                          disabled={event.isRegistered}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (!event.isRegistered) {
                              openRegisterForm(event._id);
                            }
                          }}
                        >
                          <Text className="text-white text-[13px] font-semibold">
                            {event.isRegistered
                              ? 'Registered'
                              : event.isPaid
                                ? 'Rs. ' + event.price + ' - Register'
                                : 'Register'}
                          </Text>
                          {!event.isRegistered && (
                            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="people" size={14} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400 font-medium">{event.currentAttendees} attended</Text>
                      </View>
                      <View className="flex-row items-center gap-3">
                        {event.hasRecording && (
                          <TouchableOpacity
                            className="flex-row items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gray-50"
                            onPress={(e) => {
                              e.stopPropagation();
                              router.push({
                                pathname: '/event-videos',
                                params: {
                                  eventId: event._id,
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
                        {event.imageCount > 0 && (
                          <TouchableOpacity
                            className="flex-row items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gray-50"
                            onPress={(e) => {
                              e.stopPropagation();
                              router.push({
                                pathname: '/event-photos',
                                params: {
                                  eventId: event._id,
                                  eventTitle: event.title,
                                  eventColor: event.color,
                                  eventEmoji: event.emoji,
                                  imageCount: event.imageCount.toString(),
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
            })
          )}

          {/* Bottom spacing */}
          <View className="h-[100px]" />
        </View>
      </ScrollView>
    </View>
  );
}
