import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {    
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Account > Change Password. You can reset your password from there.',
    },
    {
      question: 'How can I join a community group?',
      answer: 'Visit the Community tab, browse available groups, and tap the "Follow" button to join.',
    },
    {
      question: 'How do I access my purchased courses?',
      answer: 'All your purchased courses are available in the My Progress section under "Courses Completed".',
    },
    {
      question: 'Can I download content for offline viewing?',
      answer: 'Yes, premium members can download courses and podcasts for offline access. Look for the download icon.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'Go to Settings > Account > Manage Subscription to view and cancel your active subscriptions.',
    },
  ];

  const contactOptions = [
    { title: 'Email', icon: 'mail-outline', action: () => Linking.openURL('mailto:support@paramsukh.com') },
    { title: 'Phone', icon: 'call-outline', action: () => Linking.openURL('tel:+911234567890') },
    { title: 'Live Chat', icon: 'chatbubbles-outline', action: () => console.log('Open chat') },
    { title: 'Help Center', icon: 'help-circle-outline', action: () => console.log('Open help center') },
  ];

  const handleSubmit = () => {
    console.log('Message submitted:', message);
    setMessage('');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" onPress={() => router.push('/(home)/menu')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Quick Contact */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Contact Us</Text>
          <View className="flex-row flex-wrap gap-3">
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="flex-1 min-w-[45%] bg-white p-5 rounded-xl items-center shadow-sm"
                onPress={option.action}
              >
                <Ionicons name={option.icon as any} size={28} color="#3B82F6" />
                <Text className="text-sm font-semibold text-gray-900 mt-2">{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <Text className="text-[15px] font-semibold text-gray-900 flex-1 mr-3">{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {expandedFAQ === index && (
                <View className="px-4 pb-4 border-t border-gray-100">
                  <Text className="text-sm text-gray-500 leading-5">{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Send Message */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Send us a Message</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <TextInput
              className="text-[15px] text-gray-900 min-h-[120px] mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
              placeholder="Describe your issue or question..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              className={`flex-row items-center justify-center py-3 rounded-lg gap-2 ${
                !message ? 'bg-gray-300' : 'bg-blue-500'
              }`}
              onPress={handleSubmit}
              disabled={!message}
            >
              <Text className="text-base font-semibold text-white">Submit</Text>
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Resources */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Additional Resources</Text>
          <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
            <Ionicons name="book-outline" size={24} color="#3B82F6" />
            <Text className="text-[15px] font-semibold text-gray-900 flex-1 ml-3">User Guide</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            <Text className="text-[15px] font-semibold text-gray-900 flex-1 ml-3">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
            <Ionicons name="shield-outline" size={24} color="#3B82F6" />
            <Text className="text-[15px] font-semibold text-gray-900 flex-1 ml-3">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
