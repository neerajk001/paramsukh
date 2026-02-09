import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { getInitials } from '../utils/userUtils';

interface HeaderProps {
  useSafeArea?: boolean;
}

export default function Header({ useSafeArea = false }: HeaderProps) {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAuthStore();
  
  // Get the current tab name from segments
  const currentTab = segments[segments.length - 1];
  
  // Map route names to display names
  const getTabTitle = () => {
    switch (currentTab) {
      case 'courses':
        return 'Courses';
      case 'events':
        return 'Events';
      case 'membership':
        return 'Membership';
      case 'menu':
        return 'Menu';
      case 'community':
        return 'Community';
      case 'notifications':
        return 'Notifications';
      default:
        return 'Home';
    }
  };

  // Get user's initials
  const getUserInitial = () => {
    return getInitials(user?.displayName);
  };

  const navigateToProfile = () => {
    router.push('/profile-menu');
  };

  const navigateToNotifications = () => {
    router.push('/(home)/notifications');
  };

  return (
    <View 
      className="bg-white border-b border-gray-200"
      style={{
        paddingTop: Platform.OS === 'ios' ? (useSafeArea ? 10 : 50) : (useSafeArea ? 16 : 40),
        paddingHorizontal: 20,
        paddingBottom: 16,
      }}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">{getTabTitle()}</Text>
        </View>
        
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            className="p-1"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
            onPress={navigateToNotifications}
          >
            <View className="relative w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="notifications-outline" size={24} color="#111827" />
              <View className="absolute top-2 right-2 bg-red-500 rounded-[10px] min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-[10px] font-bold text-white">3</Text>
              </View>
            </View>
          </TouchableOpacity>
                                   
          <TouchableOpacity 
            className="p-1"
            onPress={navigateToProfile}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center border-2 border-blue-500">
              <Text className="text-xl font-bold text-blue-500">{getUserInitial()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}




