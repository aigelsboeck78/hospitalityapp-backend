import DiningPlace from '../models/DiningPlace.js';

export const getDiningPlaces = async (req, res) => {
    try {
        const filters = {
            cuisine_type: req.query.cuisine_type,
            price_range: req.query.price_range,
            featured: req.query.featured === 'true',
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const diningPlaces = await DiningPlace.findAll(filters);

        res.json({
            success: true,
            data: diningPlaces,
            total: diningPlaces.length
        });
    } catch (error) {
        console.error('Error fetching dining places:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dining places'
        });
    }
};

export const getDiningPlaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const diningPlace = await DiningPlace.findById(id);

        if (!diningPlace) {
            return res.status(404).json({
                success: false,
                error: 'Dining place not found'
            });
        }

        res.json({
            success: true,
            data: diningPlace
        });
    } catch (error) {
        console.error('Error fetching dining place:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dining place'
        });
    }
};

export const createDiningPlace = async (req, res) => {
    try {
        const diningData = req.body;
        
        // Validate required fields
        if (!diningData.name || !diningData.cuisine_type) {
            return res.status(400).json({
                success: false,
                error: 'Name and cuisine type are required'
            });
        }

        const diningPlace = await DiningPlace.create(diningData);

        res.status(201).json({
            success: true,
            data: diningPlace
        });
    } catch (error) {
        console.error('Error creating dining place:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create dining place'
        });
    }
};

export const updateDiningPlace = async (req, res) => {
    try {
        const { id } = req.params;
        const diningData = req.body;

        const diningPlace = await DiningPlace.update(id, diningData);

        if (!diningPlace) {
            return res.status(404).json({
                success: false,
                error: 'Dining place not found'
            });
        }

        res.json({
            success: true,
            data: diningPlace
        });
    } catch (error) {
        console.error('Error updating dining place:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update dining place'
        });
    }
};

export const deleteDiningPlace = async (req, res) => {
    try {
        const { id } = req.params;
        const diningPlace = await DiningPlace.delete(id);

        if (!diningPlace) {
            return res.status(404).json({
                success: false,
                error: 'Dining place not found'
            });
        }

        res.json({
            success: true,
            data: diningPlace
        });
    } catch (error) {
        console.error('Error deleting dining place:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete dining place'
        });
    }
};

export const getFeaturedDining = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        const diningPlaces = await DiningPlace.getFeatured(limit);

        res.json({
            success: true,
            data: diningPlaces,
            total: diningPlaces.length
        });
    } catch (error) {
        console.error('Error fetching featured dining:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured dining places'
        });
    }
};

export const getDiningByCuisine = async (req, res) => {
    try {
        const { cuisine } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const diningPlaces = await DiningPlace.getByCuisineType(cuisine, limit);

        res.json({
            success: true,
            data: diningPlaces,
            total: diningPlaces.length
        });
    } catch (error) {
        console.error('Error fetching dining by cuisine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dining places by cuisine'
        });
    }
};