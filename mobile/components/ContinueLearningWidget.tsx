import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Course {
  id: string;
  title: string;
  color: string;
  progress: number;
  currentVideo: string;
  totalVideos: number;
}

const activeCourses: Course[] = [
  {
    id: '1',
    title: 'Physical & Intellectual Excellence',
    color: '#3B82F6',
    progress: 45,
    currentVideo: 'Video 3',
    totalVideos: 12,
  },
  {
    id: '2',
    title: 'Emotional & Relationship Wellness',
    color: '#EC4899',
    progress: 20,
    currentVideo: 'Video 2',
    totalVideos: 10,
  },
  {
    id: '3',
    title: 'Financial Mastery',
    color: '#10B981',
    progress: 60,   
    currentVideo: 'Video 5',
    totalVideos: 8,    
  },
];

export default function ContinueLearningWidget() {
  const handleContinue = (course: Course) => {
    router.push({
      pathname: '/course-detail',
      params: {
        id: course.id,
        title: course.title,     
        color: course.color,
        duration: '2h 30m',
        videos: course.totalVideos.toString(),
      },
    });
  };

  if (activeCourses.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Continue Learning</Text>
        <TouchableOpacity onPress={() => router.push('/(home)/courses')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseStrip}
            onPress={() => handleContinue(course)}
            activeOpacity={0.7}
          >
            <View style={[styles.colorIndicator, { backgroundColor: course.color }]} />
             
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle} numberOfLines={1}>
                {course.title}
              </Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${course.progress}%`, backgroundColor: course.color }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{course.progress}%</Text>
              </View>
            </View>

            <View style={styles.continueButton}>
              <Ionicons name="play-circle" size={28} color={course.color} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  courseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  colorIndicator: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    width: 32,
  },
  continueButton: {
    padding: 4,
  },
});
