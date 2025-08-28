-- Create property devices table for managing connected devices (Apple TV, etc.)
CREATE TABLE IF NOT EXISTS property_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL, -- 'apple_tv', 'ipad', 'fire_tv', etc.
    device_name VARCHAR(255) NOT NULL,
    identifier VARCHAR(255) UNIQUE NOT NULL, -- Unique device identifier
    serial_number VARCHAR(100),
    model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    last_connected TIMESTAMP,
    last_ip_address INET,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false, -- Primary device for the property
    metadata JSONB DEFAULT '{}', -- Additional device-specific data
    push_token VARCHAR(500), -- For push notifications if applicable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, identifier)
);

-- Create indexes for faster queries
CREATE INDEX idx_property_devices_property ON property_devices(property_id);
CREATE INDEX idx_property_devices_identifier ON property_devices(identifier);
CREATE INDEX idx_property_devices_active ON property_devices(property_id, is_active);

-- Insert the Apple TV device for the first property
INSERT INTO property_devices (
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
);

-- Add device registration log table for tracking connection history
CREATE TABLE IF NOT EXISTS device_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES property_devices(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    ip_address INET,
    connection_type VARCHAR(50), -- 'registration', 'heartbeat', 'disconnect'
    app_version VARCHAR(50),
    os_version VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_connections_device ON device_connections(device_id);
CREATE INDEX idx_device_connections_property ON device_connections(property_id);
CREATE INDEX idx_device_connections_created ON device_connections(created_at);
