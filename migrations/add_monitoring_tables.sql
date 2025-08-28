-- Add monitoring columns to devices table
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS cpu_usage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS memory_usage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS temperature DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS wifi_signal INTEGER,
ADD COLUMN IF NOT EXISTS network_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS kiosk_configuration JSONB;

-- Create device metrics history table
CREATE TABLE IF NOT EXISTS device_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    battery_level INTEGER,
    storage_available BIGINT,
    storage_total BIGINT,
    temperature DECIMAL(5,2),
    disk_io DECIMAL(10,2),
    network_latency INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create network statistics table
CREATE TABLE IF NOT EXISTS network_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    bytes_downloaded BIGINT,
    bytes_uploaded BIGINT,
    packets_sent BIGINT,
    packets_received BIGINT,
    errors INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    error_type VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT,
    details JSONB,
    stack_trace TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create MDM alerts table
CREATE TABLE IF NOT EXISTS mdm_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id),
    alert_type VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255),
    message TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_timestamp ON device_metrics(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_metrics_property_timestamp ON device_metrics(property_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_network_stats_device_timestamp ON network_stats(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_device_timestamp ON error_logs(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device ON mdm_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_mdm_alerts_resolved ON mdm_alerts(resolved);

-- Create function to automatically clean old metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
    -- Keep only last 30 days of detailed metrics
    DELETE FROM device_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM network_stats WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Keep only last 90 days of error logs
    DELETE FROM error_logs WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Add sample monitoring data for testing
INSERT INTO device_metrics (device_id, property_id, cpu_usage, memory_usage, battery_level, storage_available, storage_total, temperature)
SELECT 
    d.id,
    d.property_id,
    30 + random() * 40,
    40 + random() * 30,
    70 + random() * 30,
    10737418240 + random() * 53687091200, -- 10GB to 60GB available
    64424509440, -- 60GB total
    35 + random() * 10
FROM devices d
WHERE d.enrollment_status = 'enrolled'
LIMIT 5;

-- Add completed_at column to mdm_commands if not exists
ALTER TABLE mdm_commands
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add sample command history
INSERT INTO mdm_commands (id, device_id, command_type, status, payload, priority, created_at, completed_at)
SELECT 
    gen_random_uuid(),
    d.id,
    (ARRAY['RestartDevice', 'EnableKioskMode', 'InstallProfile', 'DeviceInformation'])[floor(random() * 4 + 1)],
    (ARRAY['completed', 'completed', 'completed', 'pending'])[floor(random() * 4 + 1)],
    '{}'::jsonb,
    5,
    NOW() - (random() * INTERVAL '7 days'),
    CASE 
        WHEN random() > 0.3 THEN NOW() - (random() * INTERVAL '6 days')
        ELSE NULL
    END
FROM devices d
WHERE d.enrollment_status = 'enrolled'
LIMIT 10;