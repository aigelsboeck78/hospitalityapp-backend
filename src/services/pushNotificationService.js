import pool from '../config/database.js';
import PropertyDevice from '../models/PropertyDevice.js';
import crypto from 'crypto';

class PushNotificationService {
    constructor() {
        this.activeConnections = new Map(); // deviceId -> WebSocket connection
        this.pendingNotifications = new Map(); // deviceId -> array of notifications
        this.notificationHandlers = new Map(); // notification type -> handler function
        
        // Register default handlers
        this.registerDefaultHandlers();
    }

    registerDefaultHandlers() {
        // MDM command notification
        this.registerHandler('mdm_command', async (device, payload) => {
            console.log(`MDM command notification for device ${device.identifier}: ${payload.command_type}`);
            return {
                type: 'mdm_command',
                command: payload.command_type,
                data: payload
            };
        });

        // System alert notification
        this.registerHandler('system_alert', async (device, payload) => {
            console.log(`System alert for device ${device.identifier}: ${payload.message}`);
            return {
                type: 'system_alert',
                title: payload.title,
                message: payload.message,
                severity: payload.severity || 'info'
            };
        });

        // Configuration update notification
        this.registerHandler('config_update', async (device, payload) => {
            console.log(`Configuration update for device ${device.identifier}`);
            return {
                type: 'config_update',
                profiles: payload.profiles || [],
                settings: payload.settings || {}
            };
        });

        // App update notification
        this.registerHandler('app_update', async (device, payload) => {
            console.log(`App update notification for device ${device.identifier}`);
            return {
                type: 'app_update',
                version: payload.version,
                forceUpdate: payload.forceUpdate || false,
                updateUrl: payload.updateUrl
            };
        });

        // Wake device notification
        this.registerHandler('wake_device', async (device, payload) => {
            console.log(`Wake device notification for ${device.identifier}`);
            return {
                type: 'wake_device',
                timestamp: new Date().toISOString()
            };
        });
    }

    // Register a notification handler
    registerHandler(type, handler) {
        this.notificationHandlers.set(type, handler);
    }

    // Register a device connection (WebSocket)
    registerDeviceConnection(deviceId, connection) {
        this.activeConnections.set(deviceId, connection);
        
        // Send any pending notifications
        this.processPendingNotifications(deviceId);
    }

    // Unregister a device connection
    unregisterDeviceConnection(deviceId) {
        this.activeConnections.delete(deviceId);
    }

    // Send push notification to a device
    async sendNotification(deviceId, type, payload, options = {}) {
        try {
            const device = await PropertyDevice.findById(deviceId);
            if (!device) {
                throw new Error(`Device not found: ${deviceId}`);
            }

            // Check if device has push token (for APNS)
            if (device.push_token && options.useAPNS !== false) {
                // In production, this would send via Apple Push Notification Service
                await this.sendAPNSNotification(device.push_token, type, payload);
            }

            // Check if device has active WebSocket connection
            const connection = this.activeConnections.get(deviceId);
            if (connection) {
                // Get handler for this notification type
                const handler = this.notificationHandlers.get(type);
                const notificationData = handler ? 
                    await handler(device, payload) : 
                    { type, ...payload };

                // Send via WebSocket
                if (connection.readyState === 1) { // WebSocket.OPEN
                    connection.send(JSON.stringify({
                        type: 'push_notification',
                        data: notificationData,
                        timestamp: new Date().toISOString(),
                        id: this.generateNotificationId()
                    }));

                    // Log successful delivery
                    await this.logNotification(deviceId, type, 'delivered', notificationData);
                    return true;
                }
            }

            // Queue notification for later delivery
            if (options.queue !== false) {
                await this.queueNotification(deviceId, type, payload);
            }

            return false;
        } catch (error) {
            console.error(`Error sending notification to device ${deviceId}:`, error);
            await this.logNotification(deviceId, type, 'failed', { error: error.message });
            throw error;
        }
    }

    // Send notification to all devices in a property
    async sendPropertyNotification(propertyId, type, payload, options = {}) {
        try {
            const devices = await PropertyDevice.findByProperty(propertyId);
            const results = [];

            for (const device of devices) {
                if (device.is_active) {
                    try {
                        const sent = await this.sendNotification(device.id, type, payload, options);
                        results.push({ deviceId: device.id, sent });
                    } catch (error) {
                        results.push({ deviceId: device.id, sent: false, error: error.message });
                    }
                }
            }

            return results;
        } catch (error) {
            console.error(`Error sending property notification:`, error);
            throw error;
        }
    }

