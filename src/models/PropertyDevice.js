import pool from '../config/database.js';

class PropertyDevice {
    constructor(data) {
        this.id = data.id;
        this.property_id = data.property_id;
        this.device_type = data.device_type;
        this.device_name = data.device_name;
        this.identifier = data.identifier;
        this.mac_address = data.mac_address;
        this.ip_address = data.ip_address;
        this.serial_number = data.serial_number;
        this.model = data.model;
        this.os_version = data.os_version;
        this.app_version = data.app_version;
        this.software_version = data.software_version;
        this.last_seen = data.last_seen;
        this.last_connected = data.last_connected;
        this.last_ip_address = data.last_ip_address;
        this.connection_type = data.connection_type;
        this.is_online = data.is_online;
        this.settings = data.settings;
        this.is_active = data.is_active;
        this.is_primary = data.is_primary;
        this.metadata = data.metadata;
        this.push_token = data.push_token;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // MDM fields
        this.supervised = data.supervised;
        this.enrollment_status = data.enrollment_status;
        this.enrollment_date = data.enrollment_date;
        this.provisional_period_end = data.provisional_period_end;
        this.mdm_profile_uuid = data.mdm_profile_uuid;
        this.configuration_profiles = data.configuration_profiles;
        this.kiosk_mode_enabled = data.kiosk_mode_enabled;
        this.kiosk_mode_config = data.kiosk_mode_config;
        this.allowed_apps = data.allowed_apps;
        this.restrictions = data.restrictions;
        this.last_command_sent = data.last_command_sent;
        this.last_command_status = data.last_command_status;
        this.pending_commands = data.pending_commands;
        this.command_history = data.command_history;
        this.room_number = data.room_number;
        this.device_status = data.device_status;
        this.last_heartbeat = data.last_heartbeat;
        this.battery_level = data.battery_level;
        this.storage_available = data.storage_available;
        this.storage_total = data.storage_total;
        
        // Calculate provisional days left
        if (this.provisional_period_end) {
            const now = new Date();
            const end = new Date(this.provisional_period_end);
            const diff = end - now;
            this.provisional_days_left = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        } else {
            this.provisional_days_left = 0;
        }
    }

