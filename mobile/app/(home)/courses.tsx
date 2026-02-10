import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';



import { useCourseStore } from '../../store/courseStore';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

export default function CoursesScreen() {
  const router = useRouter();
  const { courses, fetchCourses, isLoading } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Courses
            </Text>
            <Text style={styles.sectionSubtitle}>
              Foundational courses to get you started
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
          ) : (
            courses.map((module) => (
              <View
                key={module._id}
                style={[styles.card, { borderLeftColor: module.color }]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <Ionicons name={module.icon as any} size={24} color={module.color} />
                    <Text style={styles.title}>{module.title}</Text>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {module.description}
                  </Text>

                  <View style={styles.footerRow}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{module.duration}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{module.totalVideos || 0} videos</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.viewButton, { backgroundColor: module.color }]}
                      onPress={() => router.push({
                        pathname: '/course-detail',
                        params: {
                          id: module._id,
                          title: module.title,
                          color: module.color,
                          duration: module.duration,
                          videos: module.totalVideos || 0,
                        }
                      })}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                      <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  metaDot: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