    // Queue notification for later delivery
    async queueNotification(deviceId, type, payload) {
        try {
            const result = await pool.query(`
                INSERT INTO push_notification_queue (
                    device_id, notification_type, payload, status
                ) VALUES ($1, $2, $3, 'pending')
                RETURNING id
            `, [deviceId, type, JSON.stringify(payload)]);

            // Add to in-memory queue
            if (!this.pendingNotifications.has(deviceId)) {
                this.pendingNotifications.set(deviceId, []);
            }
            this.pendingNotifications.get(deviceId).push({
                id: result.rows[0].id,
                type,
                payload
            });

            return result.rows[0].id;
        } catch (error) {
            console.error('Error queuing notification:', error);
            throw error;
        }
    }

    // Process pending notifications for a device
    async processPendingNotifications(deviceId) {
        try {
            // Get pending notifications from database
            const result = await pool.query(`
                SELECT id, notification_type, payload
                FROM push_notification_queue
                WHERE device_id = $1 AND status = 'pending'
                ORDER BY created_at ASC
                LIMIT 10
            `, [deviceId]);

            for (const notification of result.rows) {
                try {
                    await this.sendNotification(
                        deviceId,
                        notification.notification_type,
                        notification.payload,
                        { queue: false }
                    );

                    // Mark as sent
                    await pool.query(`
                        UPDATE push_notification_queue
                        SET status = 'sent', sent_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                    `, [notification.id]);
                } catch (error) {
                    console.error(`Error processing pending notification ${notification.id}:`, error);
                    
                    // Mark as failed after multiple attempts
                    await pool.query(`
                        UPDATE push_notification_queue
                        SET 
                            retry_count = retry_count + 1,
                            status = CASE 
                                WHEN retry_count >= 2 THEN 'failed'
                                ELSE status
                            END,
                            error_message = $2
                        WHERE id = $1
                    `, [notification.id, error.message]);
                }
            }

            // Clear in-memory queue
            this.pendingNotifications.delete(deviceId);
        } catch (error) {
            console.error(`Error processing pending notifications for device ${deviceId}:`, error);
        }
    }

    // Send APNS notification (placeholder for actual APNS implementation)
    async sendAPNSNotification(pushToken, type, payload) {
        // In production, this would integrate with Apple Push Notification Service
        // For now, we'll just log it
        console.log(`APNS notification would be sent to token ${pushToken.substring(0, 10)}...`);
        
        // This would typically involve:
        // 1. Creating a JWT token for authentication with APNS
        // 2. Formatting the notification payload
        // 3. Sending HTTPS request to APNS servers
        // 4. Handling response and errors
        
        return true;
    }

    // Log notification for auditing
    async logNotification(deviceId, type, status, data) {
        try {
            await pool.query(`
                INSERT INTO push_notification_log (
                    device_id, notification_type, status, data
                ) VALUES ($1, $2, $3, $4)
            `, [deviceId, type, status, JSON.stringify(data)]);
        } catch (error) {
            console.error('Error logging notification:', error);
        }
    }

    // Generate unique notification ID
    generateNotificationId() {
        return crypto.randomBytes(16).toString('hex');
    }

    // Clean up old notifications
    async cleanupOldNotifications(daysToKeep = 7) {
        try {
            // Clean up queue
            const queueResult = await pool.query(`
                DELETE FROM push_notification_queue
                WHERE created_at < CURRENT_TIMESTAMP - ($1 || ' days')::interval
                AND status IN ('sent', 'failed')
                RETURNING id
            `, [daysToKeep]);

            // Clean up logs
            const logResult = await pool.query(`
                DELETE FROM push_notification_log
                WHERE created_at < CURRENT_TIMESTAMP - ($1 || ' days')::interval
                RETURNING id
            `, [daysToKeep]);

            console.log(`Cleaned up ${queueResult.rows.length} queued notifications and ${logResult.rows.length} log entries`);
        } catch (error) {
            console.error('Error cleaning up notifications:', error);
        }
    }

    // Get notification statistics
    async getStatistics(propertyId = null, days = 7) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    notification_type,
                    DATE(created_at) as date
                FROM push_notification_log
                WHERE created_at > CURRENT_TIMESTAMP - ($1 || ' days')::interval
            `;
            const params = [days];

            if (propertyId) {
                query += ` AND device_id IN (SELECT id FROM devices WHERE property_id = $2)`;
                params.push(propertyId);
            }

            query += ' GROUP BY notification_type, DATE(created_at) ORDER BY date DESC';

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting notification statistics:', error);
            throw error;
        }
    }

    // Send test notification
    async sendTestNotification(deviceId) {
        return this.sendNotification(deviceId, 'system_alert', {
            title: 'Test Notification',
            message: 'This is a test notification from the MDM system',
            severity: 'info'
        });
    }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;