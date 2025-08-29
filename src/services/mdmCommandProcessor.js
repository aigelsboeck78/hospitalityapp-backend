import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

class MDMCommandProcessor {
  constructor() {
    this.isRunning = false;
    this.processingInterval = null;
    this.pool = null;
  }

  createPool() {
    const connectionString = process.env.POSTGRES_PRISMA_URL || 
                             process.env.POSTGRES_URL || 
                             process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('No database connection string found');
    }

    // Force SSL handling for Vercel/Supabase
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    
    return new Pool({
      connectionString,
      ssl: connectionString.includes('supabase.com') || process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
    });
  }

  async start(intervalMs = 5000) {
    if (this.isRunning) {
      console.log('MDM Command Processor already running');
      return;
    }

    console.log('Starting MDM Command Processor...');
    this.isRunning = true;
    this.pool = this.createPool();

    // Process commands immediately
    await this.processCommands();

    // Set up interval for continuous processing
    this.processingInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.processCommands();
      }
    }, intervalMs);

    console.log(`MDM Command Processor started (interval: ${intervalMs}ms)`);
  }

  async stop() {
    if (!this.isRunning) {
      console.log('MDM Command Processor not running');
      return;
    }

    console.log('Stopping MDM Command Processor...');
    this.isRunning = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    console.log('MDM Command Processor stopped');
  }

  async processCommands() {
    if (!this.isRunning || !this.pool) return;

    try {
      // Get pending commands
      const pendingCommands = await this.pool.query(`
        SELECT 
          c.*,
          d.identifier,
          d.device_status,
          d.last_heartbeat
        FROM mdm_commands c
        JOIN devices d ON c.device_id = d.id
        WHERE c.status = 'pending'
        ORDER BY c.created_at ASC
        LIMIT 10
      `);

      if (pendingCommands.rows.length > 0) {
        console.log(`Processing ${pendingCommands.rows.length} pending command(s)`);
      }

      for (const command of pendingCommands.rows) {
        await this.executeCommand(command);
      }

      // Clean up old completed/failed commands (older than 7 days)
      await this.pool.query(`
        DELETE FROM mdm_commands
        WHERE status IN ('completed', 'failed')
        AND created_at < NOW() - INTERVAL '7 days'
      `);

    } catch (error) {
      console.error('Error processing MDM commands:', error);
    }
  }

  async executeCommand(command) {
    try {
      // Check if device is online
      const lastHeartbeat = command.last_heartbeat ? new Date(command.last_heartbeat) : null;
      const minutesSinceHeartbeat = lastHeartbeat ? 
        (new Date() - lastHeartbeat) / 1000 / 60 : null;
      
      const isOnline = minutesSinceHeartbeat !== null && minutesSinceHeartbeat < 5;

      if (!isOnline) {
        console.log(`Device ${command.identifier} is offline, skipping command ${command.id}`);
        return;
      }

      // Mark command as sent
      await this.pool.query(`
        UPDATE mdm_commands 
        SET status = 'sent', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [command.id]);

      console.log(`Command ${command.id} sent to device ${command.identifier}`);

      // Simulate command execution based on type
      await this.simulateCommandExecution(command);

    } catch (error) {
      console.error(`Error executing command ${command.id}:`, error);
      
      // Mark command as failed
      await this.pool.query(`
        UPDATE mdm_commands 
        SET 
          status = 'failed',
          result = $2,
          executed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [command.id, { error: error.message }]);
    }
  }

  async simulateCommandExecution(command) {
    // In production, this would send actual commands to devices
    // For now, we simulate different command types
    
    const simulationDelay = 2000 + Math.random() * 3000; // 2-5 seconds
    
    setTimeout(async () => {
      try {
        let result = {};
        let status = 'completed';

        switch (command.command_type) {
          case 'restart_device':
            result = { message: 'Device restart initiated', timestamp: new Date() };
            break;
            
          case 'enable_kiosk_mode':
            result = { 
              message: 'Kiosk mode enabled',
              config: command.command_data,
              timestamp: new Date()
            };
            break;
            
          case 'disable_kiosk_mode':
            result = { message: 'Kiosk mode disabled', timestamp: new Date() };
            break;
            
          case 'update_restrictions':
            result = {
              message: 'Restrictions updated',
              restrictions: command.command_data,
              timestamp: new Date()
            };
            break;
            
          case 'device_information':
            result = {
              device_info: {
                model: 'Apple TV 4K (3rd generation)',
                os_version: 'tvOS 17.4',
                serial_number: 'MW1R9ND9G1',
                storage_available: 98304000000,
                storage_total: 128000000000,
                battery_level: null,
                network_status: 'wifi_connected'
              },
              timestamp: new Date()
            };
            break;
            
          case 'clear_passcode':
            result = { message: 'Passcode cleared', timestamp: new Date() };
            break;
            
          case 'lock_device':
            result = { message: 'Device locked', timestamp: new Date() };
            break;
            
          case 'unlock_device':
            result = { message: 'Device unlocked', timestamp: new Date() };
            break;
            
          default:
            result = { 
              message: `Command ${command.command_type} executed`,
              timestamp: new Date()
            };
        }

        // Update command status
        await this.pool.query(`
          UPDATE mdm_commands 
          SET 
            status = $2,
            result = $3,
            executed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [command.id, status, result]);

        console.log(`Command ${command.id} completed successfully`);

      } catch (error) {
        console.error(`Error in simulated execution of command ${command.id}:`, error);
      }
    }, simulationDelay);
  }

  async getStatus() {
    const status = {
      isRunning: this.isRunning,
      poolConnected: this.pool !== null,
      processingInterval: this.processingInterval !== null
    };

    if (this.pool) {
      try {
        const stats = await this.pool.query(`
          SELECT 
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'sent') as sent,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
          FROM mdm_commands
          WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        
        status.commandStats = stats.rows[0];
      } catch (error) {
        status.error = error.message;
      }
    }

    return status;
  }
}

// Export singleton instance
const processor = new MDMCommandProcessor();
export default processor;

// If running directly, start the processor
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processor.start()
    .then(() => {
      console.log('MDM Command Processor running...');
      console.log('Press Ctrl+C to stop');
    })
    .catch(error => {
      console.error('Failed to start processor:', error);
      process.exit(1);
    });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await processor.stop();
    process.exit(0);
  });
}