import express from 'express';
import {
  createGuest,
  getGuests,
  getGuest,
  updateGuest,
  deleteGuest,
  checkInGuest,
  checkOutGuest,
  getGuestSessions,
  createGuestSession,
  endGuestSession
} from '../controllers/guestController.js';
import { validateGuest, validateGuestUpdate, validateGuestSession } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Protected routes for web admin
router.post('/', authenticateToken, validateGuest, createGuest);
router.get('/', authenticateToken, getGuests);
router.get('/:id', authenticateToken, getGuest);
router.put('/:id', authenticateToken, validateGuestUpdate, updateGuest);
router.delete('/:id', authenticateToken, deleteGuest);

// Guest management routes
router.post('/:id/checkin', authenticateToken, checkInGuest);
router.post('/:id/checkout', authenticateToken, checkOutGuest);

// Session management routes (can be used by tvOS app)
router.get('/:id/sessions', optionalAuth, getGuestSessions);
router.post('/:id/sessions', optionalAuth, validateGuestSession, createGuestSession);
router.delete('/sessions/:sessionId', optionalAuth, endGuestSession);

export default router;