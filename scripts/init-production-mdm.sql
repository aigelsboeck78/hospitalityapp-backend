-- MDM Production Database Initialization Script
-- Run this in your Vercel/Supabase database to enable MDM functionality

-- Create mdm_profiles table
CREATE TABLE IF NOT EXISTS mdm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    profile_name VARCHAR(255) NOT NULL,
    profile_type VARCHAR(50),
    profile_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, profile_name)
);

-- Create mdm_alerts table
CREATE TABLE IF NOT EXISTS mdm_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mdm_commands table
CREATE TABLE IF NOT EXISTS mdm_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    command_type VARCHAR(50) NOT NULL,
    command_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    executed_at TIMESTAMP,
    result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mdm_device_status table
CREATE TABLE IF NOT EXISTS mdm_device_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    battery_level INTEGER,
    storage_available BIGINT,
    storage_total BIGINT,
    network_status VARCHAR(50),
    current_app VARCHAR(255),
    screen_status VARCHAR(20),
    kiosk_mode_active BOOLEAN DEFAULT false,
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_property_id 
    ON mdm_alerts(property_id) WHERE is_resolved = false;

CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device_id 
    ON mdm_alerts(device_id);

CREATE INDEX IF NOT EXISTS idx_mdm_commands_device_id 
    ON mdm_commands(device_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_mdm_device_status_device_id 
    ON mdm_device_status(device_id);

CREATE INDEX IF NOT EXISTS idx_mdm_profiles_property_id 
    ON mdm_profiles(property_id) WHERE is_active = true;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_mdm_profiles_updated_at ON mdm_profiles;
CREATE TRIGGER update_mdm_profiles_updated_at
    BEFORE UPDATE ON mdm_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mdm_commands_updated_at ON mdm_commands;
CREATE TRIGGER update_mdm_commands_updated_at
    BEFORE UPDATE ON mdm_commands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mdm_device_status_updated_at ON mdm_device_status;
CREATE TRIGGER update_mdm_device_status_updated_at
    BEFORE UPDATE ON mdm_device_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add MDM-specific columns to devices table if they don't exist
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'not_enrolled',
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP,
ADD COLUMN IF NOT EXISTS os_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS app_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS push_token VARCHAR(255);

-- Insert default MDM profile for testing
INSERT INTO mdm_profiles (
    property_id,
    profile_name,
    profile_type,
    profile_data,
    is_active
) VALUES (
    '41059600-402d-434e-9b34-2b4821f6e3a4', -- Chalet 20
    'Default Profile',
    'standard',
    '{
        "kiosk_mode": {
            "enabled": false,
            "mode": "relaxed",
            "auto_return": true,
            "timeout": 300
        },
        "allowed_apps": [
            {"bundleId": "com.netflix.Netflix", "enabled": true},
            {"bundleId": "com.google.ios.youtube", "enabled": true},
            {"bundleId": "com.disney.disneyplus", "enabled": true}
        ],
        "restrictions": {
            "disable_airplay": false,
            "disable_auto_lock": true,
            "disable_app_removal": true
        }
    }'::jsonb,
    true
) ON CONFLICT (property_id, profile_name) DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mdm_profiles', 'mdm_alerts', 'mdm_commands', 'mdm_device_status')
ORDER BY table_name;

-- Show table counts
SELECT 
    'mdm_profiles' as table_name, COUNT(*) as count FROM mdm_profiles
UNION ALL
SELECT 
    'mdm_alerts' as table_name, COUNT(*) as count FROM mdm_alerts
UNION ALL
SELECT 
    'mdm_commands' as table_name, COUNT(*) as count FROM mdm_commands
UNION ALL
SELECT 
    'mdm_device_status' as table_name, COUNT(*) as count FROM mdm_device_status;