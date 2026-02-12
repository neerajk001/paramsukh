import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useMembershipStore } from '../../store/membershipStore';
import { getInitials } from '../../utils/userUtils';
import {
  isBiometricAvailable,
  authenticateWithBiometrics,
  storeTokenSecurely
} from '../../utils/biometricAuth';

const MEMBERSHIP_INFO = {
  bronze: {
    name: 'Bronze',
    color: '#CD7F32',
    gradient: ['#FEF3C7', '#FDE68A'],
    courses: ['Physical Wellness'],
  },
  copper: {
    name: 'Copper',
    color: '#B87333',
    gradient: ['#FED7AA', '#FDBA74'],
    courses: ['Physical Wellness', 'Spirituality & Mantra Yoga', 'Mental Wellness'],
  },
  silver: {
    name: 'Silver',
    color: '#C0C0C0',
    gradient: ['#F3F4F6', '#E5E7EB'],
    courses: ['All 5 Courses'],
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, logout, logoutWithBiometric, checkBiometricAvailability } = useAuthStore();
  const { currentSubscription, fetchCurrentSubscription } = useMembershipStore();
  
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedCourses: 0,
    eventRegistrations: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadProfileData();
    checkBiometricSupport();
  }, []);

  const loadProfileData = async () => {
    if (token) {
      await fetchCurrentSubscription();
      await loadUserStats();
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const checkBiometricSupport = async () => {
    const available = await checkBiometricAvailability();
    setBiometricAvailable(available);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            if (biometricAvailable) {
              const result = await logoutWithBiometric();
              if (!result.success) {
                return; // User cancelled or failed auth
              }
            } else {
              await logout();
            }
            
            router.replace('/signin');
          }
        }
      ]
    );
  };

  const enableBiometricAuth = async () => {
    const authenticated = await authenticateWithBiometrics({
      promptMessage: 'Enable Face ID / Fingerprint for secure access'
    });
    
    if (authenticated) {
      Alert.alert('Success', 'Biometric authentication enabled!');
      setBiometricAvailable(true);
    }
  };

  const getMembershipInfo = () => {
    if (!currentSubscription?.plan) {
      return { name: 'Free', color: '#9CA3AF', gradient: ['#F3F4F6', '#E5E7EB'], courses: [] };
    }
    return MEMBERSHIP_INFO[currentSubscription.plan] || MEMBERSHIP_INFO.bronze;
  };

  const membership = getMembershipInfo();
  const userInitial = getInitials(user?.displayName);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.userPhone}>{user?.phone || 'No phone'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(home)/edit-profile')}
            >
              <Ionicons name="pencil" size={18} color="#6B46C1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Membership Card */}
        <View style={[styles.card, styles.membershipCard]}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipLabel}>Current Plan</Text>
              <Text style={[styles.membershipName, { color: membership.color }]}>
                {membership.name}
              </Text>
            </View>
            <View style={styles.membershipBadge}>
              <Ionicons name={membership.name === 'Silver' ? 'star' : 'card'} size={24} color={membership.color} />
            </View>
          </View>
          
          {currentSubscription?.status === 'active' ? (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.statusText}>Active</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusInactive]}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={[styles.statusText, styles.statusInactiveText]}>Inactive</Text>
            </View>
          )}

          {membership.courses.length > 0 && (
            <View style={styles.coursesSection}>
              <Text style={styles.coursesTitle}>Course Access</Text>
              {membership.courses.map((course, index) => (
                <View key={index} style={styles.courseItem}>
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                  <Text style={styles.courseName}>{course}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/(home)/membership-new')}
          >
            <Text style={styles.upgradeButtonText}>
              {membership.name === 'Free' ? 'Upgrade Plan' : 'Manage Plan'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          {loadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6B46C1" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="book" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.totalEnrollments}</Text>
                <Text style={styles.statLabel}>Enrollments</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.completedCourses}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.eventRegistrations}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          
          {biometricAvailable && (
            <TouchableOpacity style={styles.settingItem} onPress={enableBiometricAuth}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="finger-print" size={22} color="#6B46C1" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>Enable Face ID / Fingerprint</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(home)/settings')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="settings-outline" size={22} color="#6B46C1" />
              </View>
              <View>
                <Text style={styles.settingTitle}>App Settings</Text>
                <Text style={styles.settingDescription}>Theme, notifications</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(home)/help-support')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="help-circle-outline" size={22} color="#6B46C1" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingDescription}>Contact us, FAQs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(107, 70, 193, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B46C1',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipCard: {
    marginTop: 16,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membershipLabel: {
    fontSize: 13,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  membershipName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  membershipBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  statusInactiveText: {
    color: '#EF4444',
  },
  coursesSection: {
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  courseName: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(107, 70, 193, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  settingDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  bottomSpacer: {
    height: 40,
  },
});
