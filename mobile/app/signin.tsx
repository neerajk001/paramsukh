import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function SignInScreen() {
  const router = useRouter();
  const { sendOTP, verifyOTP, isLoading } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);


  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Enter valid phone number');
      return;
    }

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Call actual sendOTP from store
    const result = await sendOTP(formattedPhone);

    if (result.success) {
      setOtpSent(true);
      // If backend tells us if user is new, we could use that, 
      // but for now we'll rely on the verify step or default state
      if (result.isNewUser !== undefined) {
        setIsNewUser(result.isNewUser);
      }
      startResendTimer();
      Alert.alert('Success', 'OTP sent to your phone number');
    } else {
      Alert.alert('Error', result.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Enter 6-digit OTP');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    const result = await verifyOTP(formattedPhone, otp, displayName);

    if (result.success) {
      // After login, check assessment - if not completed, go to assessment screen
      // The index.tsx will handle the routing based on assessment status
      router.replace('/');
    } else {
      Alert.alert('Error', result.message || 'Verification failed');
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      className="bg-gray-50"
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 400,
          minHeight: '100%'
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        {/* Logo Section */}
        <View className="bg-white pt-16 pb-12 px-6 items-center">
          <Image
            source={require('../assets/paramsukh.png')}
            className="w-48 h-48 mb-6"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-900 mb-2">ParamSukh</Text>
          <Text className="text-gray-600 text-base">Sign in to continue</Text>
        </View>

        <View className="px-6 pt-8 pb-8">
          {!otpSent ? (
            <>
              {/* Phone Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
                <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-300 shadow-sm">
                  <Text className="text-gray-600 mr-2 text-base font-medium">+91</Text>
                  <TextInput
                    className="flex-1 text-base"
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Full Name Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
                <TextInput
                  ref={nameInputRef}
                  className="bg-white rounded-xl px-4 py-4 border border-gray-300 text-base shadow-sm"
                  placeholder="Enter your full name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
              </View>

              <TouchableOpacity
                className={`${isLoading ? 'bg-purple-400' : 'bg-purple-600'} rounded-xl py-4 shadow-md`}
                onPress={handleSendOTP}
                disabled={isLoading || phone.length < 10 || !displayName.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-base text-center">Send OTP</Text>
                )}
              </TouchableOpacity>

              <Text className="text-gray-500 text-sm text-center mt-6">
                We'll send you a 6-digit verification code
              </Text>
            </>
          ) : (
            <>

              {/* OTP Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2">Enter OTP</Text>
                <TextInput
                  ref={otpInputRef}
                  className="bg-white rounded-xl px-4 py-4 border border-gray-300 text-2xl text-center tracking-widest font-bold shadow-sm"
                  placeholder="000000"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  autoFocus
                  placeholderTextColor="#D1D5DB"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  OTP sent to +91{phone}
                </Text>
              </View>

              <TouchableOpacity
                className={`${isLoading || otp.length !== 6 ? 'bg-purple-400' : 'bg-purple-600'} rounded-xl py-4 mb-3 shadow-md`}
                onPress={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-base text-center">
                    {isNewUser ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center justify-between mb-5">
                <TouchableOpacity onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}>
                  <Text className="text-purple-600 font-medium">← Change Number</Text>
                </TouchableOpacity>

                {resendTimer > 0 ? (
                  <Text className="text-gray-500">Resend in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP}>
                    <Text className="text-purple-600 font-medium">Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
        <Text className="text-gray-500 text-xs text-center px-8 pb-8">
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


