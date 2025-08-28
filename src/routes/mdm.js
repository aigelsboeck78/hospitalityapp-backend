import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import PropertyDevice from '../models/PropertyDevice.js';
import MDMCommand from '../models/MDMCommand.js';
import mdmService from '../services/mdmService.js';
import pool from '../config/database.js';
import { KIOSK_CONFIG, getHomeApp } from '../config/kioskConfig.js';

const router = express.Router();

// Get device MDM status
router.get('/devices/:deviceId/status', authenticateToken, async (req, res) => {
    try {
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        res.json({
            success: true,
            data: {
                id: device.id,
                identifier: device.identifier,
                enrollment_status: device.enrollment_status,
                supervised: device.supervised,
                provisional_days_left: device.provisional_days_left,
                kiosk_mode_enabled: device.kiosk_mode_enabled,
                device_status: device.device_status,
                last_heartbeat: device.last_heartbeat,
                last_command_sent: device.last_command_sent,
                last_command_status: device.last_command_status
            }
        });
    } catch (error) {
        console.error('Error fetching device MDM status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch device status' 
        });
    }
});

// Enroll device in MDM
router.post('/devices/:deviceId/enroll', authenticateToken, async (req, res) => {
    try {
        const { supervised = false } = req.body;
        const device = await PropertyDevice.enrollDevice(req.params.deviceId, supervised);
        
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        // Queue initial configuration commands
        await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.DEVICE_INFORMATION,
            {},
            5
        );

        res.json({
            success: true,
            message: 'Device enrolled successfully',
            data: device
        });
    } catch (error) {
        console.error('Error enrolling device:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to enroll device' 
        });
    }
});

// Enable kiosk mode
router.post('/devices/:deviceId/kiosk/enable', authenticateToken, async (req, res) => {
    try {
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const config = req.body.config || {
            enabled: true,
            mode: 'autonomous',
            autoReturn: true,
            returnTimeout: 1800,
            allowedApps: req.body.allowedApps || []
        };

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.ENABLE_KIOSK_MODE,
            { config },
            8 // High priority
        );

        res.json({
            success: true,
            message: 'Kiosk mode enable command queued',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error enabling kiosk mode:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to enable kiosk mode' 
        });
    }
});

// Disable kiosk mode
router.post('/devices/:deviceId/kiosk/disable', authenticateToken, async (req, res) => {
    try {
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.DISABLE_KIOSK_MODE,
            {},
            8 // High priority
        );

        res.json({
            success: true,
            message: 'Kiosk mode disable command queued',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error disabling kiosk mode:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to disable kiosk mode' 
        });
    }
});

// Configure kiosk mode with entertainment apps
router.post('/kiosk/devices/:deviceId/configure-kiosk', authenticateToken, async (req, res) => {
    try {
        const { allowedApps, returnTimeout, autoReturn, name } = req.body;
        
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        // Ensure hospitality app is always included and set as home
        const homeApp = getHomeApp('tvos');
        const appsToAllow = allowedApps || [];
        
        // Add hospitality app if not present
        if (!appsToAllow.some(app => app.bundleId === homeApp)) {
            appsToAllow.unshift({
                bundleId: homeApp,
                name: 'Chalet Moments Hospitality',
                category: 'hospitality',
                enabled: true
            });
        }

        const kioskConfig = {
            allowedApps: appsToAllow,
            homeApp: homeApp,
            autoReturn: autoReturn !== false,
            returnTimeout: returnTimeout || 1800,
            name: name || 'Entertainment Configuration'
        };

        // Enable kiosk mode with configuration
        await PropertyDevice.enableKioskMode(device.id, kioskConfig);

        // Queue command to apply configuration
        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.ENABLE_KIOSK_MODE,
            kioskConfig,
            8 // High priority
        );

        res.json({
            success: true,
            message: 'Kiosk configuration applied successfully',
            data: { 
                commandId: command.id,
                config: kioskConfig
            }
        });
    } catch (error) {
        console.error('Error configuring kiosk:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to configure kiosk mode' 
        });
    }
});

