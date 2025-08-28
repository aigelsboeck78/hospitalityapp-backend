import pool from '../config/database.js';

export const getMonitoringData = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { range = '24h' } = req.query;
        
        // Calculate time range
        let interval;
        switch(range) {
            case '1h': interval = '1 hour'; break;
            case '24h': interval = '24 hours'; break;
            case '7d': interval = '7 days'; break;
            case '30d': interval = '30 days'; break;
            default: interval = '24 hours';
        }
        
        // Fetch system health metrics
        const systemHealthQuery = `
            SELECT 
                d.id,
                d.device_name,
                d.device_status,
                d.battery_level,
                d.storage_available,
                d.storage_total,
                d.cpu_usage,
                d.memory_usage,
                d.temperature,
                d.last_heartbeat,
                d.wifi_signal,
                d.network_status
            FROM devices d
            WHERE d.property_id = $1
            ORDER BY d.device_name
        `;
        
        // Fetch performance data over time
        const performanceQuery = `
            SELECT 
                timestamp,
                AVG(cpu_usage) as cpu,
                AVG(memory_usage) as memory,
                AVG(disk_io) as disk
            FROM device_metrics
            WHERE property_id = $1 
                AND timestamp > NOW() - INTERVAL '${interval}'
            GROUP BY timestamp
            ORDER BY timestamp DESC
            LIMIT 100
        `;
        
        // Fetch network statistics
        const networkStatsQuery = `
            SELECT 
                DATE_TRUNC('hour', timestamp) as time,
                SUM(bytes_downloaded) / 1048576 as download,
                SUM(bytes_uploaded) / 1048576 as upload
            FROM network_stats
            WHERE property_id = $1 
                AND timestamp > NOW() - INTERVAL '${interval}'
            GROUP BY time
            ORDER BY time DESC
            LIMIT 24
        `;
        
        // Fetch command history
        const commandHistoryQuery = `
            SELECT 
                mc.id,
                mc.command_type,
                mc.status,
                mc.created_at as timestamp,
                mc.completed_at,
                d.device_name,
                CASE 
                    WHEN mc.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (mc.completed_at - mc.created_at)) * 1000
                    ELSE NULL
                END as duration
            FROM mdm_commands mc
            JOIN devices d ON mc.device_id = d.id
            WHERE d.property_id = $1
                AND mc.created_at > NOW() - INTERVAL '${interval}'
            ORDER BY mc.created_at DESC
            LIMIT 50
        `;
        
        // Fetch error logs
        const errorLogsQuery = `
            SELECT 
                el.id,
                el.error_type,
                el.message,
                el.details,
                el.timestamp,
                d.device_name
            FROM error_logs el
            JOIN devices d ON el.device_id = d.id
            WHERE d.property_id = $1
                AND el.timestamp > NOW() - INTERVAL '${interval}'
                AND el.severity IN ('error', 'critical')
            ORDER BY el.timestamp DESC
            LIMIT 100
        `;
        
        // Execute all queries in parallel
        const [
            systemHealthResult,
            performanceResult,
            networkStatsResult,
            commandHistoryResult,
            errorLogsResult
        ] = await Promise.all([
            pool.query(systemHealthQuery, [propertyId]),
            pool.query(performanceQuery, [propertyId]).catch(() => ({ rows: [] })),
            pool.query(networkStatsQuery, [propertyId]).catch(() => ({ rows: [] })),
            pool.query(commandHistoryQuery, [propertyId]),
            pool.query(errorLogsQuery, [propertyId]).catch(() => ({ rows: [] }))
        ]);
        
        res.json({
            success: true,
            data: {
                systemHealth: systemHealthResult.rows,
                performanceData: performanceResult.rows,
                networkStats: networkStatsResult.rows,
                commandHistory: commandHistoryResult.rows,
                errorLogs: errorLogsResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching monitoring data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch monitoring data'
        });
    }
};

