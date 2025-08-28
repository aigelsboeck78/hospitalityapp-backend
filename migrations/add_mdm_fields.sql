-- Phase 1: Enhance devices table with MDM fields
-- Add MDM-specific columns to support tvOS device management

ALTER TABLE devices 
-- MDM enrollment and supervision fields
ADD COLUMN IF NOT EXISTS supervised BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'not_enrolled', -- not_enrolled, pending, enrolled, failed
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS provisional_period_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS provisional_days_left INTEGER GENERATED ALWAYS AS (
    CASE 
        WHEN provisional_period_end IS NOT NULL AND provisional_period_end > CURRENT_TIMESTAMP 
        THEN EXTRACT(DAY FROM provisional_period_end - CURRENT_TIMESTAMP)::INTEGER
        ELSE 0
    END
) STORED,

-- MDM configuration fields
ADD COLUMN IF NOT EXISTS mdm_profile_uuid VARCHAR(255),
ADD COLUMN IF NOT EXISTS configuration_profiles JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS kiosk_mode_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kiosk_mode_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allowed_apps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '{}',

-- Command and status tracking
ADD COLUMN IF NOT EXISTS last_command_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_command_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS pending_commands JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS command_history JSONB DEFAULT '[]',

-- Additional device info
ADD COLUMN IF NOT EXISTS room_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS device_status VARCHAR(50) DEFAULT 'unknown', -- unknown, online, offline, error
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP,
ADD COLUMN IF NOT EXISTS battery_level INTEGER,
ADD COLUMN IF NOT EXISTS storage_available BIGINT,
ADD COLUMN IF NOT EXISTS storage_total BIGINT;

-- Create indexes for MDM fields
CREATE INDEX IF NOT EXISTS idx_devices_enrollment_status ON devices(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_devices_supervised ON devices(supervised);
CREATE INDEX IF NOT EXISTS idx_devices_provisional_end ON devices(provisional_period_end) WHERE provisional_period_end IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_kiosk_mode ON devices(kiosk_mode_enabled);
CREATE INDEX IF NOT EXISTS idx_devices_device_status ON devices(device_status);
CREATE INDEX IF NOT EXISTS idx_devices_room_number ON devices(property_id, room_number);

-- Create MDM command queue table
CREATE TABLE IF NOT EXISTS mdm_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    command_type VARCHAR(100) NOT NULL, -- RestartDevice, EnableKioskMode, DisableKioskMode, InstallProfile, RemoveProfile, etc.
    command_payload JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, acknowledged, completed, failed
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'acknowledged', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_mdm_commands_device ON mdm_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_mdm_commands_status ON mdm_commands(status);
CREATE INDEX IF NOT EXISTS idx_mdm_commands_created ON mdm_commands(created_at);
CREATE INDEX IF NOT EXISTS idx_mdm_commands_priority ON mdm_commands(priority DESC, created_at ASC);

-- Create configuration profiles table
CREATE TABLE IF NOT EXISTS configuration_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_type VARCHAR(50) NOT NULL, -- kiosk, restrictions, wifi, display
    profile_uuid VARCHAR(255) UNIQUE,
    profile_content JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_config_profiles_property ON configuration_profiles(property_id);
CREATE INDEX IF NOT EXISTS idx_config_profiles_type ON configuration_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_config_profiles_active ON configuration_profiles(is_active);

-- Create device profile assignments table
CREATE TABLE IF NOT EXISTS device_profile_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES configuration_profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    installed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, installing, installed, failed
    error_message TEXT,
    UNIQUE(device_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_device_profiles_device ON device_profile_assignments(device_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_profile ON device_profile_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_status ON device_profile_assignments(status);

-- Create MDM alerts table for monitoring
CREATE TABLE IF NOT EXISTS mdm_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL, -- provisional_expiring, device_offline, command_failed, kiosk_disabled
    severity VARCHAR(20) NOT NULL, -- info, warning, error, critical
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device ON mdm_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_property ON mdm_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_type ON mdm_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_severity ON mdm_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_resolved ON mdm_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_created ON mdm_alerts(created_at);

-- Add some default configuration profiles for the property
INSERT INTO configuration_profiles (property_id, name, description, profile_type, profile_uuid, profile_content)
SELECT 
    p.id,
    'Default Kiosk Mode',
    'Standard kiosk mode configuration for guest rooms',
    'kiosk',
    'com.chaletmoments.kiosk.default',
    '{
        "enabled": true,
        "mode": "autonomous",
        "autoReturn": true,
        "returnTimeout": 1800,
        "allowedApps": [
            {"name": "Netflix", "bundleId": "com.netflix.Netflix", "enabled": true},
            {"name": "YouTube", "bundleId": "com.google.ios.youtube", "enabled": true},
            {"name": "Spotify", "bundleId": "com.spotify.client", "enabled": true},
            {"name": "Disney+", "bundleId": "com.disney.disneyplus", "enabled": true}
        ],
        "homeApp": "com.chaletmoments.hospitality"
    }'::jsonb
FROM properties p
WHERE NOT EXISTS (
    SELECT 1 FROM configuration_profiles cp 
    WHERE cp.property_id = p.id AND cp.profile_type = 'kiosk'
)
LIMIT 1;

-- Add default restrictions profile
INSERT INTO configuration_profiles (property_id, name, description, profile_type, profile_uuid, profile_content)
SELECT 
    p.id,
    'Guest Restrictions',
    'Standard restrictions for guest devices',
    'restrictions',
    'com.chaletmoments.restrictions.guest',
    '{
        "disableAirPlay": false,
        "disableAutoLock": true,
        "disableAppRemoval": true,
        "disableInAppPurchases": true,
        "disablePasswordModification": true,
        "disableAccountModification": true,
        "disableEraseContent": true,
        "forceAutomaticDateAndTime": true
    }'::jsonb
FROM properties p
WHERE NOT EXISTS (
    SELECT 1 FROM configuration_profiles cp 
    WHERE cp.property_id = p.id AND cp.profile_type = 'restrictions'
)
LIMIT 1;