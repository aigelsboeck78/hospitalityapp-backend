import express from 'express';
import DiningOption from '../models/DiningOption.js';
import { scrapeDiningImage } from '../services/imageScraper.js';

const router = express.Router();

// Get all dining options with filters
router.get('/', async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            location_area: req.query.location_area,
            cuisine_type: req.query.cuisine_type,
            price_range: req.query.price_range ? parseInt(req.query.price_range) : undefined,
            vegetarian: req.query.vegetarian === 'true',
            vegan: req.query.vegan === 'true',
            gluten_free: req.query.gluten_free === 'true',
            family_friendly: req.query.family_friendly === 'true',
            season: req.query.season,
            relevance_status: req.query.relevance_status,
            search: req.query.search,
            sort: req.query.sort,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const diningOptions = await DiningOption.findAll(filters);
        res.json(diningOptions);
    } catch (error) {
        console.error('Error fetching dining options:', error);
        res.status(500).json({ error: 'Failed to fetch dining options' });
    }
});

// Get dining recommendations based on guest profile and weather
router.post('/recommendations', async (req, res) => {
    try {
        const { guestProfile, weather } = req.body;
        const recommendations = await DiningOption.getRecommendations(guestProfile, weather);
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting dining recommendations:', error);
        res.status(500).json({ error: 'Failed to get dining recommendations' });
    }
});

// Get available categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await DiningOption.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get available cuisine types
router.get('/cuisines', async (req, res) => {
    try {
        const cuisines = await DiningOption.getCuisineTypes();
        res.json(cuisines);
    } catch (error) {
        console.error('Error fetching cuisine types:', error);
        res.status(500).json({ error: 'Failed to fetch cuisine types' });
    }
});

// Get available location areas
router.get('/locations', async (req, res) => {
    try {
        const locations = await DiningOption.getLocationAreas();
        res.json(locations);
    } catch (error) {
        console.error('Error fetching location areas:', error);
        res.status(500).json({ error: 'Failed to fetch location areas' });
    }
});

// Get single dining option by ID
router.get('/:id', async (req, res) => {
    try {
        const dining = await DiningOption.findById(req.params.id);
        if (!dining) {
            return res.status(404).json({ error: 'Dining option not found' });
        }
        res.json(dining);
    } catch (error) {
        console.error('Error fetching dining option:', error);
        res.status(500).json({ error: 'Failed to fetch dining option' });
    }
});

// Create new dining option
router.post('/', async (req, res) => {
    try {
        const dining = await DiningOption.create(req.body);
        res.status(201).json(dining);
    } catch (error) {
        console.error('Error creating dining option:', error);
        res.status(500).json({ error: 'Failed to create dining option' });
    }
});

// Update dining option
router.put('/:id', async (req, res) => {
    try {
        const dining = await DiningOption.update(req.params.id, req.body);
        if (!dining) {
            return res.status(404).json({ 
                success: false,
                error: 'Dining option not found' 
            });
        }
        res.json({ 
            success: true,
            data: dining 
        });
    } catch (error) {
        console.error('Error updating dining option:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update dining option' 
        });
    }
});

// Delete dining option (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const dining = await DiningOption.delete(req.params.id);
        if (!dining) {
            return res.status(404).json({ 
                success: false,
                error: 'Dining option not found' 
            });
        }
        res.json({ 
            success: true,
            message: 'Dining option deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting dining option:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete dining option' 
        });
    }
});

// Scrape image for a specific dining place
router.post('/:id/scrape-image', async (req, res) => {
    try {
        // Get the dining place
        const dining = await DiningOption.findById(req.params.id);
        if (!dining) {
            return res.status(404).json({ 
                success: false,
                error: 'Dining option not found' 
            });
        }
        
        // Scrape image
        const result = await scrapeDiningImage(dining);
        
        if (result.success && result.imageUrl) {
            // Update the database with the new image
            await DiningOption.update(req.params.id, {
                ...dining,
                image_url: result.imageUrl
            });
            
            res.json({
                success: true,
                imageUrl: result.imageUrl,
                source: result.source,
                message: `Successfully scraped image from ${result.source}`
            });
        } else {
            res.json({
                success: false,
                message: 'Could not find a suitable image'
            });
        }
    } catch (error) {
        console.error('Error scraping image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to scrape image' 
        });
    }
});

export default router;