export const getDeviceMetrics = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { metric, range = '24h' } = req.query;
        
        let interval;
        switch(range) {
            case '1h': interval = '1 hour'; break;
            case '24h': interval = '24 hours'; break;
            case '7d': interval = '7 days'; break;
            case '30d': interval = '30 days'; break;
            default: interval = '24 hours';
        }
        
        const query = `
            SELECT 
                timestamp,
                ${metric === 'cpu' ? 'cpu_usage' :
                  metric === 'memory' ? 'memory_usage' :
                  metric === 'battery' ? 'battery_level' :
                  metric === 'storage' ? 'storage_available' :
                  metric === 'network' ? 'network_latency' :
                  'cpu_usage'} as value
            FROM device_metrics
            WHERE device_id = $1
                AND timestamp > NOW() - INTERVAL '${interval}'
            ORDER BY timestamp DESC
            LIMIT 200
        `;
        
        const result = await pool.query(query, [deviceId]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching device metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch device metrics'
        });
    }
};

export const getAlerts = async (req, res) => {
    try {
        const { propertyId } = req.query;
        const { resolved = 'false' } = req.query;
        
        const query = `
            SELECT 
                a.id,
                a.alert_type,
                a.severity,
                a.title,
                a.message,
                a.device_id,
                a.created_at,
                a.resolved_at,
                a.resolved_by,
                d.device_name
            FROM mdm_alerts a
            LEFT JOIN devices d ON a.device_id = d.id
            WHERE ($1::uuid IS NULL OR d.property_id = $1)
                AND ($2::boolean IS NULL OR a.is_resolved = $2)
            ORDER BY a.created_at DESC
            LIMIT 100
        `;
        
        const result = await pool.query(query, [
            propertyId || null,
            resolved === 'true' ? true : resolved === 'false' ? false : null
        ]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alerts'
        });
    }
};

export const resolveAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const { resolvedBy } = req.body;
        
        const query = `
            UPDATE mdm_alerts
            SET is_resolved = true,
                resolved_at = NOW(),
                resolved_by = $2
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [alertId, resolvedBy]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve alert'
        });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { deviceId, alertType, severity, title, message } = req.body;
        
        const query = `
            INSERT INTO mdm_alerts (
                device_id, alert_type, severity, title, message
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            deviceId, alertType, severity, title, message
        ]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create alert'
        });
    }
};

export const getCommandStatistics = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { range = '7d' } = req.query;
        
        let interval;
        switch(range) {
            case '1h': interval = '1 hour'; break;
            case '24h': interval = '24 hours'; break;
            case '7d': interval = '7 days'; break;
            case '30d': interval = '30 days'; break;
            default: interval = '7 days';
        }
        
        const query = `
            SELECT 
                command_type,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                AVG(
                    CASE 
                        WHEN completed_at IS NOT NULL 
                        THEN EXTRACT(EPOCH FROM (completed_at - created_at))
                        ELSE NULL
                    END
                ) as avg_duration_seconds
            FROM mdm_commands mc
            JOIN devices d ON mc.device_id = d.id
            WHERE d.property_id = $1
                AND mc.created_at > NOW() - INTERVAL '${interval}'
            GROUP BY command_type
            ORDER BY total DESC
        `;
        
        const result = await pool.query(query, [propertyId]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching command statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch command statistics'
        });
    }
};

export const recordDeviceMetrics = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const {
            cpu_usage,
            memory_usage,
            battery_level,
            storage_available,
            storage_total,
            temperature,
            wifi_signal,
            network_status
        } = req.body;
        
        // Update device with latest metrics
        const updateQuery = `
            UPDATE devices
            SET cpu_usage = $2,
                memory_usage = $3,
                battery_level = $4,
                storage_available = $5,
                storage_total = $6,
                temperature = $7,
                wifi_signal = $8,
                network_status = $9,
                last_heartbeat = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [
            deviceId,
            cpu_usage,
            memory_usage,
            battery_level,
            storage_available,
            storage_total,
            temperature,
            wifi_signal,
            network_status
        ]);
        
        // Insert into metrics history table (if it exists)
        try {
            const historyQuery = `
                INSERT INTO device_metrics (
                    device_id, property_id, cpu_usage, memory_usage,
                    battery_level, storage_available, storage_total,
                    temperature, timestamp
                ) 
                SELECT 
                    $1, property_id, $2, $3, $4, $5, $6, $7, NOW()
                FROM devices
                WHERE id = $1
            `;
            
            await pool.query(historyQuery, [
                deviceId,
                cpu_usage,
                memory_usage,
                battery_level,
                storage_available,
                storage_total,
                temperature
            ]);
        } catch (err) {
            // Table might not exist yet
            console.log('Metrics history table not available');
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error recording device metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record device metrics'
        });
    }
};