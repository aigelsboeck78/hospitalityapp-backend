import pool from '../config/database.js';

class ConfigurationProfile {
    constructor(data) {
        this.id = data.id;
        this.property_id = data.property_id;
        this.name = data.name;
        this.description = data.description;
        this.profile_type = data.profile_type;
        this.profile_uuid = data.profile_uuid;
        this.profile_content = data.profile_content;
        this.is_active = data.is_active;
        this.is_default = data.is_default;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(profileData) {
        const result = await pool.query(`
            INSERT INTO configuration_profiles (
                property_id, name, description, profile_type,
                profile_uuid, profile_content, is_active, is_default
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            profileData.property_id,
            profileData.name,
            profileData.description,
            profileData.profile_type,
            profileData.profile_uuid || `com.chaletmoments.${profileData.profile_type}.${Date.now()}`,
            profileData.profile_content,
            profileData.is_active !== false,
            profileData.is_default || false
        ]);
        return new ConfigurationProfile(result.rows[0]);
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM configuration_profiles WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? new ConfigurationProfile(result.rows[0]) : null;
    }

    static async findByProperty(propertyId, activeOnly = false) {
        let query = 'SELECT * FROM configuration_profiles WHERE property_id = $1';
        const params = [propertyId];
        
        if (activeOnly) {
            query += ' AND is_active = true';
        }
        
        query += ' ORDER BY profile_type, name';
        
        const result = await pool.query(query, params);
        return result.rows.map(row => new ConfigurationProfile(row));
    }

    static async findByType(propertyId, profileType) {
        const result = await pool.query(
            'SELECT * FROM configuration_profiles WHERE property_id = $1 AND profile_type = $2 AND is_active = true',
            [propertyId, profileType]
        );
        return result.rows.map(row => new ConfigurationProfile(row));
    }

    static async update(id, profileData) {
        const result = await pool.query(`
            UPDATE configuration_profiles SET
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                profile_content = COALESCE($4, profile_content),
                is_active = COALESCE($5, is_active),
                is_default = COALESCE($6, is_default),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [
            id,
            profileData.name,
            profileData.description,
            profileData.profile_content,
            profileData.is_active,
            profileData.is_default
        ]);
        return result.rows.length > 0 ? new ConfigurationProfile(result.rows[0]) : null;
    }

    static async delete(id) {
        // First remove all device assignments
        await pool.query(
            'DELETE FROM device_profile_assignments WHERE profile_id = $1',
            [id]
        );
        
        const result = await pool.query(
            'DELETE FROM configuration_profiles WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows.length > 0 ? new ConfigurationProfile(result.rows[0]) : null;
    }

    static async setDefault(propertyId, profileId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Get profile type
            const profileResult = await client.query(
                'SELECT profile_type FROM configuration_profiles WHERE id = $1',
                [profileId]
            );
            
            if (profileResult.rows.length === 0) {
                throw new Error('Profile not found');
            }
            
            const profileType = profileResult.rows[0].profile_type;
            
            // Remove default flag from all profiles of same type
            await client.query(
                'UPDATE configuration_profiles SET is_default = false WHERE property_id = $1 AND profile_type = $2',
                [propertyId, profileType]
            );
            
            // Set new default
            const result = await client.query(
                'UPDATE configuration_profiles SET is_default = true WHERE id = $1 RETURNING *',
                [profileId]
            );
            
            await client.query('COMMIT');
            return new ConfigurationProfile(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async assignToDevice(profileId, deviceId) {
        try {
            const result = await pool.query(`
                INSERT INTO device_profile_assignments (device_id, profile_id)
                VALUES ($1, $2)
                ON CONFLICT (device_id, profile_id) DO UPDATE
                SET assigned_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [deviceId, profileId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async removeFromDevice(profileId, deviceId) {
        const result = await pool.query(
            'DELETE FROM device_profile_assignments WHERE device_id = $1 AND profile_id = $2 RETURNING *',
            [deviceId, profileId]
        );
        return result.rows.length > 0;
    }

    static async getDeviceProfiles(deviceId) {
        const result = await pool.query(`
            SELECT cp.*, dpa.assigned_at, dpa.installed_at, dpa.status as assignment_status
            FROM configuration_profiles cp
            JOIN device_profile_assignments dpa ON cp.id = dpa.profile_id
            WHERE dpa.device_id = $1
            ORDER BY cp.profile_type, cp.name
        `, [deviceId]);
        return result.rows.map(row => new ConfigurationProfile(row));
    }

    static async updateAssignmentStatus(deviceId, profileId, status, errorMessage = null) {
        const result = await pool.query(`
            UPDATE device_profile_assignments SET
                status = $3,
                installed_at = CASE WHEN $3 = 'installed' THEN CURRENT_TIMESTAMP ELSE installed_at END,
                error_message = $4
            WHERE device_id = $1 AND profile_id = $2
            RETURNING *
        `, [deviceId, profileId, status, errorMessage]);
        return result.rows[0];
    }

    static async generateProfileContent(type, config) {
        switch (type) {
            case 'wifi':
                return ConfigurationProfile.generateWiFiProfile(config);
            case 'restrictions':
                return ConfigurationProfile.generateRestrictionsProfile(config);
            case 'display':
                return ConfigurationProfile.generateDisplayProfile(config);
            case 'kiosk':
                return ConfigurationProfile.generateKioskProfile(config);
            default:
                throw new Error(`Unknown profile type: ${type}`);
        }
    }

    static generateWiFiProfile(config) {
        return {
            PayloadType: 'Configuration',
            PayloadVersion: 1,
            PayloadIdentifier: config.identifier || `com.chaletmoments.wifi.${Date.now()}`,
            PayloadUUID: config.uuid || ConfigurationProfile.generateUUID(),
            PayloadDisplayName: config.displayName || 'Guest WiFi Configuration',
            PayloadDescription: config.description || 'WiFi settings for guest devices',
            PayloadContent: [
                {
                    PayloadType: 'com.apple.wifi.managed',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.wifi'}.wifi1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'WiFi',
                    SSID_STR: config.ssid,
                    AutoJoin: true,
                    EncryptionType: config.encryptionType || 'WPA2',
                    Password: config.password,
                    ProxyType: 'None',
                    CaptiveBypass: false,
                    DisableAssociationMACRandomization: false
                }
            ]
        };
    }

    static generateRestrictionsProfile(config) {
        return {
            PayloadType: 'Configuration',
            PayloadVersion: 1,
            PayloadIdentifier: config.identifier || `com.chaletmoments.restrictions.${Date.now()}`,
            PayloadUUID: config.uuid || ConfigurationProfile.generateUUID(),
            PayloadDisplayName: config.displayName || 'Guest Device Restrictions',
            PayloadDescription: config.description || 'Security and usage restrictions for guest devices',
            PayloadContent: [
                {
                    PayloadType: 'com.apple.tvos.restrictions',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.restrictions'}.restrictions1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'Restrictions',
                    allowAirPlayIncomingRequests: config.allowAirPlay !== false,
                    allowRemoteAppPairing: config.allowRemoteAppPairing !== false,
                    allowUIConfigurationProfileInstallation: false,
                    allowUntrustedTLSPrompt: false,
                    allowEraseContentAndSettings: config.allowEraseContent === true,
                    allowPairedRemoteControl: config.allowPairedRemote !== false,
                    allowScreenRecording: config.allowScreenRecording === true,
                    forceAutomaticDateAndTime: true,
                    allowModificationOfSettings: config.allowSettingsModification === true,
                    allowPasswordModification: false,
                    allowAccountModification: false,
                    allowAppInstallation: config.allowAppInstallation === true,
                    allowAppRemoval: config.allowAppRemoval === true,
                    allowInAppPurchases: config.allowInAppPurchases === true
                }
            ]
        };
    }

    static generateDisplayProfile(config) {
        return {
            PayloadType: 'Configuration',
            PayloadVersion: 1,
            PayloadIdentifier: config.identifier || `com.chaletmoments.display.${Date.now()}`,
            PayloadUUID: config.uuid || ConfigurationProfile.generateUUID(),
            PayloadDisplayName: config.displayName || 'Display Settings',
            PayloadDescription: config.description || 'Display and screensaver settings',
            PayloadContent: [
                {
                    PayloadType: 'com.apple.tvos.screensaver',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.display'}.screensaver1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'Screensaver',
                    IdleTime: config.idleTime || 300, // 5 minutes default
                    ShowClock: config.showClock !== false,
                    ShowWithMusic: config.showWithMusic !== false,
                    Type: config.screensaverType || 'Aerial'
                },
                {
                    PayloadType: 'com.apple.tvos.display',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.display'}.display1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'Display',
                    AutoBrightness: config.autoBrightness !== false,
                    ScreenResolution: config.resolution || 'Auto',
                    HDRMode: config.hdrMode || 'Auto',
                    FrameRate: config.frameRate || 'Auto',
                    ColorSpace: config.colorSpace || 'Auto'
                }
            ]
        };
    }

    static generateKioskProfile(config) {
        // Ensure hospitality app is always the home app
        const homeApp = config.homeApp || 'com.chaletmoments.hospitality';
        
        // Build allowed apps list with hospitality app always included
        let allowedApps = config.allowedApps || [];
        
        // Ensure home app is in the allowed apps list
        const hasHomeApp = allowedApps.some(app => 
            app.bundleId === homeApp || app === homeApp
        );
        
        if (!hasHomeApp) {
            allowedApps = [
                { bundleId: homeApp, name: 'Hospitality', enabled: true },
                ...allowedApps
            ];
        }
        
        // Format allowed apps for MDM profile
        const formattedApps = allowedApps.map(app => {
            if (typeof app === 'string') {
                return { bundleId: app, enabled: true };
            }
            return {
                bundleId: app.bundleId,
                enabled: app.enabled !== false
            };
        });

        return {
            PayloadType: 'Configuration',
            PayloadVersion: 1,
            PayloadIdentifier: config.identifier || `com.chaletmoments.kiosk.${Date.now()}`,
            PayloadUUID: config.uuid || ConfigurationProfile.generateUUID(),
            PayloadDisplayName: config.displayName || 'Kiosk Mode Configuration',
            PayloadDescription: config.description || 'Entertainment apps with auto-return to hospitality app',
            PayloadContent: [
                {
                    PayloadType: 'com.apple.app.lock',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.kiosk'}.applock1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'App Lock',
                    App: {
                        Identifier: homeApp,
                        Options: {
                            DisableAutoLock: true,
                            DisableDeviceRotation: false,
                            DisableRingerSwitch: true,
                            DisableScreenLock: true,
                            DisableSleepWakeButton: false,
                            DisableVolumeButtons: false,
                            EnableAssistiveTouch: false,
                            EnableInvertColors: false,
                            EnableMonoAudio: false,
                            EnableSpeakScreen: false,
                            EnableVoiceOver: false,
                            EnableZoom: false
                        },
                        UserEnabledOptions: config.userEnabledOptions || {}
                    }
                },
                {
                    PayloadType: 'com.apple.tvos.autonomoussingleappmode',
                    PayloadVersion: 1,
                    PayloadIdentifier: `${config.identifier || 'com.chaletmoments.kiosk'}.asam1`,
                    PayloadUUID: ConfigurationProfile.generateUUID(),
                    PayloadDisplayName: 'Autonomous Single App Mode',
                    Enabled: config.enabled !== false,
                    AllowedApps: formattedApps,
                    HomeApp: homeApp,
                    AutoReturnToApp: config.autoReturn !== false,
                    ReturnTimeout: config.returnTimeout || 1800,
                    ReturnToHomeApp: true,
                    HomeAppBundleId: homeApp
                }
            ]
        };
    }

    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }
}

// Profile types enum
ConfigurationProfile.ProfileTypes = {
    WIFI: 'wifi',
    RESTRICTIONS: 'restrictions',
    DISPLAY: 'display',
    KIOSK: 'kiosk',
    CUSTOM: 'custom'
};

export default ConfigurationProfile;