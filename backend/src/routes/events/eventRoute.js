import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getPastEvents,
  cancelEvent,
  addEventImages,
  addEventVideo
} from '../../controller/events/events.controller.js';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationStatus,
  getEventRegistrations,
  checkInUser,
  updatePaymentStatus
} from '../../controller/events/eventRegistration.controller.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';

const router = express.Router();

// ========================================
// Event CRUD Routes
// ========================================

// Create new event
// POST /api/events/create
router.post('/create', createEvent);

// Get all events with filters
// GET /api/events/all
// Query params: status, category, isPaid, locationType, search, page, limit, sortBy, sortOrder
router.get('/all', getAllEvents);

// Get upcoming events (convenience endpoint)
// GET /api/events/upcoming
router.get('/upcoming', getUpcomingEvents);

// Get past events (convenience endpoint)
// GET /api/events/past
router.get('/past', getPastEvents);

// Get event by slug (must be before /:id to avoid conflicts)
// GET /api/events/slug/:slug
router.get('/slug/:slug', getEventBySlug);

// Get event by ID
// GET /api/events/:id
router.get('/:id', getEventById);

// Update event
// PUT /api/events/:id
router.put('/:id', updateEvent);

// Delete event
// DELETE /api/events/:id
router.delete('/:id', deleteEvent);

// ========================================
// Event Actions
// ========================================

// Cancel event (soft delete - sets status to 'cancelled')
// PATCH /api/events/:id/cancel
router.patch('/:id/cancel', cancelEvent);

// Add images to event (for past events gallery)
// POST /api/events/:id/images
router.post('/:id/images', addEventImages);

// Add YouTube video to event (for recordings)
// POST /api/events/:id/videos
router.post('/:id/videos', addEventVideo);

// ========================================
// Event Registration Routes (Protected)
// ========================================

// Get user's event registrations
// GET /api/events/my-registrations
router.get('/my-registrations', protectedRoutes, getMyRegistrations);

// Register for an event
// POST /api/events/:eventId/register
router.post('/:eventId/register', protectedRoutes, registerForEvent);

// Cancel registration
// DELETE /api/events/:eventId/register
router.delete('/:eventId/register', protectedRoutes, cancelRegistration);

// Check registration status
// GET /api/events/:eventId/registration-status
router.get('/:eventId/registration-status', protectedRoutes, getRegistrationStatus);

// Get all registrations for an event (admin)
// GET /api/events/:eventId/registrations
router.get('/:eventId/registrations', getEventRegistrations);

// Check-in user at event
// PATCH /api/events/:eventId/registrations/:registrationId/checkin
router.patch('/:eventId/registrations/:registrationId/checkin', checkInUser);

// Update payment status
// PATCH /api/events/:eventId/registrations/:registrationId/payment
router.patch('/:eventId/registrations/:registrationId/payment', updatePaymentStatus);

export default router;

