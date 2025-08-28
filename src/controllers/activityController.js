import Activity from '../models/Activity.js';

export const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json({
      success: true,
      data: activity,
      message: 'Activity created successfully'
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message
    });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { property_id, guest_type } = req.query;
    let activities;

    if (property_id && guest_type) {
      activities = await Activity.findByPropertyAndGuestType(property_id, guest_type);
    } else if (property_id) {
      activities = await Activity.findByProperty(property_id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'property_id is required'
      });
    }

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

export const getActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.update(id, req.body);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Activity.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
};

export const updateActivityOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;
    
    const activity = await Activity.updateDisplayOrder(id, display_order);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Activity order updated successfully'
    });
  } catch (error) {
    console.error('Error updating activity order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity order',
      error: error.message
    });
  }
};

export const toggleActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.toggleActive(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity,
      message: `Activity ${activity.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling activity status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle activity status',
      error: error.message
    });
  }
};