// Update allowed apps
router.put('/devices/:deviceId/allowed-apps', authenticateToken, async (req, res) => {
    try {
        const { apps } = req.body;
        if (!apps || !Array.isArray(apps)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Apps array is required' 
            });
        }

        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.UPDATE_ALLOWED_APPS,
            { apps },
            5
        );

        res.json({
            success: true,
            message: 'Allowed apps update command queued',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error updating allowed apps:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update allowed apps' 
        });
    }
});

// Update restrictions
router.put('/devices/:deviceId/restrictions', authenticateToken, async (req, res) => {
    try {
        const { restrictions } = req.body;
        if (!restrictions) {
            return res.status(400).json({ 
                success: false, 
                message: 'Restrictions object is required' 
            });
        }

        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.UPDATE_RESTRICTIONS,
            { restrictions },
            5
        );

        res.json({
            success: true,
            message: 'Restrictions update command queued',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error updating restrictions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update restrictions' 
        });
    }
});

// Send command to device
router.post('/devices/:deviceId/commands', authenticateToken, async (req, res) => {
    try {
        const { commandType, payload = {}, priority = 0 } = req.body;
        
        if (!commandType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Command type is required' 
            });
        }

        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            commandType,
            payload,
            priority
        );

        res.json({
            success: true,
            message: 'Command queued successfully',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error sending command:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send command' 
        });
    }
});

// Restart device
router.post('/devices/:deviceId/restart', authenticateToken, async (req, res) => {
    try {
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.RESTART_DEVICE,
            {},
            10 // Highest priority
        );

        res.json({
            success: true,
            message: 'Restart command queued',
            data: { commandId: command.id }
        });
    } catch (error) {
        console.error('Error restarting device:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to restart device' 
        });
    }
});

// Get command history for device
router.get('/devices/:deviceId/commands', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const commands = await MDMCommand.getCommandHistory(req.params.deviceId, limit);

        res.json({
            success: true,
            data: commands
        });
    } catch (error) {
        console.error('Error fetching command history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch command history' 
        });
    }
});

// Get command status
router.get('/commands/:commandId', authenticateToken, async (req, res) => {
    try {
        const command = await MDMCommand.findById(req.params.commandId);
        if (!command) {
            return res.status(404).json({ 
                success: false, 
                message: 'Command not found' 
            });
        }

        res.json({
            success: true,
            data: command
        });
    } catch (error) {
        console.error('Error fetching command:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch command' 
        });
    }
});

// Create kiosk entertainment profile for property
router.post('/properties/:propertyId/profiles/kiosk-entertainment', authenticateToken, async (req, res) => {
    try {
        const { name, presetId, customApps, returnTimeout, makeDefault } = req.body;
        
        // Get apps based on preset or custom selection
        let allowedApps = [];
        if (presetId) {
            const { kioskPresets } = await import('../config/entertainmentApps.js');
            const preset = kioskPresets[presetId];
            if (!preset) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid preset ID'
                });
            }
            allowedApps = preset.allowedApps;
        } else if (customApps) {
            allowedApps = customApps;
        }

        // Ensure hospitality app is always included
        const homeApp = getHomeApp('tvos');
        if (!allowedApps.some(app => app.bundleId === homeApp)) {
            allowedApps.unshift({
                bundleId: homeApp,
                name: 'Chalet Moments Hospitality',
                category: 'hospitality',
                enabled: true
            });
        }

        const profileConfig = {
            allowedApps,
            homeApp,
            autoReturn: true,
            returnTimeout: returnTimeout || 1800,
            name: name || 'Entertainment Apps Profile'
        };

        // Create configuration profile
        const profile = await ConfigurationProfile.create({
            property_id: req.params.propertyId,
            name: profileConfig.name,
            profile_type: 'kiosk',
            content: profileConfig,
            is_default: makeDefault || false,
            is_active: true
        });

        res.json({
            success: true,
            message: 'Kiosk entertainment profile created',
            data: profile
        });
    } catch (error) {
        console.error('Error creating kiosk entertainment profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create profile'
        });
    }
});

