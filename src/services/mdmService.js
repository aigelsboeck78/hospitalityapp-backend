import MDMCommand from '../models/MDMCommand.js';
import PropertyDevice from '../models/PropertyDevice.js';
import pool from '../config/database.js';
import pushNotificationService from './pushNotificationService.js';

class MDMService {
    constructor() {
        this.processingInterval = null;
        this.io = null;
    }
    
    // Set the Socket.IO instance
    setSocketIO(io) {
        this.io = io;
    }

    // Start the MDM command processor
    startCommandProcessor(intervalMs = 5000) {
        if (this.processingInterval) {
            console.log('MDM command processor already running');
            return;
        }

        console.log('Starting MDM command processor...');
        this.processingInterval = setInterval(() => {
            this.processCommands();
        }, intervalMs);

        // Process commands immediately on start
        this.processCommands();
    }

    // Stop the command processor
    stopCommandProcessor() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            console.log('MDM command processor stopped');
        }
    }

    // Process pending commands
    async processCommands() {
        try {
            const pendingCommands = await MDMCommand.getPendingCommands(10);
            
            for (const command of pendingCommands) {
                await this.executeCommand(command);
            }
        } catch (error) {
            console.error('Error processing MDM commands:', error);
        }
    }

    // Execute a single command
    async executeCommand(command) {
        try {
            const device = await PropertyDevice.findById(command.device_id);
            if (!device) {
                await MDMCommand.markAsFailed(command.id, 'Device not found');
                return;
            }

            // Check if device is online
            if (device.device_status !== 'online') {
                console.log(`Device ${device.identifier} is offline, skipping command`);
                return;
            }

            // Mark command as sent
            await MDMCommand.markAsSent(command.id);

            // Send command via WebSocket to the device
            if (this.io) {
                this.io.to(`device:${device.identifier}`).emit('mdm:command', {
                    commandId: command.id,
                    type: command.command_type,
                    payload: command.command_payload
                });
            }
            
            // Also send push notification for high priority commands
            if (command.priority >= 5) {
                await pushNotificationService.sendNotification(
                    device.id,
                    'mdm_command',
                    {
                        command_id: command.id,
                        command_type: command.command_type,
                        priority: command.priority,
                        ...command.command_payload
                    }
                );
            }

            // Handle specific command types
            switch (command.command_type) {
                case MDMCommand.CommandTypes.ENABLE_KIOSK_MODE:
                    await this.handleEnableKioskMode(device, command);
                    break;
                case MDMCommand.CommandTypes.DISABLE_KIOSK_MODE:
                    await this.handleDisableKioskMode(device, command);
                    break;
                case MDMCommand.CommandTypes.UPDATE_ALLOWED_APPS:
                    await this.handleUpdateAllowedApps(device, command);
                    break;
                case MDMCommand.CommandTypes.UPDATE_RESTRICTIONS:
                    await this.handleUpdateRestrictions(device, command);
                    break;
                case MDMCommand.CommandTypes.RESTART_DEVICE:
                    await this.handleRestartDevice(device, command);
                    break;
                case MDMCommand.CommandTypes.DEVICE_INFORMATION:
                    await this.handleDeviceInformation(device, command);
                    break;
                default:
                    console.log(`Processing command type: ${command.command_type}`);
            }

            // Update device's last command info
            await pool.query(`
                UPDATE devices SET
                    last_command_sent = CURRENT_TIMESTAMP,
                    last_command_status = $2
                WHERE id = $1
            `, [device.id, command.command_type]);

        } catch (error) {
            console.error(`Error executing command ${command.id}:`, error);
            await MDMCommand.markAsFailed(command.id, error.message);
        }
    }

    // Command handlers
    async handleEnableKioskMode(device, command) {
        const config = command.command_payload.config || {
            enabled: true,
            mode: 'autonomous',
            autoReturn: true,
            returnTimeout: 1800
        };

        await PropertyDevice.enableKioskMode(device.id, config);
        
        // Create alert for kiosk mode enabled
        await this.createAlert(
            device.id,
            device.property_id,
            'kiosk_enabled',
            'info',
            'Kiosk Mode Enabled',
            `Kiosk mode has been enabled on ${device.device_name}`
        );
    }

    async handleDisableKioskMode(device, command) {
        await PropertyDevice.disableKioskMode(device.id);
        
        // Create alert for kiosk mode disabled
        await this.createAlert(
            device.id,
            device.property_id,
            'kiosk_disabled',
            'warning',
            'Kiosk Mode Disabled',
            `Kiosk mode has been disabled on ${device.device_name}`
        );
    }

    async handleUpdateAllowedApps(device, command) {
        const apps = command.command_payload.apps || [];
        await PropertyDevice.updateAllowedApps(device.id, apps);
    }

    async handleUpdateRestrictions(device, command) {
        const restrictions = command.command_payload.restrictions || {};
        await PropertyDevice.updateRestrictions(device.id, restrictions);
    }

    async handleRestartDevice(device, command) {
        console.log(`Sending restart command to device ${device.identifier}`);
        // The actual restart will be handled by the tvOS app
    }

    async handleDeviceInformation(device, command) {
        console.log(`Requesting device information from ${device.identifier}`);
        // The device will respond with its information via WebSocket
    }

    // Queue a command for a device
    async queueCommand(deviceId, propertyId, commandType, payload = {}, priority = 0) {
        try {
            const command = await MDMCommand.create({
                device_id: deviceId,
                property_id: propertyId,
                command_type: commandType,
                command_payload: payload,
                priority: priority
            });

            // Process immediately if high priority
            if (priority > 5) {
                await this.executeCommand(command);
            }

            return command;
        } catch (error) {
            console.error('Error queuing MDM command:', error);
            throw error;
        }
    }

    // Queue commands for all devices in a property
    async queuePropertyCommand(propertyId, commandType, payload = {}, priority = 0) {
        try {
            const devices = await PropertyDevice.findByProperty(propertyId);
            const commands = [];

            for (const device of devices) {
                if (device.is_active && device.enrollment_status === 'enrolled') {
                    commands.push({
                        device_id: device.id,
                        property_id: propertyId,
                        command_type: commandType,
                        command_payload: payload,
                        priority: priority
                    });
                }
            }

            const results = await MDMCommand.bulkCreate(commands);
            console.log(`Queued ${results.length} commands for property ${propertyId}`);
            return results;
        } catch (error) {
            console.error('Error queuing property commands:', error);
            throw error;
        }
    }

    // Handle command response from device
    async handleCommandResponse(deviceIdentifier, commandId, status, data = {}) {
        try {
            const device = await PropertyDevice.findByIdentifier(deviceIdentifier);
            if (!device) {
                console.error(`Device not found: ${deviceIdentifier}`);
                return;
            }

            const command = await MDMCommand.findById(commandId);
            if (!command) {
                console.error(`Command not found: ${commandId}`);
                return;
            }

            // Update command status based on response
            if (status === 'acknowledged') {
                await MDMCommand.markAsAcknowledged(commandId);
            } else if (status === 'completed') {
                await MDMCommand.markAsCompleted(commandId, data);
                
                // Update device state based on command type
                if (command.command_type === MDMCommand.CommandTypes.DEVICE_INFORMATION) {
                    await this.updateDeviceInformation(device.id, data);
                }
            } else if (status === 'error' || status === 'failed') {
                await MDMCommand.markAsFailed(commandId, data.error || 'Command failed');
            }

            // Emit status update via WebSocket
            if (this.io) {
                this.io.to(`property:${device.property_id}`).emit('mdm:command:status', {
                    deviceId: device.id,
                    commandId: commandId,
                    status: status,
                    data: data
                });
            }
        } catch (error) {
            console.error('Error handling command response:', error);
        }
    }

    // Update device information from MDM response
    async updateDeviceInformation(deviceId, info) {
        try {
            await pool.query(`
                UPDATE devices SET
                    os_version = COALESCE($2, os_version),
                    app_version = COALESCE($3, app_version),
                    battery_level = COALESCE($4, battery_level),
                    storage_available = COALESCE($5, storage_available),
                    storage_total = COALESCE($6, storage_total),
                    metadata = jsonb_merge(metadata, $7::jsonb),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [
                deviceId,
                info.osVersion,
                info.appVersion,
                info.batteryLevel,
                info.storageAvailable,
                info.storageTotal,
                JSON.stringify(info.metadata || {})
            ]);
        } catch (error) {
            console.error('Error updating device information:', error);
        }
    }

    // Create an MDM alert
    async createAlert(deviceId, propertyId, alertType, severity, title, message, metadata = {}) {
        try {
            await pool.query(`
                INSERT INTO mdm_alerts (
                    device_id, property_id, alert_type, severity,
                    title, message, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                deviceId,
                propertyId,
                alertType,
                severity,
                title,
                message,
                JSON.stringify(metadata)
            ]);

            // Emit alert via WebSocket
            if (this.io) {
                this.io.to(`property:${propertyId}`).emit('mdm:alert', {
                    deviceId,
                    alertType,
                    severity,
                    title,
                    message
                });
            }
        } catch (error) {
            console.error('Error creating MDM alert:', error);
        }
    }

    // Monitor device health
    async monitorDeviceHealth() {
        try {
            // Check for offline devices
            const offlineDevices = await PropertyDevice.getOfflineDevices(30);
            for (const device of offlineDevices) {
                if (device.device_status === 'online') {
                    // Mark as offline
                    await pool.query(`
                        UPDATE devices SET
                            device_status = 'offline',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                    `, [device.id]);

                    // Create offline alert
                    await this.createAlert(
                        device.id,
                        device.property_id,
                        'device_offline',
                        'warning',
                        'Device Offline',
                        `${device.device_name} has been offline for more than 30 minutes`,
                        { lastSeen: device.last_heartbeat }
                    );
                }
            }

            // Check for provisional period expiring
            const expiringDevices = await PropertyDevice.getProvisionalExpiringDevices(7);
            for (const device of expiringDevices) {
                await this.createAlert(
                    device.id,
                    device.property_id,
                    'provisional_expiring',
                    device.provisional_days_left <= 3 ? 'critical' : 'warning',
                    'Provisional Period Expiring',
                    `${device.device_name} provisional period expires in ${device.provisional_days_left} days`,
                    { 
                        daysLeft: device.provisional_days_left,
                        expiryDate: device.provisional_period_end
                    }
                );
            }
        } catch (error) {
            console.error('Error monitoring device health:', error);
        }
    }

    // Clean up old data
    async cleanupOldData(daysToKeep = 30) {
        try {
            const deletedCommands = await MDMCommand.cleanupOldCommands(daysToKeep);
            
            // Clean up old alerts
            const deletedAlerts = await pool.query(`
                DELETE FROM mdm_alerts 
                WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '%s days'
                AND is_resolved = true
                RETURNING id
            `, [daysToKeep]);

            console.log(`Cleaned up ${deletedCommands} commands and ${deletedAlerts.rows.length} alerts`);
        } catch (error) {
            console.error('Error cleaning up old MDM data:', error);
        }
    }
}

// Create singleton instance
const mdmService = new MDMService();

export default mdmService;