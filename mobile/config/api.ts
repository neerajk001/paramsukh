import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamically retrieve the host if available (for Expo Go / Dev Client)
const getHost = () => {
  // If defined in expoConfig (standard in newer Expo versions)
  if (Constants.expoConfig?.hostUri) {
    return Constants.expoConfig.hostUri.split(':')[0];
  }
  // Fallback for older Expo versions or bare workflow
  // @ts-ignore
  if (Constants.manifest?.debuggerHost) {
    // @ts-ignore
    return Constants.manifest.debuggerHost.split(':')[0];
  }
  return null;
};

// Known fallback IPs (Office, Home, etc.) - You can add more here
const FALLBACK_IPS = [
  '192.168.0.103', // Home/Current
  '192.168.1.11',  // Office
];

// Select the IP: Dynamic Host > First Fallback > Localhost
const LOCAL_IP = getHost() || FALLBACK_IPS[0];

// Determine the Base URL (without /api/auth or /api)
const getBaseUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl.replace('/api', '').replace('/auth', '');
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator
      // return 'http://10.0.2.2:3000';
      return `http://${LOCAL_IP}:3000`;
    } else if (Platform.OS === 'ios') {
      // iOS simulator
      return 'http://localhost:3000';
    } else {
      // Web / Other
      return `http://${LOCAL_IP}:3000`;
    }
  }

  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();
export const API_BASE_URL = `${BASE_URL}/api`;
export const API_URL = API_BASE_URL; // Correctly pointing to .../api now

console.log('🌐 API Configuration:', {
  LOCAL_IP,
  BASE_URL,
  API_BASE_URL,
  API_URL
});
