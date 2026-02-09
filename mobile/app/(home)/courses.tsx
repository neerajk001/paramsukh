import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';

interface Course {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  duration: string;
  videos: number;
}
  
export default function CoursesScreen() {   
  const router = useRouter();
             
  const basicCourses: Course[] = [        
    {   
      id: 1,  
      title: 'Physical Wellness',   
      icon: 'fitness',
      color: '#10B981',
      description: 'Pain free, Disease free, Medicine free Body. Achieve optimal physical health through holistic practices, nutrition, and lifestyle changes.',
      duration: '6 weeks',
      videos: 4,
    },
    {
      id: 2,
      title: 'Mental Wellness',
      icon: 'bulb',
      color: '#F59E0B',
      description: 'Intellectual & Emotional Wellness. Develop mental clarity, emotional balance, cognitive skills, and psychological resilience.',
      duration: '8 weeks',
      videos: 16,
    },
    {
      id: 3,
      title: 'Financial Wellness',
      icon: 'cash',
      color: '#3B82F6',
      description: 'Master personal finance, investment strategies, wealth building, and financial independence for long-term prosperity.',
      duration: '8 weeks',
      videos: 16,
    },
    {
      id: 4,
      title: 'Relationship & Family Wellness',
      icon: 'heart',       
      color: '#EC4899',
      description: 'Build stronger relationships, improve communication, develop emotional intelligence, and create harmonious family dynamics.',
      duration: '10 weeks',
      videos: 20,   
    },     
    {                 
      id: 5,
      title: 'Spirituality & Mantra Yoga',       
      icon: 'flower',  
      color: '#8B5CF6',   
      description: 'Explore spiritual practices, meditation techniques, mantra chanting, and yoga to achieve inner peace and enlightenment.',
      duration: '12 weeks',
      videos: 24,    
    },
  ];

  const currentCourses = basicCourses;
    
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

        {currentCourses.map((module) => (
          <View
            key={module.id}
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
                  <Text style={styles.metaText}>{module.videos} videos</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: module.color }]}
                  onPress={() => router.push({
                    pathname: '/course-detail',
                    params: {
                      id: module.id,
                      title: module.title,
                      color: module.color,
                      duration: module.duration,
                      videos: module.videos,
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
        ))}
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
         