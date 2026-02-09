import React, { useEffect } from 'react';
import { View, Image, Animated, ActivityIndicator } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Fade in and scale animation   
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,   
        duration: 1000,   
        useNativeDriver: true,                    
      }),       
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),    
    ]).start();       

    // Auto-hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {  
      Animated.timing(fadeAnim, {  
        toValue: 0,    
        duration: 500,    
        useNativeDriver: true,
      }).start(() => {
        onFinish();      
      });
    }, 2500);                     
   
    return () => clearTimeout(timer);        
  }, []);        

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Animated.View                        
        className="items-center"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >     
        <Image
          source={require('../assets/paramsukh.png')}
          className="w-[300px] h-[300px]"
          resizeMode="contain"
        />
        <ActivityIndicator                                  
          size="large"                                                      
          color="#3b82f6" 
          className="mt-8"                
        />
      </Animated.View>
    </View>
  );
}