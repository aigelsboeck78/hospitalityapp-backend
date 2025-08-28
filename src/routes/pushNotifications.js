import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pushNotificationService from '../services/pushNotificationService.js';
import PropertyDevice from '../models/PropertyDevice.js';
import pool from '../config/database.js';

const router = express.Router();

// Send notification to a specific device
router.post('/devices/:deviceId/notify', authenticateToken, async (req, res) => {
    try {
        const { type, title, message, payload } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Notification type is required'
            });
        }
        
        const notificationPayload = payload || { title, message };
        const sent = await pushNotificationService.sendNotification(
            req.params.deviceId,
            type,
            notificationPayload
        );
        
        res.json({
            success: true,
            message: sent ? 'Notification sent' : 'Notification queued',
            data: { sent }
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notification'
        });
    }
});

// Send notification to all devices in a property
router.post('/properties/:propertyId/notify', authenticateToken, async (req, res) => {
    try {
        const { type, title, message, payload } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Notification type is required'
            });
        }
        
        const notificationPayload = payload || { title, message };
        const results = await pushNotificationService.sendPropertyNotification(
            req.params.propertyId,
            type,
            notificationPayload
        );
        
        const successCount = results.filter(r => r.sent).length;
        
        res.json({
            success: true,
            message: `Notification sent to ${successCount}/${results.length} devices`,
            data: results
        });
    } catch (error) {
        console.error('Error sending property notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notification'
        });
    }
});

// Send test notification
router.post('/devices/:deviceId/test-notify', authenticateToken, async (req, res) => {
    try {
        const sent = await pushNotificationService.sendTestNotification(req.params.deviceId);
        
        res.json({
            success: true,
            message: sent ? 'Test notification sent' : 'Test notification queued',
            data: { sent }
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test notification'
        });
    }
});

// Get notification queue for a device
router.get('/devices/:deviceId/queue', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM push_notification_queue
            WHERE device_id = $1
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.params.deviceId]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching notification queue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification queue'
        });
    }
});

// Get notification history/log
router.get('/logs', authenticateToken, async (req, res) => {
    try {
        const { deviceId, propertyId, type, status, days = 7 } = req.query;
        
        let query = `
            SELECT l.*, d.device_name, d.identifier
            FROM push_notification_log l
            LEFT JOIN devices d ON l.device_id = d.id
            WHERE l.created_at > CURRENT_TIMESTAMP - INTERVAL '${parseInt(days)} days'
        `;
        const params = [];
        let paramCount = 0;
        
        if (deviceId) {
            query += ` AND l.device_id = $${++paramCount}`;
            params.push(deviceId);
        }
        
        if (propertyId) {
            query += ` AND d.property_id = $${++paramCount}`;
            params.push(propertyId);
        }
        
        if (type) {
            query += ` AND l.notification_type = $${++paramCount}`;
            params.push(type);
        }
        
        if (status) {
            query += ` AND l.status = $${++paramCount}`;
            params.push(status);
        }
        
        query += ' ORDER BY l.created_at DESC LIMIT 100';
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching notification logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification logs'
        });
    }
});

// Get notification statistics
router.get('/statistics', authenticateToken, async (req, res) => {
    try {
        const { propertyId, days = 7 } = req.query;
        const stats = await pushNotificationService.getStatistics(propertyId, parseInt(days));
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching notification statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get notification templates
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const { propertyId } = req.query;
        
        let query = 'SELECT * FROM push_notification_templates WHERE 1=1';
        const params = [];
        
        if (propertyId) {
            query += ' AND property_id = $1';
            params.push(propertyId);
        }
        
        query += ' ORDER BY notification_type, name';
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates'
        });
    }
});

// Create notification template
router.post('/templates', authenticateToken, async (req, res) => {
    try {
        const { property_id, name, notification_type, title, message, payload_template } = req.body;
        
        if (!property_id || !name || !notification_type) {
            return res.status(400).json({
                success: false,
                message: 'Property ID, name, and notification type are required'
            });
        }
        
        const result = await pool.query(`
            INSERT INTO push_notification_templates (
                property_id, name, notification_type, title, message, payload_template
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [property_id, name, notification_type, title, message, payload_template || {}]);
        
        res.json({
            success: true,
            message: 'Template created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template'
        });
    }
});

// Update notification template
router.put('/templates/:templateId', authenticateToken, async (req, res) => {
    try {
        const { name, title, message, payload_template, is_active } = req.body;
        
        const result = await pool.query(`
            UPDATE push_notification_templates SET
                name = COALESCE($2, name),
                title = COALESCE($3, title),
                message = COALESCE($4, message),
                payload_template = COALESCE($5, payload_template),
                is_active = COALESCE($6, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [req.params.templateId, name, title, message, payload_template, is_active]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Template updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template'
        });
    }
});

// Delete notification template
router.delete('/templates/:templateId', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM push_notification_templates WHERE id = $1 RETURNING *',
            [req.params.templateId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template'
        });
    }
});

// Send notification using template
router.post('/templates/:templateId/send', authenticateToken, async (req, res) => {
    try {
        const { deviceId, propertyId, variables = {} } = req.body;
        
        if (!deviceId && !propertyId) {
            return res.status(400).json({
                success: false,
                message: 'Either deviceId or propertyId is required'
            });
        }
        
        // Get template
        const templateResult = await pool.query(
            'SELECT * FROM push_notification_templates WHERE id = $1',
            [req.params.templateId]
        );
        
        if (templateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        const template = templateResult.rows[0];
        
        // Replace variables in template
        let title = template.title || '';
        let message = template.message || '';
        
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            title = title.replace(regex, variables[key]);
            message = message.replace(regex, variables[key]);
        });
        
        const payload = {
            ...template.payload_template,
            title,
            message
        };
        
        // Send notification
        if (deviceId) {
            const sent = await pushNotificationService.sendNotification(
                deviceId,
                template.notification_type,
                payload
            );
            
            res.json({
                success: true,
                message: sent ? 'Notification sent' : 'Notification queued',
                data: { sent }
            });
        } else {
            const results = await pushNotificationService.sendPropertyNotification(
                propertyId,
                template.notification_type,
                payload
            );
            
            const successCount = results.filter(r => r.sent).length;
            
            res.json({
                success: true,
                message: `Notification sent to ${successCount}/${results.length} devices`,
                data: results
            });
        }
    } catch (error) {
        console.error('Error sending templated notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notification'
        });
    }
});

export default router;