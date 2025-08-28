import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import PropertyDevice from '../models/PropertyDevice.js';
import MDMCommand from '../models/MDMCommand.js';
import ConfigurationProfile from '../models/ConfigurationProfile.js';
import mdmService from '../services/mdmService.js';
import { kioskPresets, getEntertainmentApps, getAppsByCategory, getCategories } from '../config/entertainmentApps.js';

const router = express.Router();

// Get available kiosk presets
router.get('/presets', authenticateToken, async (req, res) => {
    try {
        const presetList = Object.entries(kioskPresets).map(([key, preset]) => ({
            id: key,
            name: preset.name,
            description: preset.description,
            appCount: preset.allowedApps.length,
            returnTimeout: preset.returnTimeout
        }));
        
        res.json({
            success: true,
            data: {
                presets: presetList,
                categories: getCategories()
            }
        });
    } catch (error) {
        console.error('Error fetching presets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch kiosk presets'
        });
    }
});

// Get preset details
router.get('/presets/:presetId', authenticateToken, async (req, res) => {
    try {
        const preset = kioskPresets[req.params.presetId];
        
        if (!preset) {
            return res.status(404).json({
                success: false,
                message: 'Preset not found'
            });
        }
        
        res.json({
            success: true,
            data: preset
        });
    } catch (error) {
        console.error('Error fetching preset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preset'
        });
    }
});

// Get all entertainment apps
router.get('/entertainment-apps', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;
        
        const apps = category ? 
            getAppsByCategory(category) : 
            getEntertainmentApps();
        
        res.json({
            success: true,
            data: apps
        });
    } catch (error) {
        console.error('Error fetching entertainment apps:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entertainment apps'
        });
    }
});

// Apply preset to a device
router.post('/devices/:deviceId/apply-preset', authenticateToken, async (req, res) => {
    try {
        const { presetId, customizations = {} } = req.body;
        
        if (!presetId) {
            return res.status(400).json({
                success: false,
                message: 'Preset ID is required'
            });
        }
        
        const preset = kioskPresets[presetId];
        if (!preset) {
            return res.status(404).json({
                success: false,
                message: 'Preset not found'
            });
        }
        
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Merge preset with customizations
        const kioskConfig = {
            ...preset,
            ...customizations,
            enabled: true,
            mode: 'autonomous',
            homeApp: 'com.chaletmoments.hospitality'
        };
        
        // Update device with kiosk configuration
        await PropertyDevice.enableKioskMode(device.id, kioskConfig);
        
        // Queue MDM command to apply configuration
        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.ENABLE_KIOSK_MODE,
            { config: kioskConfig },
            8 // High priority
        );
        
        res.json({
            success: true,
            message: `Applied "${preset.name}" preset to device`,
            data: {
                commandId: command.id,
                config: kioskConfig
            }
        });
    } catch (error) {
        console.error('Error applying preset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply preset'
        });
    }
});

// Apply preset to all property devices
router.post('/properties/:propertyId/apply-preset', authenticateToken, async (req, res) => {
    try {
        const { presetId, customizations = {} } = req.body;
        
        if (!presetId) {
            return res.status(400).json({
                success: false,
                message: 'Preset ID is required'
            });
        }
        
        const preset = kioskPresets[presetId];
        if (!preset) {
            return res.status(404).json({
                success: false,
                message: 'Preset not found'
            });
        }
        
        // Get all active devices for the property
        const devices = await PropertyDevice.findByProperty(req.params.propertyId);
        const activeDevices = devices.filter(d => d.is_active && d.enrollment_status === 'enrolled');
        
        if (activeDevices.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No enrolled devices found for this property'
            });
        }
        
        // Merge preset with customizations
        const kioskConfig = {
            ...preset,
            ...customizations,
            enabled: true,
            mode: 'autonomous',
            homeApp: 'com.chaletmoments.hospitality'
        };
        
        // Apply to all devices
        const commands = [];
        for (const device of activeDevices) {
            // Update device configuration
            await PropertyDevice.enableKioskMode(device.id, kioskConfig);
            
            // Queue command
            const command = await mdmService.queueCommand(
                device.id,
                req.params.propertyId,
                MDMCommand.CommandTypes.ENABLE_KIOSK_MODE,
                { config: kioskConfig },
                8
            );
            commands.push(command);
        }
        
        res.json({
            success: true,
            message: `Applied "${preset.name}" preset to ${activeDevices.length} devices`,
            data: {
                devicesUpdated: activeDevices.length,
                commandIds: commands.map(c => c.id),
                config: kioskConfig
            }
        });
    } catch (error) {
        console.error('Error applying preset to property:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply preset'
        });
    }
});

// Create custom kiosk configuration with selected apps
router.post('/devices/:deviceId/configure-kiosk', authenticateToken, async (req, res) => {
    try {
        const { 
            allowedApps = [], 
            returnTimeout = 1800,
            autoReturn = true,
            name = 'Custom Configuration'
        } = req.body;
        
        const device = await PropertyDevice.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Build kiosk configuration
        const kioskConfig = {
            name,
            enabled: true,
            mode: 'autonomous',
            homeApp: 'com.chaletmoments.hospitality',
            allowedApps: [
                { bundleId: 'com.chaletmoments.hospitality', name: 'Hospitality', enabled: true },
                ...allowedApps
            ],
            autoReturn,
            returnTimeout
        };
        
        // Update device
        await PropertyDevice.enableKioskMode(device.id, kioskConfig);
        
        // Queue command
        const command = await mdmService.queueCommand(
            device.id,
            device.property_id,
            MDMCommand.CommandTypes.ENABLE_KIOSK_MODE,
            { config: kioskConfig },
            8
        );
        
        res.json({
            success: true,
            message: 'Custom kiosk configuration applied',
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

// Create and save kiosk profile with entertainment apps
router.post('/properties/:propertyId/profiles/kiosk-entertainment', authenticateToken, async (req, res) => {
    try {
        const {
            name = 'Entertainment Kiosk Mode',
            presetId = 'allEntertainment',
            customApps = [],
            returnTimeout = 1800,
            makeDefault = false
        } = req.body;
        
        // Get preset or use all entertainment apps
        const preset = presetId ? kioskPresets[presetId] : null;
        const baseApps = preset ? preset.allowedApps : getEntertainmentApps();
        
        // Merge with custom apps if provided
        const allowedApps = customApps.length > 0 ? customApps : baseApps;
        
        // Generate kiosk profile
        const profileContent = ConfigurationProfile.generateKioskProfile({
            displayName: name,
            description: `Entertainment apps with auto-return to hospitality app (${allowedApps.length} apps)`,
            homeApp: 'com.chaletmoments.hospitality',
            allowedApps,
            autoReturn: true,
            returnTimeout,
            enabled: true
        });
        
        // Create profile in database
        const profile = await ConfigurationProfile.create({
            property_id: req.params.propertyId,
            name,
            description: `Kiosk mode with ${allowedApps.length} entertainment apps`,
            profile_type: 'kiosk',
            profile_content: profileContent,
            is_active: true,
            is_default: makeDefault
        });
        
        res.json({
            success: true,
            message: 'Entertainment kiosk profile created',
            data: profile
        });
    } catch (error) {
        console.error('Error creating entertainment kiosk profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create kiosk profile'
        });
    }
});

export default router;