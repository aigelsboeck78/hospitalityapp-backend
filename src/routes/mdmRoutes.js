import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getMonitoringData,
    getDeviceMetrics,
    getAlerts,
    resolveAlert,
    createAlert,
    getCommandStatistics,
    recordDeviceMetrics
} from '../controllers/mdmMonitoringController.js';
import {
    enrollDevice,
    sendCommand,
    getDeviceProfiles,
    createProfile,
    applyProfile,
    removeProfile,
    enableKioskMode,
    disableKioskMode,
    updateKioskConfiguration
} from '../controllers/mdmController.js';

const router = express.Router();

// Monitoring endpoints
router.get('/properties/:propertyId/monitoring', authenticateToken, getMonitoringData);
router.get('/properties/:propertyId/command-statistics', authenticateToken, getCommandStatistics);
router.get('/devices/:deviceId/metrics', authenticateToken, getDeviceMetrics);
router.post('/devices/:deviceId/metrics', recordDeviceMetrics);

// Alert endpoints
router.get('/alerts', authenticateToken, getAlerts);
router.post('/alerts', authenticateToken, createAlert);
router.put('/alerts/:alertId/resolve', authenticateToken, resolveAlert);

// Device management endpoints
router.post('/devices/:deviceId/enroll', authenticateToken, enrollDevice);
router.post('/devices/:deviceId/commands', authenticateToken, sendCommand);
router.get('/devices/:deviceId/profiles', authenticateToken, getDeviceProfiles);

// Profile management endpoints
router.get('/properties/:propertyId/profiles', authenticateToken, getDeviceProfiles);
router.post('/properties/:propertyId/profiles', authenticateToken, createProfile);
router.post('/properties/:propertyId/profiles/wifi', authenticateToken, createProfile);
router.post('/profiles/:profileId/apply', authenticateToken, applyProfile);
router.delete('/profiles/:profileId', authenticateToken, removeProfile);

// Kiosk mode endpoints
router.post('/devices/:deviceId/kiosk/enable', authenticateToken, enableKioskMode);
router.post('/devices/:deviceId/kiosk/disable', authenticateToken, disableKioskMode);
router.put('/devices/:deviceId/kiosk/configuration', authenticateToken, updateKioskConfiguration);

// Device status endpoints (for tvOS app)
router.get('/devices/:deviceId/status', async (req, res) => {
    try {
        const { deviceId } = req.params;
        // Return MDM status for device
        res.json({
            success: true,
            enrolled: true,
            kiosk_mode_enabled: false,
            supervised: false
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Command acknowledgment (for tvOS app)
router.post('/commands/:commandId/acknowledge', async (req, res) => {
    try {
        const { commandId } = req.params;
        // Mark command as acknowledged
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Command status update (for tvOS app)
router.put('/commands/:commandId/status', async (req, res) => {
    try {
        const { commandId } = req.params;
        const { status, error } = req.body;
        // Update command status
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Device info update (for tvOS app)
router.post('/devices/:deviceId/info', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const deviceInfo = req.body;
        // Store device information
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Heartbeat (for tvOS app)
router.post('/devices/:deviceId/heartbeat', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { battery_level, battery_state, storage_available, storage_total } = req.body;
        // Update device heartbeat
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;