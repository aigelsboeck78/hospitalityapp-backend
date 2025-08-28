import express from 'express';
import { authenticateToken, authenticateApiKey } from '../middleware/auth.js';
import {
    getPropertyDevices,
    getDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceActive,
    setPrimaryDevice,
    getDeviceHistory,
    registerDevice,
    validateDevice,
    heartbeat
} from '../controllers/deviceController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/properties/:propertyId/devices', authenticateToken, getPropertyDevices);
router.get('/devices/:id', authenticateToken, getDevice);
router.post('/properties/:propertyId/devices', authenticateToken, createDevice);
router.put('/devices/:id', authenticateToken, updateDevice);
router.delete('/devices/:id', authenticateToken, deleteDevice);
router.patch('/devices/:id/toggle', authenticateToken, toggleDeviceActive);
router.put('/properties/:propertyId/devices/:deviceId/primary', authenticateToken, setPrimaryDevice);
router.get('/devices/:id/history', authenticateToken, getDeviceHistory);

// tvOS API routes (use API key authentication)
router.post('/tvos/devices/register', authenticateApiKey, registerDevice);
router.get('/tvos/devices/:identifier/validate/:propertyId', authenticateApiKey, validateDevice);
router.post('/tvos/devices/:identifier/heartbeat', authenticateApiKey, heartbeat);

export default router;