// Apply configuration to all devices in property
router.post('/properties/:propertyId/apply-configuration', authenticateToken, async (req, res) => {
    try {
        const { 
            kioskMode, 
            allowedApps, 
            restrictions,
            priority = 5
        } = req.body;

        const commands = [];

        if (kioskMode !== undefined) {
            const kioskCommands = await mdmService.queuePropertyCommand(
                req.params.propertyId,
                kioskMode.enabled ? 
                    MDMCommand.CommandTypes.ENABLE_KIOSK_MODE : 
                    MDMCommand.CommandTypes.DISABLE_KIOSK_MODE,
                { config: kioskMode },
                priority
            );
            commands.push(...kioskCommands);
        }

        if (allowedApps) {
            const appCommands = await mdmService.queuePropertyCommand(
                req.params.propertyId,
                MDMCommand.CommandTypes.UPDATE_ALLOWED_APPS,
                { apps: allowedApps },
                priority
            );
            commands.push(...appCommands);
        }

        if (restrictions) {
            const restrictionCommands = await mdmService.queuePropertyCommand(
                req.params.propertyId,
                MDMCommand.CommandTypes.UPDATE_RESTRICTIONS,
                { restrictions },
                priority
            );
            commands.push(...restrictionCommands);
        }

        res.json({
            success: true,
            message: `Queued ${commands.length} configuration commands`,
            data: { commandIds: commands.map(c => c.id) }
        });
    } catch (error) {
        console.error('Error applying property configuration:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to apply configuration' 
        });
    }
});

// Get MDM alerts
router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const { propertyId, resolved, severity } = req.query;
        
        let query = 'SELECT * FROM mdm_alerts WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (propertyId) {
            query += ` AND property_id = $${++paramCount}`;
            params.push(propertyId);
        }

        if (resolved !== undefined) {
            query += ` AND is_resolved = $${++paramCount}`;
            params.push(resolved === 'true');
        }

        if (severity) {
            query += ` AND severity = $${++paramCount}`;
            params.push(severity);
        }

        query += ' ORDER BY created_at DESC LIMIT 100';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch alerts' 
        });
    }
});

// Resolve alert
router.put('/alerts/:alertId/resolve', authenticateToken, async (req, res) => {
    try {
        const { resolvedBy = 'system' } = req.body;
        
        const result = await pool.query(`
            UPDATE mdm_alerts SET
                is_resolved = true,
                resolved_at = CURRENT_TIMESTAMP,
                resolved_by = $2
            WHERE id = $1
            RETURNING *
        `, [req.params.alertId, resolvedBy]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Alert not found' 
            });
        }

        res.json({
            success: true,
            message: 'Alert resolved',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to resolve alert' 
        });
    }
});

// Device heartbeat endpoint (called by tvOS app)
router.post('/devices/:identifier/heartbeat', async (req, res) => {
    try {
        const { 
            batteryLevel,
            storageAvailable,
            storageTotal,
            appVersion,
            osVersion
        } = req.body;

        const device = await PropertyDevice.updateHeartbeat(
            req.params.identifier,
            {
                battery_level: batteryLevel,
                storage_available: storageAvailable,
                storage_total: storageTotal
            }
        );

        if (!device) {
            return res.status(404).json({ 
                success: false, 
                message: 'Device not found' 
            });
        }

        // Check for pending commands
        const pendingCommand = await MDMCommand.getNextPendingCommand(device.id);
        
        res.json({
            success: true,
            data: {
                deviceId: device.id,
                pendingCommand: pendingCommand ? {
                    id: pendingCommand.id,
                    type: pendingCommand.command_type,
                    payload: pendingCommand.command_payload
                } : null
            }
        });
    } catch (error) {
        console.error('Error processing heartbeat:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process heartbeat' 
        });
    }
});

// Command response from device
router.post('/commands/:commandId/response', async (req, res) => {
    try {
        const { deviceIdentifier, status, data } = req.body;
        
        await mdmService.handleCommandResponse(
            deviceIdentifier,
            req.params.commandId,
            status,
            data
        );

        res.json({
            success: true,
            message: 'Command response processed'
        });
    } catch (error) {
        console.error('Error processing command response:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process command response' 
        });
    }
});

export default router;