import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One assessment per user
  },
  // Personal Information
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  occupation: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  // Assessment Questions
  physicalIssue: {
    type: Boolean,
    required: true
  },
  physicalIssueDetails: {
    type: String,
    trim: true
  },
  specialDiseaseIssue: {
    type: Boolean,
    required: true
  },
  specialDiseaseDetails: {
    type: String,
    trim: true
  },
  relationshipIssue: {
    type: Boolean,
    required: true
  },
  relationshipIssueDetails: {
    type: String,
    trim: true
  },
  financialIssue: {
    type: Boolean,
    required: true
  },
  financialIssueDetails: {
    type: String,
    trim: true
  },
  mentalHealthIssue: {
    type: Boolean,
    required: true
  },
  mentalHealthIssueDetails: {
    type: String,
    trim: true
  },
  spiritualGrowth: {
    type: Boolean,
    required: true
  },
  spiritualGrowthDetails: {
    type: String,
    trim: true
  },
  // Recommendations (auto-generated based on answers)
  recommendations: [{
    type: {
      type: String,
      enum: ['course', 'counseling', 'event', 'community'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update updatedAt on save
assessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to generate recommendations based on assessment
assessmentSchema.methods.generateRecommendations = function() {
  const recommendations = [];

  // Physical Wellness
  if (this.physicalIssue) {
    recommendations.push({
      type: 'course',
      title: 'Physical Wellness Course',
      description: 'Learn yoga, exercise, and healthy lifestyle practices to improve your physical health',
      priority: 'high'
    });
    recommendations.push({
      type: 'counseling',
      title: 'Physical Wellness Counseling',
      description: 'Get personalized guidance for your physical health concerns',
      priority: 'high'
    });
  }

  // Disease Management
  if (this.specialDiseaseIssue) {
    recommendations.push({
      type: 'counseling',
      title: 'Health & Disease Management',
      description: 'Expert counseling for managing health conditions',
      priority: 'high'
    });
    recommendations.push({
      type: 'course',
      title: 'Holistic Health Course',
      description: 'Understand holistic approaches to health and wellness',
      priority: 'medium'
    });
  }

  // Mental Wellness
  if (this.mentalHealthIssue) {
    recommendations.push({
      type: 'course',
      title: 'Mental Wellness Course',
      description: 'Learn meditation, stress management, and mental peace techniques',
      priority: 'high'
    });
    recommendations.push({
      type: 'counseling',
      title: 'Mental Health Counseling',
      description: 'Professional support for your mental health journey',
      priority: 'high'
    });
    recommendations.push({
      type: 'community',
      title: 'Mental Wellness Community',
      description: 'Connect with others on similar journeys',
      priority: 'medium'
    });
  }

  // Financial Wellness
  if (this.financialIssue) {
    recommendations.push({
      type: 'course',
      title: 'Financial Wellness Course',
      description: 'Learn financial planning, budgeting, and wealth management',
      priority: 'high'
    });
    recommendations.push({
      type: 'counseling',
      title: 'Financial Counseling',
      description: 'Get expert advice on your financial concerns',
      priority: 'medium'
    });
  }

  // Relationship Wellness
  if (this.relationshipIssue) {
    recommendations.push({
      type: 'counseling',
      title: 'Relationship Counseling',
      description: 'Professional guidance for relationship challenges',
      priority: 'high'
    });
    recommendations.push({
      type: 'course',
      title: 'Communication & Relationships',
      description: 'Learn effective communication and relationship building',
      priority: 'medium'
    });
  }

  // Spiritual Growth
  if (this.spiritualGrowth) {
    recommendations.push({
      type: 'course',
      title: 'Spirituality & Mantra Yoga',
      description: 'Deepen your spiritual practice with mantras and meditation',
      priority: 'high'
    });
    recommendations.push({
      type: 'event',
      title: 'Spiritual Events',
      description: 'Attend satsangs, meditation sessions, and spiritual gatherings',
      priority: 'medium'
    });
    recommendations.push({
      type: 'community',
      title: 'Spiritual Community',
      description: 'Connect with like-minded spiritual seekers',
      priority: 'medium'
    });
  }

  // Always recommend general wellness
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'course',
      title: 'Complete Wellness Journey',
      description: 'Start your holistic wellness journey with our comprehensive courses',
      priority: 'medium'
    });
  }

  this.recommendations = recommendations;
  return recommendations;
};

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
