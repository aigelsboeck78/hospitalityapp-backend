import Property from '../models/Property.js';
import { validateProperty } from '../middleware/validation.js';

export const createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

export const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.update(id, req.body);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
};

export const getCurrentGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Property.getCurrentGuest(id);
    
    res.json({
      success: true,
      data: guest || null
    });
  } catch (error) {
    console.error('Error fetching current guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current guest',
      error: error.message
    });
  }
};

export const getPropertyActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_type } = req.query;
    
    const activities = await Property.getActivities(id, guest_type);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

export const getPropertyStreamingServices = async (req, res) => {
  try {
    const { id } = req.params;
    const services = await Property.getStreamingServices(id);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streaming services',
      error: error.message
    });
  }
};