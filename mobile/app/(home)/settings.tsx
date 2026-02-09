import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false,
    autoPlay: true,        
    dataSaver: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" onPress={() => router.push('/(home)/menu')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Notifications</Text>
          
          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">Push Notifications</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">Receive push notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.pushNotifications ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="mail-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">Email Notifications</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">Receive email updates</Text>
              </View>
            </View>
            <Switch     
              value={settings.emailNotifications}   
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.emailNotifications ? '#3B82F6' : '#F3F4F6'}
            />
          </View>   
        </View>
                
        {/* Appearance Section */}
        <View className="mb-6">     
          <Text className="text-lg font-bold text-gray-900 mb-3">Appearance</Text>
          
          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="moon-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">Dark Mode</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">Enable dark theme</Text>
              </View>
            </View>   
            <Switch                 
              value={settings.darkMode}     
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.darkMode ? '#3B82F6' : '#F3F4F6'}
            />  
          </View>  
        </View>

        {/* Content Preferences */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Content Preferences</Text>
          
          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="play-circle-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">Auto-play Videos</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">Videos play automatically</Text>
              </View>
            </View>
            <Switch
              value={settings.autoPlay}
              onValueChange={() => toggleSetting('autoPlay')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.autoPlay ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="save-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">Data Saver</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">Reduce data usage</Text>
              </View>
            </View>
            <Switch
              value={settings.dataSaver}
              onValueChange={() => toggleSetting('dataSaver')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.dataSaver ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Account</Text>
          
          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="videocam-outline" size={24} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 ml-3">Video Quality</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="language-outline" size={24} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 ml-3">Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="lock-closed-outline" size={24} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 ml-3">Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="shield-outline" size={24} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 ml-3">Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-red-50 p-4 rounded-xl mb-2 shadow-sm border border-red-200">
            <View className="flex-row items-center flex-1">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text className="text-base font-semibold text-red-500 ml-3">Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
