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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_templates_property ON push_notification_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_push_templates_type ON push_notification_templates(notification_type);
CREATE INDEX IF NOT EXISTS idx_push_templates_active ON push_notification_templates(is_active);

-- Add sample templates
INSERT INTO push_notification_templates (property_id, name, notification_type, title, message, payload_template)
SELECT 
    p.id,
    'Welcome Message',
    'welcome',
    'Welcome to {{property_name}}',
    'We hope you enjoy your stay!',
    '{"priority": "high", "badge": 1}'::jsonb
FROM properties p
ON CONFLICT DO NOTHING;

INSERT INTO push_notification_templates (property_id, name, notification_type, title, message, payload_template)
SELECT 
    p.id,
    'MDM Command',
    'mdm_command',
    'Device Management',
    'A new command is available for your device',
    '{"priority": "critical", "silent": true}'::jsonb
FROM properties p
ON CONFLICT DO NOTHING;