import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Authentication fields
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  
  // Profile
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  
  // Authentication type
  authProvider: {
    type: String,
    enum: ['phone'],
    required: true,
    default: 'phone'
  },
  
  // OTP rate limiting (only for phone auth)
  phoneOTPAttempts: {           
    type: Number,
    default: 0
  },                               
  phoneOTPLastAttempt: {
    type: Date,  
    default: null
  },                      
  
  // Subscription
  subscriptionPlan: {
    type: String,
    enum: ['free', 'bronze', 'copper', 'silver', 'gold2', 'gold1', 'diamond', 'patron', 'elite', 'quantum'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial', 'cancelled'],
    default: 'trial'
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  },
  
  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Assessment tracking
  assessmentCompleted: {
    type: Boolean,
    default: false
  },
  assessmentCompletedAt: {
    type: Date,
    default: null
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
            
  // Analytics
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
  
// Methods
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();    
  this.loginCount += 1;
  return this.save();
};
  
userSchema.methods.canRequestOTP = function() {
  if (!this.phoneOTPLastAttempt) return true;
    
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  if (this.phoneOTPLastAttempt < fifteenMinutesAgo) {
    this.phoneOTPAttempts = 0; // Reset after 15 minutes
    return true;
  };          
  
  return this.phoneOTPAttempts < 3;
}; 

userSchema.methods.hasProAccess = function() {
  return ['bronze', 'copper', 'silver', 'gold2', 'gold1', 'diamond', 'patron', 'elite', 'quantum'].includes(this.subscriptionPlan) 
    && this.subscriptionStatus === 'active';
};

export const User = mongoose.model("User", userSchema);



