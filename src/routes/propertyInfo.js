import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getPropertyInfo,
    getPropertyInfoById,
    createPropertyInfo,
    updatePropertyInfo,
    upsertPropertyInfo,
    deletePropertyInfo,
    togglePropertyInfo,
    updatePropertyInfoOrder,
    getInfoCategories,
    getInfoTypes
} from '../controllers/propertyInfoController.js';

const router = express.Router();

// Public routes (for tvOS)
router.get('/properties/:propertyId/information', getPropertyInfo);
router.get('/property-info/:id', getPropertyInfoById);

// Get categories and types
router.get('/property-info-categories', getInfoCategories);
router.get('/property-info-types', getInfoTypes);

// Protected routes (require authentication)
router.post('/properties/:propertyId/information', authenticateToken, createPropertyInfo);
router.put('/property-info/:id', authenticateToken, updatePropertyInfo);
router.post('/properties/:propertyId/information/upsert', authenticateToken, upsertPropertyInfo);
router.delete('/property-info/:id', authenticateToken, deletePropertyInfo);
router.patch('/property-info/:id/toggle', authenticateToken, togglePropertyInfo);
router.put('/property-info/order', authenticateToken, updatePropertyInfoOrder);

export default router;