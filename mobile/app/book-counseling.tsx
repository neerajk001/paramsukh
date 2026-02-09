import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCounselingStore } from '../store/counselingStore';

export default function BookCounselingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type, title, isFree } = params;

  const [selectedCounselor, setSelectedCounselor] = useState<'team' | 'gurudev' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { checkAvailability, bookSession, isLoading } = useCounselingStore();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Static counselors list (could also be dynamic if needed, but usually static config)
  const counselors = [
    {
      id: 'team',
      name: 'Support Team',
      title: 'Expert Counselor',
      price: 'Free',
      emoji: '👥',
      color: '#10B981',
      bgColor: '#ECFDF5',
      description: 'Professional counseling by our experienced support team',
      available: 'Mon-Sat, 9 AM - 6 PM',
    },
    {
      id: 'gurudev',
      name: 'Gurudev',
      title: 'Spiritual Master',
      price: '₹999',
      emoji: '🙏',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      description: 'Personal guidance from Gurudev with deep spiritual insights',
      available: 'By appointment',
    },
  ];

  // Helper: Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      id: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  // Effect: Fetch availability when date/counselor changes
  React.useEffect(() => {
    const fetchSlots = async () => {
      if (selectedCounselor && selectedDate) {
        setAvailableSlots([]); // Clear previous slots
        const slots = await checkAvailability(selectedDate, selectedCounselor);
        setAvailableSlots(slots);
      }
    };
    fetchSlots();
  }, [selectedDate, selectedCounselor]);


  const handleBooking = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      Alert.alert('Incomplete Selection', 'Please select counselor, date, and time slot');
      return;
    }

    const counselor = counselors.find(c => c.id === selectedCounselor);
    const dateObj = dates.find(d => d.id === selectedDate);

    try {
      const result = await bookSession({
        counselorType: selectedCounselor,
        counselorName: counselor?.name,
        bookingType: type,
        bookingTitle: title,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        userNotes: notes,
        amount: selectedCounselor === 'gurudev' ? 999 : 0
      });

      if (result.success) {
        Alert.alert(
          'Booking Confirmed! 🎉',
          `Your session with ${counselor?.name} on ${dateObj?.day}, ${dateObj?.date} ${dateObj?.month} at ${selectedTime} has been booked.`,
          [
            {
              text: 'Done',
              onPress: () => router.push('/(home)/menu'),
            },
          ]
        );
      } else {
        Alert.alert('Booking Failed', result.message || 'Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const selectedCounselorData = counselors.find(c => c.id === selectedCounselor);
  const showPayment = selectedCounselor === 'gurudev';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Book Session</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Service Info */}
          <View className="bg-white rounded-2xl p-4 mb-5 border border-gray-200">
            <Text className="text-base font-bold text-gray-900 mb-1">{title}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">45-60 minutes session</Text>
            </View>
          </View>

          {/* Select Counselor */}
          <View className="mb-5">
            <Text className="text-base font-bold text-gray-900 mb-3">Select Counselor</Text>
            <View className="gap-3">
              {(isFree === 'true' ? [counselors[0]] : counselors).map((counselor) => {
                const isSelected = selectedCounselor === counselor.id;

                return (
                  <TouchableOpacity
                    key={counselor.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCounselor(counselor.id as any)}
                    className={`rounded-2xl p-4 ${isSelected ? 'border-[3px]' : 'border border-gray-200'
                      }`}
                    style={{
                      backgroundColor: counselor.bgColor,
                      borderColor: isSelected ? counselor.color : undefined,
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-4xl">{counselor.emoji}</Text>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <View>
                            <Text className="text-base font-bold text-gray-900">{counselor.name}</Text>
                            <Text className="text-xs text-gray-500">{counselor.title}</Text>
                          </View>
                          {isSelected && (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: counselor.color }}
                            >
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-600 mb-2">{counselor.description}</Text>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm font-bold" style={{ color: counselor.color }}>
                            {counselor.price}
                          </Text>
                          <Text className="text-xs text-gray-500">{counselor.available}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedCounselor && (
            <>
              {/* Select Date */}
              <View className="mb-5">
                <Text className="text-base font-bold text-gray-900 mb-3">Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {dates.map((date) => {
                    const isSelected = selectedDate === date.id;

                    return (
                      <TouchableOpacity
                        key={date.id}
                        onPress={() => setSelectedDate(date.id)}
                        className={`w-20 p-3 rounded-xl items-center mr-2 ${isSelected ? 'border-2' : 'border border-gray-200'
                          }`}
                        style={{
                          backgroundColor: isSelected ? selectedCounselorData?.bgColor : '#FFFFFF',
                          borderColor: isSelected ? selectedCounselorData?.color : undefined,
                        }}
                      >
                        <Text className="text-xs text-gray-500 mb-1">{date.day}</Text>
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{date.date}</Text>
                        <Text className="text-xs text-gray-500">{date.month}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Select Time */}
              {selectedDate && (
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-900 mb-3">Select Time</Text>
                  {availableSlots.length === 0 ? (
                    <Text className="text-gray-500 italic">No available slots for this date.</Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {availableSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <TouchableOpacity
                            key={time}
                            onPress={() => setSelectedTime(time)}
                            className={`px-4 py-3 rounded-xl ${isSelected ? 'border-2' : 'border border-gray-200'
                              }`}
                            style={{
                              backgroundColor: isSelected ? selectedCounselorData?.bgColor : '#FFFFFF',
                              borderColor: isSelected ? selectedCounselorData?.color : undefined,
                            }}
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: isSelected ? selectedCounselorData?.color : '#6B7280' }}
                            >
                              {time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* Additional Notes */}
              {selectedTime && (
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-900 mb-3">
                    Additional Notes (Optional)
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900"
                    placeholder="Share any specific concerns or topics you'd like to discuss..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              )}

              {/* Payment Summary */}
              {selectedTime && showPayment && (
                <View className="bg-purple-50 rounded-2xl p-4 mb-5 border-2 border-purple-200">
                  <Text className="text-base font-bold text-purple-900 mb-3">Payment Summary</Text>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-purple-700">Session Fee</Text>
                    <Text className="text-sm font-semibold text-purple-900">₹999</Text>
                  </View>
                  <View className="border-t border-purple-200 pt-2 mt-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base font-bold text-purple-900">Total</Text>
                      <Text className="text-xl font-bold text-purple-900">₹999</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedCounselor && selectedDate && selectedTime && (
        <View className="bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            onPress={handleBooking}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl"
            style={{ backgroundColor: selectedCounselorData?.color }}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text className="text-base font-bold text-white">
              {showPayment ? 'Proceed to Payment' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
