import express from 'express';
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getCurrentGuest,
  getPropertyActivities,
  getPropertyStreamingServices
} from '../controllers/propertyController.js';
import { validateProperty, validatePropertyUpdate } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes for tvOS app
router.get('/:id', optionalAuth, getProperty);
router.get('/:id/guests/current', optionalAuth, getCurrentGuest);
router.get('/:id/activities', optionalAuth, getPropertyActivities);
router.get('/:id/streaming-services', optionalAuth, getPropertyStreamingServices);

// Protected routes for web admin
router.post('/', authenticateToken, validateProperty, createProperty);
router.get('/', authenticateToken, getProperties);
router.put('/:id', authenticateToken, validatePropertyUpdate, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

export default router;