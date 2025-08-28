import cron from 'node-cron';
import Guest from '../models/Guest.js';
import { logger } from '../middleware/errorHandler.js';
import { io } from '../server.js';

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.cleanupCount = 0;
  }

  // Start the scheduled cleanup task
  start() {
    const intervalMinutes = parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 5;
    const cronExpression = `*/${intervalMinutes} * * * *`; // Run every N minutes
    
    logger.info(`Starting cleanup service with interval: ${intervalMinutes} minutes`);
    
    // Schedule the cleanup task
    cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        logger.warn('Previous cleanup task still running, skipping this iteration');
        return;
      }
      
      await this.runCleanup();
    });

    // Run initial cleanup on startup
    setTimeout(() => this.runCleanup(), 10000); // Wait 10 seconds after startup
  }

  // Main cleanup function
  async runCleanup() {
    try {
      this.isRunning = true;
      this.lastRun = new Date();
      
      logger.info('Starting automatic guest cleanup...');
      
      // Find all guests who should be checked out
      const expiredGuests = await Guest.findExpired();
      
      if (expiredGuests.length === 0) {
        logger.info('No guests need cleanup');
        return;
      }

      logger.info(`Found ${expiredGuests.length} expired guests requiring cleanup`);
      
      const cleanupResults = [];
      
      for (const guest of expiredGuests) {
        try {
          const result = await this.cleanupGuest(guest);
          cleanupResults.push(result);
          this.cleanupCount++;
        } catch (error) {
          logger.error(`Failed to cleanup guest ${guest.id}:`, error);
          cleanupResults.push({
            guestId: guest.id,
            success: false,
            error: error.message
          });
        }
      }

      logger.info(`Cleanup completed. Processed ${cleanupResults.length} guests`);
      
      // Emit summary event
      io.emit('cleanup.completed', {
        timestamp: new Date().toISOString(),
        processedCount: cleanupResults.length,
        successCount: cleanupResults.filter(r => r.success).length,
        results: cleanupResults
      });

    } catch (error) {
      logger.error('Cleanup service error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Clean up a specific guest
  async cleanupGuest(guest) {
    logger.info(`Cleaning up guest: ${guest.first_name} ${guest.last_name} (${guest.id})`);
    
    try {
      // 1. End all active streaming sessions
      const endedSessions = await Guest.endAllSessions(guest.id);
      logger.info(`Ended ${endedSessions.length} sessions for guest ${guest.id}`);

      // 2. Mark guest as checked out
      const checkedOutGuest = await Guest.checkOut(guest.id);
      
      // 3. Emit WebSocket events to connected devices
      io.to(`property:${guest.property_id}`).emit('guest.auto_checkout', {
        guest: checkedOutGuest,
        endedSessions,
        timestamp: new Date().toISOString(),
        reason: 'automatic_cleanup'
      });

      io.to(`property:${guest.property_id}`).emit('sessions.cleared', {
        guestId: guest.id,
        sessionIds: endedSessions.map(s => s.id),
        timestamp: new Date().toISOString(),
        reason: 'automatic_cleanup'
      });

      // 4. Clear any cached data or temporary files if needed
      await this.clearGuestData(guest);

      const result = {
        guestId: guest.id,
        propertyId: guest.property_id,
        guestName: `${guest.first_name} ${guest.last_name}`,
        success: true,
        clearedSessions: endedSessions.length,
        checkoutTime: checkedOutGuest.actual_check_out,
        timestamp: new Date().toISOString()
      };

      logger.info(`Successfully cleaned up guest ${guest.id}`);
      return result;

    } catch (error) {
      logger.error(`Failed to cleanup guest ${guest.id}:`, error);
      throw error;
    }
  }

  // Clear any additional guest data (extend as needed)
  async clearGuestData(guest) {
    try {
      // This is where you would clear any additional data:
      // - Cached preferences
      // - Temporary files
      // - Device-specific settings
      // - Third-party service integrations
      
      logger.info(`Cleared additional data for guest ${guest.id}`);
    } catch (error) {
      logger.error(`Failed to clear additional data for guest ${guest.id}:`, error);
      // Don't throw - this is not critical
    }
  }

  // Manual cleanup trigger (for testing or emergency use)
  async runManualCleanup(guestId = null) {
    try {
      logger.info(`Starting manual cleanup${guestId ? ` for guest ${guestId}` : ' for all expired guests'}`);
      
      let guests;
      if (guestId) {
        const guest = await Guest.findById(guestId);
        guests = guest ? [guest] : [];
      } else {
        guests = await Guest.findExpired();
      }

      const results = [];
      for (const guest of guests) {
        const result = await this.cleanupGuest(guest);
        results.push(result);
      }

      return {
        success: true,
        processedCount: results.length,
        results
      };

    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      totalCleanups: this.cleanupCount,
      intervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 5
    };
  }

  // Force immediate cleanup (for testing)
  async forceCleanup() {
    logger.info('Force cleanup requested');
    await this.runCleanup();
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

export default cleanupService;