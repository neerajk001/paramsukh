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
            <ActivityIndicator size="large" color="#EAB308" style={{ marginTop: 20 }} />
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
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderLeftWidth: 4,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 13,
    color: '#94A3B8',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
