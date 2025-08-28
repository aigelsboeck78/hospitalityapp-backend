import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';
import { KIOSK_CONFIG } from '../config/kioskConfig.js';

const router = express.Router();

// Get MDM configuration
router.get('/config', authenticateToken, async (req, res) => {
    try {
        // Get configuration from database or return defaults
        const result = await pool.query(`
            SELECT * FROM mdm_config 
            WHERE property_id IS NULL 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        let config;
        if (result.rows.length > 0) {
            config = result.rows[0].config;
        } else {
            // Return default configuration
            config = {
                kioskConfig: {
                    homeApp: KIOSK_CONFIG.HOME_APP.bundleId,
                    mode: KIOSK_CONFIG.DEFAULT_SETTINGS.mode,
                    autoReturn: KIOSK_CONFIG.DEFAULT_SETTINGS.autoReturn,
                    returnTimeout: KIOSK_CONFIG.DEFAULT_SETTINGS.returnTimeout
                }
            };
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching MDM config:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch MDM configuration' 
        });
    }
});

// Update MDM configuration
router.put('/config', authenticateToken, async (req, res) => {
    try {
        const { kioskConfig } = req.body;

        if (!kioskConfig) {
            return res.status(400).json({
                success: false,
                error: 'Kiosk configuration is required'
            });
        }

        // Validate home app bundle ID
        if (!kioskConfig.homeApp || !kioskConfig.homeApp.includes('.')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid home app bundle ID'
            });
        }

        // First check if a config exists
        const existing = await pool.query(`
            SELECT id FROM mdm_config 
            WHERE property_id IS NULL 
            LIMIT 1
        `);

        let result;
        if (existing.rows.length > 0) {
            // Update existing config
            result = await pool.query(`
                UPDATE mdm_config 
                SET config = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [{ kioskConfig }, existing.rows[0].id]);
        } else {
            // Insert new config
            result = await pool.query(`
                INSERT INTO mdm_config (property_id, config)
                VALUES (NULL, $1)
                RETURNING *
            `, [{ kioskConfig }]);
        }

        res.json({
            success: true,
            config: result.rows[0].config
        });
    } catch (error) {
        console.error('Error updating MDM config:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update MDM configuration' 
        });
    }
});

// Get property-specific MDM configuration
router.get('/config/:propertyId', authenticateToken, async (req, res) => {
    try {
        const { propertyId } = req.params;

        // First try to get property-specific config
        let result = await pool.query(`
            SELECT * FROM mdm_config 
            WHERE property_id = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [propertyId]);

        if (result.rows.length === 0) {
            // Fall back to global config
            result = await pool.query(`
                SELECT * FROM mdm_config 
                WHERE property_id IS NULL 
                ORDER BY created_at DESC 
                LIMIT 1
            `);
        }

        let config;
        if (result.rows.length > 0) {
            config = result.rows[0].config;
        } else {
            // Return default configuration
            config = {
                kioskConfig: {
                    homeApp: KIOSK_CONFIG.HOME_APP.bundleId,
                    mode: KIOSK_CONFIG.DEFAULT_SETTINGS.mode,
                    autoReturn: KIOSK_CONFIG.DEFAULT_SETTINGS.autoReturn,
                    returnTimeout: KIOSK_CONFIG.DEFAULT_SETTINGS.returnTimeout
                }
            };
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching property MDM config:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch property MDM configuration' 
        });
    }
});

// Update property-specific MDM configuration
router.put('/config/:propertyId', authenticateToken, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { kioskConfig } = req.body;

        if (!kioskConfig) {
            return res.status(400).json({
                success: false,
                error: 'Kiosk configuration is required'
            });
        }

        // Check if property exists
        const propertyCheck = await pool.query(
            'SELECT id FROM properties WHERE id = $1',
            [propertyId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Check if a config exists for this property
        const existing = await pool.query(`
            SELECT id FROM mdm_config 
            WHERE property_id = $1 
            LIMIT 1
        `, [propertyId]);

        let result;
        if (existing.rows.length > 0) {
            // Update existing config
            result = await pool.query(`
                UPDATE mdm_config 
                SET config = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [{ kioskConfig }, existing.rows[0].id]);
        } else {
            // Insert new config
            result = await pool.query(`
                INSERT INTO mdm_config (property_id, config)
                VALUES ($1, $2)
                RETURNING *
            `, [propertyId, { kioskConfig }]);
        }

        res.json({
            success: true,
            config: result.rows[0].config
        });
    } catch (error) {
        console.error('Error updating property MDM config:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update property MDM configuration' 
        });
    }
});

export default router;