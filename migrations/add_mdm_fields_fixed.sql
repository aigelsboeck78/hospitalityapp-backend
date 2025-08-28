-- Phase 1: Enhance devices table with MDM fields
-- Add MDM-specific columns to support tvOS device management

ALTER TABLE devices 
-- MDM enrollment and supervision fields
ADD COLUMN IF NOT EXISTS supervised BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'not_enrolled', -- not_enrolled, pending, enrolled, failed
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS provisional_period_end TIMESTAMP,

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

-- Update existing Apple TV device with MDM fields
UPDATE devices 
SET 
    supervised = false,
    enrollment_status = 'not_enrolled',
    device_status = 'unknown',
    room_number = 'Living Room',
    kiosk_mode_enabled = false,
    kiosk_mode_config = '{
        "enabled": false,
        "mode": "autonomous",
        "autoReturn": true,
        "returnTimeout": 1800
    }'::jsonb,
    allowed_apps = '[
        {"name": "Netflix", "bundleId": "com.netflix.Netflix", "enabled": true},
        {"name": "YouTube", "bundleId": "com.google.ios.youtube", "enabled": true},
        {"name": "Spotify", "bundleId": "com.spotify.client", "enabled": true}
    ]'::jsonb,
    restrictions = '{
        "disableAirPlay": false,
        "disableAutoLock": true,
        "disableAppRemoval": true
    }'::jsonb
WHERE identifier = '00008110-000439023C63801E';