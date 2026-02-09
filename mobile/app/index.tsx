// app/index.tsx - Home screen (expo-router) - Redirects based on auth state and assessment
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
                            
export default function Home() {
  const router = useRouter();
  const { user, isLoading, loadUser } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndAssessment = async () => {
      try {
        // First, try to load user from storage
        await loadUser();

        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isMounted) return;

        // Get the current user state after loading
        const currentUser = useAuthStore.getState().user;

        // If no user, redirect to signin
        if (!currentUser) {
          setHasChecked(true);
          router.replace('/signin');
          return;
        }

        // Check if assessment is completed
        const assessmentCompleted = await AsyncStorage.getItem('assessment_completed');
        
        if (!isMounted) return;
        
        setHasChecked(true);
        if (assessmentCompleted === 'true') {
          router.replace('/(home)/menu');
        } else {
          router.replace('/assessment');
        }
      } catch (error) {
        console.error('Error checking auth/assessment:', error);
        if (isMounted) {
          setHasChecked(true);
          router.replace('/signin');
        }
      }
    };

    // Timeout fallback - redirect to signin after 3 seconds if still loading
    const timeoutId = setTimeout(() => {
      if (!hasChecked && isMounted) {
        console.log('Timeout: Redirecting to signin');
        setHasChecked(true);
        router.replace('/signin');
      }
    }, 3000);

    // Only run once on mount
    if (!hasChecked) {
      checkAuthAndAssessment();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [router, hasChecked, loadUser]);

  // Show loading screen while checking
  if (!hasChecked) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Return null while redirecting
  return null;
}







