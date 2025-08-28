-- Create push notification queue table
CREATE TABLE IF NOT EXISTS push_notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_push_queue_device ON push_notification_queue(device_id);
CREATE INDEX IF NOT EXISTS idx_push_queue_status ON push_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_push_queue_created ON push_notification_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_push_queue_priority ON push_notification_queue(priority DESC, created_at ASC);

-- Create push notification log table
CREATE TABLE IF NOT EXISTS push_notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    notification_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- delivered, failed, pending
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_log_device ON push_notification_log(device_id);
CREATE INDEX IF NOT EXISTS idx_push_log_type ON push_notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_push_log_status ON push_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_push_log_created ON push_notification_log(created_at);

-- Create push notification templates table
CREATE TABLE IF NOT EXISTS push_notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    payload_template JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_templates_property ON push_notification_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_push_templates_type ON push_notification_templates(notification_type);
CREATE INDEX IF NOT EXISTS idx_push_templates_active ON push_notification_templates(is_active);

-- Add some default notification templates
INSERT INTO push_notification_templates (property_id, name, notification_type, title, message, payload_template)
SELECT 
    p.id,
    'Device Offline Alert',
    'device_offline',
    'Device Offline',
    'Device {{device_name}} has been offline for {{minutes}} minutes',
    '{
        "severity": "warning",
        "action": "check_device"
    }'::jsonb
FROM properties p
WHERE NOT EXISTS (
    SELECT 1 FROM push_notification_templates t 
    WHERE t.property_id = p.id AND t.notification_type = 'device_offline'
)
LIMIT 1;

INSERT INTO push_notification_templates (property_id, name, notification_type, title, message, payload_template)
SELECT 
    p.id,
    'Kiosk Mode Changed',
    'kiosk_mode_changed',
    'Kiosk Mode Updated',
    'Kiosk mode has been {{status}} on {{device_name}}',
    '{
        "severity": "info",
        "kiosk_enabled": "{{enabled}}"
    }'::jsonb
FROM properties p
WHERE NOT EXISTS (
    SELECT 1 FROM push_notification_templates t 
    WHERE t.property_id = p.id AND t.notification_type = 'kiosk_mode_changed'
)
LIMIT 1;

INSERT INTO push_notification_templates (property_id, name, notification_type, title, message, payload_template)
SELECT 
    p.id,
    'Configuration Applied',
    'config_applied',
    'Configuration Update',
    'New configuration has been applied to {{device_name}}',
    '{
        "severity": "info",
        "profiles": []
    }'::jsonb
FROM properties p
WHERE NOT EXISTS (
    SELECT 1 FROM push_notification_templates t 
    WHERE t.property_id = p.id AND t.notification_type = 'config_applied'
)
LIMIT 1;