import { EventRegistration } from '../../models/eventRegistration.models.js';
import { Event } from '../../models/event.models.js';
import { User } from '../../models/user.models.js';

/**
 * Register user for an event
 * POST /api/events/:eventId/register
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id; // From auth middleware
    const { notes } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user can register
    if (!event.canRegister()) {
      return res.status(400).json({
        success: false,
        message: "Registration is not available for this event",
        reason: event.status === 'cancelled' ? 'Event cancelled' :
                event.status === 'past' ? 'Event has ended' :
                event.isFull() ? 'Event is full' :
                'Registration deadline passed'
      });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      userId,
      eventId,
      status: { $ne: 'cancelled' }
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // Get current price
    const currentPrice = event.getCurrentPrice();

    // Create registration
    const registration = await EventRegistration.create({
      userId,
      eventId,
      notes,
      paymentAmount: currentPrice,
      paymentStatus: currentPrice > 0 ? 'pending' : 'completed',
      status: currentPrice > 0 ? 'pending' : 'confirmed'
    });

    // Update event attendee count
    await event.updateAttendeeCount();
    event.currentAttendees += 1;
    await event.save();

    console.log(`✅ User ${userId} registered for event: ${event.title}`);

    return res.status(201).json({
      success: true,
      message: currentPrice > 0 
        ? "Registration created. Please complete payment." 
        : "Successfully registered for event",
      registration,
      event: {
        _id: event._id,
        title: event.title,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location
      },
      paymentRequired: currentPrice > 0,
      paymentAmount: currentPrice
    });

  } catch (error) {
    console.error("❌ Error registering for event:", error);

    // Handle duplicate registration
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Cancel event registration
 * DELETE /api/events/:eventId/register
 */
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await EventRegistration.findOne({
      userId,
      eventId,
      status: { $ne: 'cancelled' }
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Cancel registration
    registration.status = 'cancelled';
    await registration.save();

    // Update event attendee count
    const event = await Event.findById(eventId);
    if (event) {
      event.currentAttendees = Math.max(0, event.currentAttendees - 1);
      await event.save();
    }

    console.log(`✅ Registration cancelled for event: ${eventId}`);

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      registration
    });

  } catch (error) {
    console.error("❌ Error cancelling registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Get user's event registrations
 * GET /api/events/my-registrations
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, upcoming, past } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    let registrations = await EventRegistration.find(query)
      .populate({
        path: 'eventId',
        select: 'title eventDate eventTime location category emoji color status thumbnailUrl'
      })
      .sort({ registeredAt: -1 });

    // Filter by upcoming/past based on event date
    if (upcoming === 'true') {
      registrations = registrations.filter(r => 
        r.eventId && r.eventId.status === 'upcoming'
      );
    }
    if (past === 'true') {
      registrations = registrations.filter(r => 
        r.eventId && r.eventId.status === 'past'
      );
    }

    return res.status(200).json({
      success: true,
      message: "Registrations fetched successfully",
      registrations,
      count: registrations.length
    });

  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Check if user is registered for an event
 * GET /api/events/:eventId/registration-status
 */
export const getRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await EventRegistration.findOne({
      userId,
      eventId
    });

    return res.status(200).json({
      success: true,
      isRegistered: !!registration && registration.status !== 'cancelled',
      registration: registration || null
    });

  } catch (error) {
    console.error("❌ Error checking registration status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Get all registrations for an event (admin)
 * GET /api/events/:eventId/registrations
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { eventId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [registrations, totalCount] = await Promise.all([
      EventRegistration.find(query)
        .populate({
          path: 'userId',
          select: 'displayName email phone photoURL'
        })
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventRegistration.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: "Event registrations fetched successfully",
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalRegistrations: totalCount
      }
    });

  } catch (error) {
    console.error("❌ Error fetching event registrations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Check-in user at event
 * PATCH /api/events/:eventId/registrations/:registrationId/checkin
 */
export const checkInUser = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      eventId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    if (registration.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Cannot check-in. Registration status: " + registration.status
      });
    }

    registration.markAttended();
    await registration.save();

    return res.status(200).json({
      success: true,
      message: "User checked in successfully",
      registration
    });

  } catch (error) {
    console.error("❌ Error checking in user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Update payment status after payment completion
 * PATCH /api/events/:eventId/registrations/:registrationId/payment
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { paymentStatus, paymentId } = req.body;

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      eventId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    registration.paymentStatus = paymentStatus;
    if (paymentId) {
      registration.paymentId = paymentId;
    }
    
    if (paymentStatus === 'completed') {
      registration.paidAt = new Date();
      registration.status = 'confirmed';
    } else if (paymentStatus === 'failed') {
      registration.status = 'cancelled';
    }

    await registration.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated",
      registration
    });

  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

