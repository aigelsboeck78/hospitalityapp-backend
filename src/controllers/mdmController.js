import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const enrollDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { supervised = false } = req.body;
        
        const query = `
            UPDATE devices
            SET enrollment_status = 'enrolled',
                supervised = $2,
                enrolled_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [deviceId, supervised]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Device enrolled successfully'
        });
    } catch (error) {
        console.error('Error enrolling device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to enroll device'
        });
    }
};

export const sendCommand = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { commandType, payload = {}, priority = 5 } = req.body;
        
        // Insert command into queue
        const query = `
            INSERT INTO mdm_commands (
                id, device_id, command_type, payload, priority, status
            ) VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING *
        `;
        
        const commandId = uuidv4();
        const result = await pool.query(query, [
            commandId,
            deviceId,
            commandType,
            JSON.stringify(payload),
            priority
        ]);
        
        // TODO: Trigger push notification or WebSocket message to device
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Command queued successfully'
        });
    } catch (error) {
        console.error('Error sending command:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send command'
        });
    }
};

export const getDeviceProfiles = async (req, res) => {
    try {
        const { deviceId, propertyId } = req.params;
        
        let query;
        let params;
        
        if (deviceId) {
            // Get profiles for specific device
            query = `
                SELECT p.*
                FROM configuration_profiles p
                JOIN device_profile_assignments dpa ON p.id = dpa.profile_id
                WHERE dpa.device_id = $1
                ORDER BY p.created_at DESC
            `;
            params = [deviceId];
        } else if (propertyId) {
            // Get all profiles for property
            query = `
                SELECT *
                FROM configuration_profiles
                WHERE property_id = $1
                ORDER BY created_at DESC
            `;
            params = [propertyId];
        }
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profiles'
        });
    }
};

export const createProfile = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { name, type, content, applyToAllDevices = false } = req.body;
        
        // Special handling for WiFi profiles
        if (req.path.includes('/wifi')) {
            const { ssid, password, encryptionType } = req.body;
            const wifiContent = {
                ssid,
                password,
                encryptionType,
                autoJoin: true
            };
            
            const query = `
                INSERT INTO configuration_profiles (
                    id, property_id, profile_type, name, content, is_active
                ) VALUES ($1, $2, 'wifi', $3, $4, true)
                RETURNING *
            `;
            
            const profileId = uuidv4();
            const result = await pool.query(query, [
                profileId,
                propertyId,
                name || `WiFi - ${ssid}`,
                JSON.stringify(wifiContent)
            ]);
            
            // Apply to all devices if requested
            if (applyToAllDevices) {
                const devicesQuery = `
                    INSERT INTO device_profile_assignments (device_id, profile_id)
                    SELECT id, $1
                    FROM devices
                    WHERE property_id = $2
                `;
                await pool.query(devicesQuery, [profileId, propertyId]);
                
                // Send install profile command to all devices
                const commandQuery = `
                    INSERT INTO mdm_commands (id, device_id, command_type, payload, priority)
                    SELECT gen_random_uuid(), id, 'InstallProfile', $1, 5
                    FROM devices
                    WHERE property_id = $2 AND enrollment_status = 'enrolled'
                `;
                await pool.query(commandQuery, [
                    JSON.stringify({ profile_id: profileId, profile_type: 'wifi', profile_content: wifiContent }),
                    propertyId
                ]);
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'WiFi profile created successfully'
            });
        } else {
            // Generic profile creation
            const query = `
                INSERT INTO configuration_profiles (
                    id, property_id, profile_type, name, content, is_active
                ) VALUES ($1, $2, $3, $4, $5, true)
                RETURNING *
            `;
            
            const profileId = uuidv4();
            const result = await pool.query(query, [
                profileId,
                propertyId,
                type || 'custom',
                name,
                JSON.stringify(content)
            ]);
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create profile'
        });
    }
};

export const applyProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { deviceIds } = req.body;
        
        // Assign profile to devices
        const assignQuery = `
            INSERT INTO device_profile_assignments (device_id, profile_id)
            SELECT unnest($1::uuid[]), $2
            ON CONFLICT (device_id, profile_id) DO NOTHING
        `;
        
        await pool.query(assignQuery, [deviceIds, profileId]);
        
        // Send install command to devices
        const commandQuery = `
            INSERT INTO mdm_commands (id, device_id, command_type, payload, priority)
            SELECT gen_random_uuid(), unnest($1::uuid[]), 'InstallProfile', $2, 5
        `;
        
        const profileQuery = await pool.query(
            'SELECT * FROM configuration_profiles WHERE id = $1',
            [profileId]
        );
        
        if (profileQuery.rows.length > 0) {
            const profile = profileQuery.rows[0];
            await pool.query(commandQuery, [
                deviceIds,
                JSON.stringify({
                    profile_id: profileId,
                    profile_type: profile.profile_type,
                    profile_content: profile.content
                })
            ]);
        }
        
        res.json({
            success: true,
            message: 'Profile applied to devices'
        });
    } catch (error) {
        console.error('Error applying profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply profile'
        });
    }
};

export const removeProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        
        // Remove profile assignments
        await pool.query(
            'DELETE FROM device_profile_assignments WHERE profile_id = $1',
            [profileId]
        );
        
        // Deactivate profile (soft delete)
        const result = await pool.query(
            'UPDATE configuration_profiles SET is_active = false WHERE id = $1 RETURNING *',
            [profileId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile removed successfully'
        });
    } catch (error) {
        console.error('Error removing profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove profile'
        });
    }
};

export const enableKioskMode = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { 
            homeApp = 'com.chaletmoments.hospitality',
            allowedApps = [],
            autoReturn = true,
            returnTimeout = 1800
        } = req.body;
        
        // Update device kiosk status
        await pool.query(
            'UPDATE devices SET kiosk_mode_enabled = true WHERE id = $1',
            [deviceId]
        );
        
        // Send enable kiosk command
        const commandQuery = `
            INSERT INTO mdm_commands (id, device_id, command_type, payload, priority)
            VALUES ($1, $2, 'EnableKioskMode', $3, 10)
            RETURNING *
        `;
        
        const result = await pool.query(commandQuery, [
            uuidv4(),
            deviceId,
            JSON.stringify({
                homeApp,
                allowedApps,
                autoReturn,
                returnTimeout
            })
        ]);
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Kiosk mode enabled'
        });
    } catch (error) {
        console.error('Error enabling kiosk mode:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to enable kiosk mode'
        });
    }
};

export const disableKioskMode = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        // Update device kiosk status
        await pool.query(
            'UPDATE devices SET kiosk_mode_enabled = false WHERE id = $1',
            [deviceId]
        );
        
        // Send disable kiosk command
        const commandQuery = `
            INSERT INTO mdm_commands (id, device_id, command_type, payload, priority)
            VALUES ($1, $2, 'DisableKioskMode', $3, 10)
            RETURNING *
        `;
        
        const result = await pool.query(commandQuery, [
            uuidv4(),
            deviceId,
            JSON.stringify({})
        ]);
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Kiosk mode disabled'
        });
    } catch (error) {
        console.error('Error disabling kiosk mode:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to disable kiosk mode'
        });
    }
};

export const updateKioskConfiguration = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const configuration = req.body;
        
        // Store kiosk configuration
        const query = `
            UPDATE devices
            SET kiosk_configuration = $2
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            deviceId,
            JSON.stringify(configuration)
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }
        
        // Send configuration update command if kiosk is enabled
        if (result.rows[0].kiosk_mode_enabled) {
            const commandQuery = `
                INSERT INTO mdm_commands (id, device_id, command_type, payload, priority)
                VALUES ($1, $2, 'UpdateKioskConfiguration', $3, 5)
            `;
            
            await pool.query(commandQuery, [
                uuidv4(),
                deviceId,
                JSON.stringify(configuration)
            ]);
        }
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Kiosk configuration updated'
        });
    } catch (error) {
        console.error('Error updating kiosk configuration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update kiosk configuration'
        });
    }
};