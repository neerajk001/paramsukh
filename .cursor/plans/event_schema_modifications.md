# Event Schema Modifications Plan

## Overview
Modify the Event model schema and create a new EventRegistration model to support the event management routes planned.

## Files to Modify

### 1. `backend/src/models/event.models.js`

#### Changes Required:

**A. Enable `_id` for images subdocument array**
- Currently, the `images` array doesn't have `_id` enabled, making it difficult to delete specific images by ID
- Change from:
  ```javascript
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
  ```
- To:
  ```javascript
  images: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
  ```

**B. Add slug auto-generation in pre-save hook**
- Add slug generation from title if slug is not provided
- Update the pre-save middleware to include:
  ```javascript
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure uniqueness by appending timestamp if needed
    // (This will be handled in controller with proper error handling)
  }
  ```

**C. Add index for locationType**
- Add index for filtering by location type:
  ```javascript
  eventSchema.index({ locationType: 1 });
  ```

**D. Add virtual or method to get actual registration count**
- The `currentAttendees` field should be synced with actual registrations
- This will be handled in the controller, but we can add a method:
  ```javascript
  eventSchema.methods.updateAttendeeCount = async function() {
    const EventRegistration = mongoose.model('EventRegistration');
    const count = await EventRegistration.countDocuments({ 
      eventId: this._id,
      status: 'confirmed'
    });
    this.currentAttendees = count;
    return count;
  };
  ```

### 2. `backend/src/models/eventRegistration.models.js` (NEW FILE)

Create a new model for tracking event registrations, similar to the Enrollment model pattern.

```javascript
import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  
  // Registration status
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no-show'],
    default: 'confirmed',
    index: true
  },
  
  // Payment information (for paid events)
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  
  // Additional registration data
  notes: {
    type: String,
    trim: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one registration per user per event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
eventRegistrationSchema.index({ eventId: 1, status: 1 });
eventRegistrationSchema.index({ userId: 1, status: 1 });
eventRegistrationSchema.index({ registeredAt: -1 });

// Methods
eventRegistrationSchema.methods.markAttended = function() {
  this.status = 'attended';
  this.checkedIn = true;
  this.checkedInAt = new Date();
  return this;
};

eventRegistrationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this;
};

export const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);
```

## Summary of Changes

1. **Event Model (`event.models.js`)**:
   - Enable `_id` for images subdocument array
   - Add slug auto-generation in pre-save hook
   - Add `locationType` index
   - Add method to sync attendee count with registrations

2. **EventRegistration Model (`eventRegistration.models.js`)** - NEW:
   - Create new model to track user registrations
   - Support payment tracking for paid events
   - Support check-in functionality
   - Compound unique index on userId + eventId

## Migration Notes

- Existing events will continue to work
- Images without `_id` will get one automatically on next save
- Existing events without slugs will get auto-generated slugs on next update
- The `currentAttendees` field in Event model should be synced with EventRegistration count in controllers

## Dependencies

- No new npm packages required
- Uses existing mongoose features

