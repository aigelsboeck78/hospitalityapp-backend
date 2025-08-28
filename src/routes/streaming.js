import express from 'express';
import {
  createStreamingService,
  getStreamingServices,
  getStreamingService,
  updateStreamingService,
  deleteStreamingService,
  updateStreamingServiceOrder,
  toggleStreamingServiceStatus,
  getStreamingServiceSessions
} from '../controllers/streamingController.js';
import { validateStreamingService, validateStreamingServiceUpdate } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes for tvOS app (read-only)
router.get('/', optionalAuth, getStreamingServices);
router.get('/:id', optionalAuth, getStreamingService);
router.get('/:id/sessions', optionalAuth, getStreamingServiceSessions);

// Protected routes for web admin
router.post('/', authenticateToken, validateStreamingService, createStreamingService);
router.put('/:id', authenticateToken, validateStreamingServiceUpdate, updateStreamingService);
router.delete('/:id', authenticateToken, deleteStreamingService);
router.patch('/:id/order', authenticateToken, updateStreamingServiceOrder);
router.patch('/:id/toggle', authenticateToken, toggleStreamingServiceStatus);

export default router;