import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ConfigurationProfile from '../models/ConfigurationProfile.js';
import MDMCommand from '../models/MDMCommand.js';
import mdmService from '../services/mdmService.js';
import pool from '../config/database.js';

const router = express.Router();

// Get all profiles for a property
router.get('/properties/:propertyId/profiles', authenticateToken, async (req, res) => {
    try {
        const { activeOnly } = req.query;
        const profiles = await ConfigurationProfile.findByProperty(
            req.params.propertyId,
            activeOnly === 'true'
        );
        
        res.json({
            success: true,
            data: profiles
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch configuration profiles'
        });
    }
});

// Get profile by ID
router.get('/profiles/:profileId', authenticateToken, async (req, res) => {
    try {
        const profile = await ConfigurationProfile.findById(req.params.profileId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Create new profile
router.post('/properties/:propertyId/profiles', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            profile_type, 
            profile_content,
            is_active = true,
            is_default = false
        } = req.body;
        
        if (!name || !profile_type || !profile_content) {
            return res.status(400).json({
                success: false,
                message: 'Name, profile type, and content are required'
            });
        }
        
        const profile = await ConfigurationProfile.create({
            property_id: req.params.propertyId,
            name,
            description,
            profile_type,
            profile_content,
            is_active,
            is_default
        });
        
        res.json({
            success: true,
            message: 'Profile created successfully',
            data: profile
        });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create profile'
        });
    }
});

// Generate profile content based on type
router.post('/profiles/generate', authenticateToken, async (req, res) => {
    try {
        const { type, config } = req.body;
        
        if (!type || !config) {
            return res.status(400).json({
                success: false,
                message: 'Profile type and configuration are required'
            });
        }
        
        const content = await ConfigurationProfile.generateProfileContent(type, config);
        
        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error generating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate profile content'
        });
    }
});

// Update profile
router.put('/profiles/:profileId', authenticateToken, async (req, res) => {
    try {
        const profile = await ConfigurationProfile.update(
            req.params.profileId,
            req.body
        );
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Delete profile
router.delete('/profiles/:profileId', authenticateToken, async (req, res) => {
    try {
        const profile = await ConfigurationProfile.delete(req.params.profileId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile'
        });
    }
});

// Set profile as default
router.put('/profiles/:profileId/set-default', authenticateToken, async (req, res) => {
    try {
        const profile = await ConfigurationProfile.findById(req.params.profileId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        const updatedProfile = await ConfigurationProfile.setDefault(
            profile.property_id,
            req.params.profileId
        );
        
        res.json({
            success: true,
            message: 'Profile set as default',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Error setting default profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set default profile'
        });
    }
});

// Assign profile to device
router.post('/profiles/:profileId/assign/:deviceId', authenticateToken, async (req, res) => {
    try {
        const assignment = await ConfigurationProfile.assignToDevice(
            req.params.profileId,
            req.params.deviceId
        );
        
        // Queue MDM command to install profile
        await mdmService.queueCommand(
            req.params.deviceId,
            null, // property_id will be fetched from device
            MDMCommand.CommandTypes.INSTALL_PROFILE,
            { profileId: req.params.profileId },
            5
        );
        
        res.json({
            success: true,
            message: 'Profile assigned to device',
            data: assignment
        });
    } catch (error) {
        console.error('Error assigning profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign profile'
        });
    }
});

// Remove profile from device
router.delete('/profiles/:profileId/device/:deviceId', authenticateToken, async (req, res) => {
    try {
        const removed = await ConfigurationProfile.removeFromDevice(
            req.params.profileId,
            req.params.deviceId
        );
        
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }
        
        // Queue MDM command to remove profile
        await mdmService.queueCommand(
            req.params.deviceId,
            null,
            MDMCommand.CommandTypes.REMOVE_PROFILE,
            { profileId: req.params.profileId },
            5
        );
        
        res.json({
            success: true,
            message: 'Profile removed from device'
        });
    } catch (error) {
        console.error('Error removing profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove profile'
        });
    }
});

// Get profiles assigned to a device
router.get('/devices/:deviceId/profiles', authenticateToken, async (req, res) => {
    try {
        const profiles = await ConfigurationProfile.getDeviceProfiles(req.params.deviceId);
        
        res.json({
            success: true,
            data: profiles
        });
    } catch (error) {
        console.error('Error fetching device profiles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch device profiles'
        });
    }
});

// Create and apply WiFi profile
router.post('/properties/:propertyId/profiles/wifi', authenticateToken, async (req, res) => {
    try {
        const { 
            name,
            ssid,
            password,
            encryptionType = 'WPA2',
            applyToAllDevices = false
        } = req.body;
        
        if (!name || !ssid || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, SSID, and password are required'
            });
        }
        
        // Generate WiFi profile content
        const profileContent = ConfigurationProfile.generateWiFiProfile({
            ssid,
            password,
            encryptionType,
            displayName: name
        });
        
        // Create profile
        const profile = await ConfigurationProfile.create({
            property_id: req.params.propertyId,
            name,
            description: `WiFi configuration for ${ssid}`,
            profile_type: 'wifi',
            profile_content: profileContent,
            is_active: true,
            is_default: false
        });
        
        // Apply to all devices if requested
        if (applyToAllDevices) {
            const devices = await pool.query(
                'SELECT id FROM devices WHERE property_id = $1 AND is_active = true',
                [req.params.propertyId]
            );
            
            for (const device of devices.rows) {
                await ConfigurationProfile.assignToDevice(profile.id, device.id);
                await mdmService.queueCommand(
                    device.id,
                    req.params.propertyId,
                    MDMCommand.CommandTypes.INSTALL_PROFILE,
                    { profileId: profile.id },
                    3
                );
            }
        }
        
        res.json({
            success: true,
            message: 'WiFi profile created' + (applyToAllDevices ? ' and applied to all devices' : ''),
            data: profile
        });
    } catch (error) {
        console.error('Error creating WiFi profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WiFi profile'
        });
    }
});

// Create and apply restrictions profile
router.post('/properties/:propertyId/profiles/restrictions', authenticateToken, async (req, res) => {
    try {
        const { 
            name,
            restrictions,
            applyToAllDevices = false
        } = req.body;
        
        if (!name || !restrictions) {
            return res.status(400).json({
                success: false,
                message: 'Name and restrictions are required'
            });
        }
        
        // Generate restrictions profile content
        const profileContent = ConfigurationProfile.generateRestrictionsProfile({
            ...restrictions,
            displayName: name
        });
        
        // Create profile
        const profile = await ConfigurationProfile.create({
            property_id: req.params.propertyId,
            name,
            description: 'Device restrictions and security settings',
            profile_type: 'restrictions',
            profile_content: profileContent,
            is_active: true,
            is_default: false
        });
        
        // Apply to all devices if requested
        if (applyToAllDevices) {
            const devices = await pool.query(
                'SELECT id FROM devices WHERE property_id = $1 AND is_active = true',
                [req.params.propertyId]
            );
            
            for (const device of devices.rows) {
                await ConfigurationProfile.assignToDevice(profile.id, device.id);
                await mdmService.queueCommand(
                    device.id,
                    req.params.propertyId,
                    MDMCommand.CommandTypes.INSTALL_PROFILE,
                    { profileId: profile.id },
                    3
                );
            }
        }
        
        res.json({
            success: true,
            message: 'Restrictions profile created' + (applyToAllDevices ? ' and applied to all devices' : ''),
            data: profile
        });
    } catch (error) {
        console.error('Error creating restrictions profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create restrictions profile'
        });
    }
});

export default router;