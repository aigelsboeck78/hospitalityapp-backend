import pool from '../config/database.js';

class MDMCommand {
    constructor(data) {
        this.id = data.id;
        this.device_id = data.device_id;
        this.property_id = data.property_id;
        this.command_type = data.command_type;
        this.command_payload = data.command_payload;
        this.status = data.status;
        this.priority = data.priority;
        this.created_at = data.created_at;
        this.sent_at = data.sent_at;
        this.acknowledged_at = data.acknowledged_at;
        this.completed_at = data.completed_at;
        this.error_message = data.error_message;
        this.retry_count = data.retry_count;
        this.max_retries = data.max_retries;
    }

    static async create(commandData) {
        const result = await pool.query(`
            INSERT INTO mdm_commands (
                device_id, property_id, command_type, command_payload,
                status, priority, max_retries
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            commandData.device_id,
            commandData.property_id,
            commandData.command_type,
            commandData.command_payload || {},
            commandData.status || 'pending',
            commandData.priority || 0,
            commandData.max_retries || 3
        ]);
        return new MDMCommand(result.rows[0]);
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM mdm_commands WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async findByDevice(deviceId, status = null) {
        let query = 'SELECT * FROM mdm_commands WHERE device_id = $1';
        const params = [deviceId];
        
        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }
        
        query += ' ORDER BY priority DESC, created_at ASC';
        
        const result = await pool.query(query, params);
        return result.rows.map(row => new MDMCommand(row));
    }

    static async getNextPendingCommand(deviceId) {
        const result = await pool.query(`
            SELECT * FROM mdm_commands 
            WHERE device_id = $1 
            AND status = 'pending'
            AND retry_count < max_retries
            ORDER BY priority DESC, created_at ASC
            LIMIT 1
        `, [deviceId]);
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async getPendingCommands(limit = 100) {
        const result = await pool.query(`
            SELECT * FROM mdm_commands 
            WHERE status = 'pending'
            AND retry_count < max_retries
            ORDER BY priority DESC, created_at ASC
            LIMIT $1
        `, [limit]);
        return result.rows.map(row => new MDMCommand(row));
    }

    static async markAsSent(commandId) {
        const result = await pool.query(`
            UPDATE mdm_commands SET
                status = 'sent',
                sent_at = CURRENT_TIMESTAMP,
                retry_count = retry_count + 1
            WHERE id = $1
            RETURNING *
        `, [commandId]);
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async markAsAcknowledged(commandId) {
        const result = await pool.query(`
            UPDATE mdm_commands SET
                status = 'acknowledged',
                acknowledged_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [commandId]);
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async markAsCompleted(commandId, resultData = null) {
        const result = await pool.query(`
            UPDATE mdm_commands SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                command_payload = jsonb_set(
                    COALESCE(command_payload, '{}'),
                    '{result}',
                    $2::jsonb
                )
            WHERE id = $1
            RETURNING *
        `, [commandId, JSON.stringify(resultData || {})]);
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async markAsFailed(commandId, errorMessage) {
        const result = await pool.query(`
            UPDATE mdm_commands SET
                status = CASE 
                    WHEN retry_count >= max_retries - 1 THEN 'failed'
                    ELSE 'pending'
                END,
                error_message = $2,
                retry_count = retry_count + 1
            WHERE id = $1
            RETURNING *
        `, [commandId, errorMessage]);
        return result.rows.length > 0 ? new MDMCommand(result.rows[0]) : null;
    }

    static async bulkCreate(commands) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const command of commands) {
                const result = await client.query(`
                    INSERT INTO mdm_commands (
                        device_id, property_id, command_type, command_payload,
                        status, priority, max_retries
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                `, [
                    command.device_id,
                    command.property_id,
                    command.command_type,
                    command.command_payload || {},
                    command.status || 'pending',
                    command.priority || 0,
                    command.max_retries || 3
                ]);
                results.push(new MDMCommand(result.rows[0]));
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async cancelPendingCommands(deviceId, commandType = null) {
        let query = `
            UPDATE mdm_commands SET
                status = 'cancelled',
                error_message = 'Cancelled by system'
            WHERE device_id = $1 
            AND status = 'pending'
        `;
        const params = [deviceId];
        
        if (commandType) {
            query += ' AND command_type = $2';
            params.push(commandType);
        }
        
        query += ' RETURNING *';
        
        const result = await pool.query(query, params);
        return result.rows.map(row => new MDMCommand(row));
    }

    static async getCommandHistory(deviceId, limit = 50) {
        const result = await pool.query(`
            SELECT * FROM mdm_commands 
            WHERE device_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `, [deviceId, limit]);
        return result.rows.map(row => new MDMCommand(row));
    }

    static async getFailedCommands(propertyId = null) {
        let query = `
            SELECT * FROM mdm_commands 
            WHERE status = 'failed'
        `;
        const params = [];
        
        if (propertyId) {
            query += ' AND property_id = $1';
            params.push(propertyId);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        return result.rows.map(row => new MDMCommand(row));
    }

    static async cleanupOldCommands(daysToKeep = 30) {
        const result = await pool.query(`
            DELETE FROM mdm_commands 
            WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '%s days'
            AND status IN ('completed', 'failed', 'cancelled')
            RETURNING *
        `, [daysToKeep]);
        return result.rows.length;
    }
}

// Command types enum
MDMCommand.CommandTypes = {
    RESTART_DEVICE: 'RestartDevice',
    ENABLE_KIOSK_MODE: 'EnableKioskMode',
    DISABLE_KIOSK_MODE: 'DisableKioskMode',
    INSTALL_PROFILE: 'InstallProfile',
    REMOVE_PROFILE: 'RemoveProfile',
    UPDATE_ALLOWED_APPS: 'UpdateAllowedApps',
    UPDATE_RESTRICTIONS: 'UpdateRestrictions',
    CLEAR_PASSCODE: 'ClearPasscode',
    LOCK_DEVICE: 'LockDevice',
    UNLOCK_DEVICE: 'UnlockDevice',
    DEVICE_INFORMATION: 'DeviceInformation',
    INSTALL_APP: 'InstallApp',
    REMOVE_APP: 'RemoveApp',
    UPDATE_SETTINGS: 'UpdateSettings',
    SEND_MESSAGE: 'SendMessage',
    TAKE_SCREENSHOT: 'TakeScreenshot',
    ENABLE_LOST_MODE: 'EnableLostMode',
    DISABLE_LOST_MODE: 'DisableLostMode',
    PLAY_SOUND: 'PlaySound',
    REFRESH_STATUS: 'RefreshStatus'
};

export default MDMCommand;