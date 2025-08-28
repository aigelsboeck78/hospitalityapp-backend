import PropertyInformation from '../models/PropertyInformation.js';

export const getPropertyInfo = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { active } = req.query;
        
        const info = await PropertyInformation.findByProperty(
            propertyId, 
            active === 'true'
        );

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error fetching property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch property information'
        });
    }
};

export const getPropertyInfoById = async (req, res) => {
    try {
        const { id } = req.params;
        const info = await PropertyInformation.findById(id);

        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Property information not found'
            });
        }

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error fetching property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch property information'
        });
    }
};

export const createPropertyInfo = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const infoData = {
            ...req.body,
            property_id: propertyId
        };

        const info = await PropertyInformation.create(infoData);

        res.status(201).json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error creating property information:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create property information'
        });
    }
};

export const updatePropertyInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const info = await PropertyInformation.update(id, req.body);

        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Property information not found'
            });
        }

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error updating property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update property information'
        });
    }
};

export const upsertPropertyInfo = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const infoData = {
            ...req.body,
            property_id: propertyId
        };

        const info = await PropertyInformation.upsert(infoData);

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error upserting property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upsert property information'
        });
    }
};

export const deletePropertyInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const info = await PropertyInformation.delete(id);

        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Property information not found'
            });
        }

        res.json({
            success: true,
            message: 'Property information deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete property information'
        });
    }
};

export const togglePropertyInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const info = await PropertyInformation.toggleActive(id);

        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Property information not found'
            });
        }

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error toggling property information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle property information'
        });
    }
};

export const updatePropertyInfoOrder = async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items must be an array'
            });
        }

        await PropertyInformation.updateOrder(items);

        res.json({
            success: true,
            message: 'Order updated successfully'
        });
    } catch (error) {
        console.error('Error updating property information order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order'
        });
    }
};

export const getInfoCategories = async (req, res) => {
    try {
        const categories = await PropertyInformation.getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
};

export const getInfoTypes = async (req, res) => {
    try {
        const types = await PropertyInformation.getTypes();
        
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Error fetching types:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch types'
        });
    }
};