    static async findByProperty(propertyId) {
        const result = await pool.query(
            `SELECT * FROM devices 
             WHERE property_id = $1 
             ORDER BY is_primary DESC, device_name ASC`,
            [propertyId]
        );
        return result.rows.map(row => new PropertyDevice(row));
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM devices WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async findByMacAddress(macAddress) {
        const result = await pool.query(
            'SELECT * FROM devices WHERE mac_address = $1',
            [macAddress]
        );
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async findByIdentifier(identifier) {
        const result = await pool.query(
            'SELECT * FROM devices WHERE identifier = $1',
            [identifier]
        );
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async create(deviceData) {
        const result = await pool.query(`
            INSERT INTO devices (
                property_id, device_type, device_name, identifier,
                mac_address, ip_address, serial_number, model,
                os_version, app_version, software_version,
                is_active, is_primary, settings, metadata, push_token
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `, [
            deviceData.property_id,
            deviceData.device_type || 'apple_tv',
            deviceData.device_name,
            deviceData.identifier || null,
            deviceData.mac_address || null,
            deviceData.ip_address || null,
            deviceData.serial_number || null,
            deviceData.model || null,
            deviceData.os_version || null,
            deviceData.app_version || null,
            deviceData.software_version || null,
            deviceData.is_active !== false,
            deviceData.is_primary || false,
            deviceData.settings || {},
            deviceData.metadata || {},
            deviceData.push_token || null
        ]);
        return new PropertyDevice(result.rows[0]);
    }

    static async update(id, deviceData) {
        const result = await pool.query(`
            UPDATE devices SET
                device_name = COALESCE($2, device_name),
                device_type = COALESCE($3, device_type),
                identifier = COALESCE($4, identifier),
                mac_address = COALESCE($5, mac_address),
                ip_address = COALESCE($6, ip_address),
                serial_number = COALESCE($7, serial_number),
                model = COALESCE($8, model),
                os_version = COALESCE($9, os_version),
                app_version = COALESCE($10, app_version),
                software_version = COALESCE($11, software_version),
                is_active = COALESCE($12, is_active),
                is_primary = COALESCE($13, is_primary),
                settings = COALESCE($14, settings),
                metadata = COALESCE($15, metadata),
                push_token = COALESCE($16, push_token),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [
            id,
            deviceData.device_name,
            deviceData.device_type,
            deviceData.identifier,
            deviceData.mac_address,
            deviceData.ip_address,
            deviceData.serial_number,
            deviceData.model,
            deviceData.os_version,
            deviceData.app_version,
            deviceData.software_version,
            deviceData.is_active,
            deviceData.is_primary,
            deviceData.settings,
            deviceData.metadata,
            deviceData.push_token
        ]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async updateConnection(identifier, ipAddress, appVersion, osVersion) {
        const result = await pool.query(`
            UPDATE devices SET
                last_connected = CURRENT_TIMESTAMP,
                last_ip_address = $2,
                app_version = COALESCE($3, app_version),
                os_version = COALESCE($4, os_version),
                updated_at = CURRENT_TIMESTAMP
            WHERE identifier = $1
            RETURNING *
        `, [identifier, ipAddress, appVersion, osVersion]);
        
        if (result.rows.length > 0) {
            const device = new PropertyDevice(result.rows[0]);
            
            // Log the connection
            await pool.query(`
                INSERT INTO device_connections (
                    device_id, property_id, ip_address, 
                    connection_type, app_version, os_version
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                device.id,
                device.property_id,
                ipAddress,
                'heartbeat',
                appVersion,
                osVersion
            ]);
            
            return device;
        }
        return null;
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM devices WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async setPrimary(propertyId, deviceId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Remove primary flag from all devices of this property
            await client.query(
                'UPDATE devices SET is_primary = false WHERE property_id = $1',
                [propertyId]
            );
            
            // Set the new primary device
            const result = await client.query(
                'UPDATE devices SET is_primary = true WHERE id = $1 AND property_id = $2 RETURNING *',
                [deviceId, propertyId]
            );
            
            await client.query('COMMIT');
            return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async toggleActive(id) {
        const result = await pool.query(`
            UPDATE devices 
            SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async getConnectionHistory(deviceId, limit = 50) {
        const result = await pool.query(`
            SELECT * FROM device_connections 
            WHERE device_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `, [deviceId, limit]);
        return result.rows;
    }

    static async validateDevice(identifier, propertyId) {
        const result = await pool.query(`
            SELECT * FROM devices 
            WHERE identifier = $1 
            AND property_id = $2 
            AND is_active = true
        `, [identifier, propertyId]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }

    static async registerDevice(deviceData, ipAddress) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Check if device already exists
            const existing = await client.query(
                'SELECT * FROM devices WHERE identifier = $1',
                [deviceData.identifier]
            );
            
            let device;
            if (existing.rows.length > 0) {
                // Update existing device
                const updateResult = await client.query(`
                    UPDATE devices SET
                        property_id = $2,
                        device_name = $3,
                        serial_number = $4,
                        model = $5,
                        os_version = $6,
                        app_version = $7,
                        last_connected = CURRENT_TIMESTAMP,
                        last_ip_address = $8,
                        is_active = true,
                        metadata = $9,
                        room_number = $10,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE identifier = $1
                    RETURNING *
                `, [
                    deviceData.identifier,
                    deviceData.property_id,
                    deviceData.device_name,
                    deviceData.serial_number,
                    deviceData.model,
                    deviceData.os_version,
                    deviceData.app_version,
                    ipAddress,
                    deviceData.metadata || {},
                    deviceData.room_number
                ]);
                device = new PropertyDevice(updateResult.rows[0]);
            } else {
                // Create new device
                const createResult = await client.query(`
                    INSERT INTO devices (
                        property_id, device_type, device_name, identifier,
                        serial_number, model, os_version, app_version,
                        last_connected, last_ip_address, is_active, metadata, room_number
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, true, $10, $11)
                    RETURNING *
                `, [
                    deviceData.property_id,
                    deviceData.device_type || 'apple_tv',
                    deviceData.device_name,
                    deviceData.identifier,
                    deviceData.serial_number,
                    deviceData.model,
                    deviceData.os_version,
                    deviceData.app_version,
                    ipAddress,
                    deviceData.metadata || {},
                    deviceData.room_number
                ]);
                device = new PropertyDevice(createResult.rows[0]);
            }
            
            // Log the registration
            await client.query(`
                INSERT INTO device_connections (
                    device_id, property_id, ip_address, 
                    connection_type, app_version, os_version, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                device.id,
                device.property_id,
                ipAddress,
                'registration',
                deviceData.app_version,
                deviceData.os_version,
                { action: existing.rows.length > 0 ? 'updated' : 'created' }
            ]);
            
            await client.query('COMMIT');
            return device;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // MDM-specific methods
    static async enrollDevice(deviceId, supervised = false) {
        const result = await pool.query(`
            UPDATE devices SET
                enrollment_status = 'enrolled',
                enrollment_date = CURRENT_TIMESTAMP,
                supervised = $2,
                provisional_period_end = CASE 
                    WHEN $2 = false THEN CURRENT_TIMESTAMP + INTERVAL '30 days'
                    ELSE NULL
                END,
                device_status = 'online',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, supervised]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async updateMDMStatus(deviceId, status) {
        const result = await pool.query(`
            UPDATE devices SET
                enrollment_status = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, status]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async enableKioskMode(deviceId, config) {
        const result = await pool.query(`
            UPDATE devices SET
                kiosk_mode_enabled = true,
                kiosk_mode_config = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, config || {}]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async disableKioskMode(deviceId) {
        const result = await pool.query(`
            UPDATE devices SET
                kiosk_mode_enabled = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async updateAllowedApps(deviceId, apps) {
        const result = await pool.query(`
            UPDATE devices SET
                allowed_apps = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, JSON.stringify(apps)]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async updateRestrictions(deviceId, restrictions) {
        const result = await pool.query(`
            UPDATE devices SET
                restrictions = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, JSON.stringify(restrictions)]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async addConfigurationProfile(deviceId, profileData) {
        const device = await PropertyDevice.findById(deviceId);
        if (!device) return null;
        
        const profiles = device.configuration_profiles || [];
        profiles.push(profileData);
        
        const result = await pool.query(`
            UPDATE devices SET
                configuration_profiles = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [deviceId, JSON.stringify(profiles)]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async updateHeartbeat(identifier, deviceInfo = {}) {
        const result = await pool.query(`
            UPDATE devices SET
                last_heartbeat = CURRENT_TIMESTAMP,
                device_status = 'online',
                battery_level = COALESCE($2, battery_level),
                storage_available = COALESCE($3, storage_available),
                storage_total = COALESCE($4, storage_total),
                updated_at = CURRENT_TIMESTAMP
            WHERE identifier = $1
            RETURNING *
        `, [
            identifier,
            deviceInfo.battery_level,
            deviceInfo.storage_available,
            deviceInfo.storage_total
        ]);
        return result.rows.length > 0 ? new PropertyDevice(result.rows[0]) : null;
    }
    
    static async getProvisionalExpiringDevices(daysThreshold = 7) {
        const result = await pool.query(`
            SELECT * FROM devices 
            WHERE supervised = false 
            AND enrollment_status = 'enrolled'
            AND provisional_period_end IS NOT NULL
            AND provisional_period_end > CURRENT_TIMESTAMP
            AND provisional_period_end < CURRENT_TIMESTAMP + INTERVAL '%s days'
            ORDER BY provisional_period_end ASC
        `, [daysThreshold]);
        return result.rows.map(row => new PropertyDevice(row));
    }
    
    static async getOfflineDevices(minutesThreshold = 60) {
        const result = await pool.query(`
            SELECT * FROM devices 
            WHERE is_active = true
            AND (last_heartbeat IS NULL OR last_heartbeat < CURRENT_TIMESTAMP - INTERVAL '%s minutes')
            ORDER BY last_heartbeat DESC
        `, [minutesThreshold]);
        return result.rows.map(row => new PropertyDevice(row));
    }
}

export default PropertyDevice;