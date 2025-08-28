import StreamingService from '../models/StreamingService.js';

export const createStreamingService = async (req, res) => {
  try {
    const service = await StreamingService.create(req.body);
    res.status(201).json({
      success: true,
      data: service,
      message: 'Streaming service created successfully'
    });
  } catch (error) {
    console.error('Error creating streaming service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create streaming service',
      error: error.message
    });
  }
};

export const getStreamingServices = async (req, res) => {
  try {
    const { property_id, service_type, active_only } = req.query;
    let services;

    if (!property_id) {
      return res.status(400).json({
        success: false,
        message: 'property_id is required'
      });
    }

    if (active_only === 'true') {
      if (service_type) {
        services = await StreamingService.findByType(property_id, service_type);
      } else {
        services = await StreamingService.findActiveByProperty(property_id);
      }
    } else {
      services = await StreamingService.findByProperty(property_id);
    }

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

export const getStreamingService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await StreamingService.findById(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Streaming service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching streaming service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streaming service',
      error: error.message
    });
  }
};

export const updateStreamingService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await StreamingService.update(id, req.body);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Streaming service not found'
      });
    }

    res.json({
      success: true,
      data: service,
      message: 'Streaming service updated successfully'
    });
  } catch (error) {
    console.error('Error updating streaming service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streaming service',
      error: error.message
    });
  }
};

export const deleteStreamingService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StreamingService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Streaming service not found'
      });
    }

    res.json({
      success: true,
      message: 'Streaming service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting streaming service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete streaming service',
      error: error.message
    });
  }
};

export const updateStreamingServiceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;
    
    const service = await StreamingService.updateDisplayOrder(id, display_order);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Streaming service not found'
      });
    }

    res.json({
      success: true,
      data: service,
      message: 'Streaming service order updated successfully'
    });
  } catch (error) {
    console.error('Error updating streaming service order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streaming service order',
      error: error.message
    });
  }
};

export const toggleStreamingServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await StreamingService.toggleActive(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Streaming service not found'
      });
    }

    res.json({
      success: true,
      data: service,
      message: `Streaming service ${service.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling streaming service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle streaming service status',
      error: error.message
    });
  }
};

export const getStreamingServiceSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const sessions = await StreamingService.getActiveSessions(id);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching streaming service sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streaming service sessions',
      error: error.message
    });
  }
};