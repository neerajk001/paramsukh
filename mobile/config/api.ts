import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get your PC's IP address (shown when you run `npm start`)
const LOCAL_IP = '192.168.1.11'; // Your PC's IP from Expo

// Determine the API URL based on the environment
const getApiUrl = () => {
  // For production, use your deployed backend URL
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }

  // For development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator - use special alias
      // return 'http://10.0.2.2:3000/api/auth';
      // Physical device or Expo Go - use local IP
      return `http://${LOCAL_IP}:3000/api/auth`;
    } else if (Platform.OS === 'ios') {
      // iOS simulator
      return 'http://localhost:3000/api/auth';
    } else {
      // Physical device or web
      return `http://${LOCAL_IP}:3000/api/auth`;
    }
  }

  // Fallback
  return 'http://localhost:3000/api/auth';
};

export const API_URL = getApiUrl();

console.log('🌐 API URL:', API_URL);
