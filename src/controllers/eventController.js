import Event from '../models/Event.js';
import EventScraperService from '../services/eventScraperService.js';

const eventScraper = new EventScraperService();

export const getEvents = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            category: req.query.category,
            featured: req.query.featured === 'true',
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const events = await Event.findAll(filters);

        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event'
        });
    }
};

export const getTodaysEvents = async (req, res) => {
    try {
        const events = await Event.getTodaysEvents();

        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('Error fetching today\'s events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s events'
        });
    }
};

export const getUpcomingEvents = async (req, res) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const events = await Event.getUpcomingEvents(days);

        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming events'
        });
    }
};

export const getFeaturedEvents = async (req, res) => {
    try {
        const events = await Event.getFeaturedEvents();

        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('Error fetching featured events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured events'
        });
    }
};

export const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        
        // Validate required fields
        if (!eventData.name || !eventData.start_date) {
            return res.status(400).json({
                success: false,
                error: 'Name and start date are required'
            });
        }

        const event = await Event.create(eventData);

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create event'
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventData = req.body;

        const event = await Event.update(id, eventData);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update event'
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.delete(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event'
        });
    }
};

export const scrapeEvents = async (req, res) => {
    try {
        console.log('🚀 Manual event scraping triggered via API');
        const events = await eventScraper.scrapeEvents();

        res.json({
            success: true,
            message: 'Event scraping completed',
            data: events,
            total: events.length
        });
    } catch (error) {
        console.error('Error in manual event scraping:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to scrape events'
        });
    }
};

export const testScraping = async (req, res) => {
    try {
        const result = await eventScraper.testScraping();

        res.json({
            success: true,
            message: 'Scraping test completed',
            canConnect: result
        });
    } catch (error) {
        console.error('Error testing scraping:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test scraping'
        });
    }
};

export const getEventStats = async (req, res) => {
    try {
        const todaysEvents = await Event.getTodaysEvents();
        const upcomingEvents = await Event.getUpcomingEvents(30);
        const featuredEvents = await Event.getFeaturedEvents();

        res.json({
            success: true,
            data: {
                today: todaysEvents.length,
                upcoming: upcomingEvents.length,
                featured: featuredEvents.length,
                total: upcomingEvents.length
            }
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event statistics'
        });
    }
};