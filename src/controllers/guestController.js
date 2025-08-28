import Guest from '../models/Guest.js';
import { io } from '../server.js';

export const createGuest = async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    
    // Emit WebSocket event for new guest check-in
    io.to(`property:${guest.property_id}`).emit('guest.checked_in', {
      guest,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: guest,
      message: 'Guest created successfully'
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create guest',
      error: error.message
    });
  }
};

export const getGuests = async (req, res) => {
  try {
    const { property_id } = req.query;
    let guests;

    if (property_id) {
      guests = await Guest.findByProperty(property_id);
    } else {
      // If no property_id provided, return empty array or handle as needed
      guests = [];
    }

    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guests',
      error: error.message
    });
  }
};

export const getGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findById(id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest',
      error: error.message
    });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.update(id, req.body);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: guest,
      message: 'Guest updated successfully'
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest',
      error: error.message
    });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findById(id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // End all active sessions before deleting
    await Guest.endAllSessions(id);
    
    const deleted = await Guest.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Emit WebSocket event for guest deletion
    io.to(`property:${guest.property_id}`).emit('guest.deleted', {
      guestId: id,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete guest',
      error: error.message
    });
  }
};

export const checkInGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.checkIn(id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Emit WebSocket event for guest check-in
    io.to(`property:${guest.property_id}`).emit('guest.checked_in', {
      guest,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: guest,
      message: 'Guest checked in successfully'
    });
  } catch (error) {
    console.error('Error checking in guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in guest',
      error: error.message
    });
  }
};

export const checkOutGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findById(id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // End all active sessions
    const endedSessions = await Guest.endAllSessions(id);
    
    // Update guest checkout
    const checkedOutGuest = await Guest.checkOut(id);

    // Emit WebSocket events for cleanup
    io.to(`property:${guest.property_id}`).emit('guest.checked_out', {
      guest: checkedOutGuest,
      endedSessions,
      timestamp: new Date().toISOString()
    });

    io.to(`property:${guest.property_id}`).emit('sessions.cleared', {
      guestId: id,
      sessionIds: endedSessions.map(s => s.id),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: checkedOutGuest,
      message: 'Guest checked out successfully',
      clearedSessions: endedSessions.length
    });
  } catch (error) {
    console.error('Error checking out guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out guest',
      error: error.message
    });
  }
};

export const getGuestSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const sessions = await Guest.getSessions(id);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching guest sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest sessions',
      error: error.message
    });
  }
};

export const createGuestSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { streaming_service_id, device_id, session_token } = req.body;
    
    const session = await Guest.createSession(id, streaming_service_id, device_id, session_token);
    
    res.status(201).json({
      success: true,
      data: session,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating guest session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
};

export const endGuestSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Guest.endSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending guest session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
};