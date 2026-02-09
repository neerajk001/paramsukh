import { Stack } from 'expo-router';
import { useState } from 'react';
import './global.css';
import SplashScreen from './SplashScreen';

// Expo Router already provides the top-level NavigationContainer.
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
                                                          
  if (!isReady) {                         
    return <SplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}



