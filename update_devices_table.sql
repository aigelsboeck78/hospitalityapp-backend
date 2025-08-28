-- Add missing columns to existing devices table
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS identifier VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS model VARCHAR(255),
ADD COLUMN IF NOT EXISTS os_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS app_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS push_token VARCHAR(500),
ADD COLUMN IF NOT EXISTS last_connected TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_ip_address INET;

-- Create unique constraint
ALTER TABLE devices 
ADD CONSTRAINT unique_property_identifier UNIQUE (property_id, identifier);

-- Insert the Apple TV device for the first property
INSERT INTO devices (
    property_id,
    device_type,
    device_name,
    identifier,
    serial_number,
    model,
    is_active,
    is_primary,
    metadata
) VALUES (
    (SELECT id FROM properties LIMIT 1),
    'apple_tv',
    'Living Room Apple TV',
    '00008110-000439023C63801E',
    'MW1R9ND9G1',
    'Apple TV 4K (3rd generation)',
    true,
    true,
    '{"generation": "3rd", "storage": "128GB", "resolution": "4K", "hdr": true}'
) ON CONFLICT (identifier) DO UPDATE 
SET 
    serial_number = EXCLUDED.serial_number,
    model = EXCLUDED.model,
    is_active = EXCLUDED.is_active,
    is_primary = EXCLUDED.is_primary,
    metadata = EXCLUDED.metadata;

-- Create device connections table if not exists
CREATE TABLE IF NOT EXISTS device_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    ip_address INET,
    connection_type VARCHAR(50),
    app_version VARCHAR(50),
    os_version VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_connections_device ON device_connections(device_id);
CREATE INDEX IF NOT EXISTS idx_device_connections_property ON device_connections(property_id);
CREATE INDEX IF NOT EXISTS idx_device_connections_created ON device_connections(created_at);
