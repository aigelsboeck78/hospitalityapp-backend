import express from 'express';
import * as eventController from '../controllers/eventController.js';
import Event from '../models/Event.js';

const router = express.Router();

// Get all events with optional filters
router.get('/', eventController.getEvents);

// Get today's events
router.get('/today', eventController.getTodaysEvents);

// Get upcoming events
router.get('/upcoming', eventController.getUpcomingEvents);

// Get featured events
router.get('/featured', eventController.getFeaturedEvents);

// Get event statistics
router.get('/stats', eventController.getEventStats);

// Test scraping connectivity
router.get('/test-scraping', eventController.testScraping);

// Manual scraping trigger (admin only in production)
router.post('/scrape', eventController.scrapeEvents);

// Get specific event
router.get('/:id', eventController.getEventById);

// Create new event
router.post('/', eventController.createEvent);

// Toggle event status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        const updatedEvent = await Event.update(id, {
            ...event,
            is_active: !event.is_active
        });
        
        res.json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error toggling event status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle event status'
        });
    }
});

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

export default router;