import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, TouchableOpacity, Modal, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { API_URL } from '../../config/api';

export default function HomeLayout() {
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

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
            try {
              try {
                await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
              } catch (error) {
                console.log('Logout API call failed, but continuing with local signout');
              }
              await logout();
              setMenuModalVisible(false);
              router.replace('/signin');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#1F2937',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 75 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 12,
            paddingTop: 6,
            paddingHorizontal: 8,
            position: 'absolute',
            bottom: Platform.OS === 'android' ? 25 : 0,
            left: 0,
            right: 0,
            marginLeft: 16,
            marginRight: 16,
            marginBottom: Platform.OS === 'android' ? 15 : 0,
            elevation: 0,
            shadowOpacity: 0,
            borderRadius: 32,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '600',
            marginBottom: Platform.OS === 'android' ? 4 : 0,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
            marginHorizontal: 1,
          },
        }}
      >
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused ? '#FFFFFF20' : 'transparent',
                  borderRadius: 10,
                  padding: 6,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Courses',
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused ? '#FFFFFF20' : 'transparent',
                  borderRadius: 10,
                  padding: 6,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={focused ? 'book' : 'book-outline'} size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused ? '#FFFFFF20' : 'transparent',
                  borderRadius: 10,
                  padding: 6,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="membership-new"
          options={{
            title: 'Membership',
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused ? '#FFFFFF20' : 'transparent',
                  borderRadius: 10,
                  padding: 6,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={focused ? 'card' : 'card-outline'} size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  backgroundColor: focused ? '#FFFFFF20' : 'transparent',
                  borderRadius: 10,
                  padding: 6,
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={focused ? 'people' : 'people-outline'} size={20} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="my-progress"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="help-support"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="podcasts"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="terms-privacy"
          options={{
            href: null, // Hide from tabs navigation
          }}
        />
        <Tabs.Screen
          name="menu-button"
          options={{ href: null }}
        />
      </Tabs>

      {/* Menu Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Quick Access</Text>
              </View>

              {/* Menu Options - Only Shops and Donations */}
              <View style={styles.menuOptions}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    setTimeout(() => {
                      router.push('/shops');
                    }, 300);
                  }}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuEmoji}>�</Text>
                    <Text style={styles.menuText}>Shops</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    setTimeout(() => {
                      router.push('/donations');
                    }, 300);
                  }}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuEmoji}>💝</Text>
                    <Text style={styles.menuText}>Donations</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    setTimeout(() => {
                      // @ts-ignore - Route will be available after restart
                      router.push('/(home)/podcasts');
                    }, 300);
                  }}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuEmoji}>🎙️</Text>
                    <Text style={styles.menuText}>Podcasts</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  accountSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  menuOptions: {
    gap: 8,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
  },
  signOutText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});
