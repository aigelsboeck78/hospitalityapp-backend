import express from 'express';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  updateActivityOrder,
  toggleActivityStatus
} from '../controllers/activityController.js';
import { validateActivity, validateActivityUpdate } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import imageSearchService from '../services/imageSearchService.js';
import pool from '../config/database.js';

const router = express.Router();

// Public routes for tvOS app (read-only)
router.get('/', optionalAuth, getActivities);
router.get('/:id', optionalAuth, getActivity);

// Protected routes for web admin
router.post('/', authenticateToken, validateActivity, createActivity);
router.put('/:id', authenticateToken, validateActivityUpdate, updateActivity);
router.delete('/:id', authenticateToken, deleteActivity);
router.patch('/:id/order', authenticateToken, updateActivityOrder);
router.patch('/:id/toggle', authenticateToken, toggleActivityStatus);

// Image search endpoint
router.post('/:id/search-image', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { activityName, location } = req.body;
    
    // Search for an image
    const imageResult = await imageSearchService.searchActivityImage(
      activityName || 'outdoor activity',
      location || 'Schladming Austria'
    );
    
    if (imageResult) {
      // Update only the image_url field directly
      const updateQuery = `
        UPDATE activities 
        SET image_url = $2
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [id, imageResult.url]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      
      res.json({
        success: true,
        image: imageResult,
        activity: result.rows[0],
        message: 'Image found and saved successfully'
      });
    } else {
      res.json({
        success: false,
        message: 'No suitable image found'
      });
    }
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search for image'
    });
  }
});

export default router;