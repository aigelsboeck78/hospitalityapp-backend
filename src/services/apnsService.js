import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

/**
 * Apple Push Notification Service (APNS) Integration
 * 
 * This service provides the infrastructure for APNS integration.
 * When you obtain your Apple Developer Enterprise account, you'll need to:
 * 
 * 1. Generate an APNS certificate from Apple Developer Portal
 * 2. Configure the certificate path and passphrase in environment variables
 * 3. Implement the actual push notification sending logic
 */
class APNSService {
  constructor() {
    this.isConfigured = false;
    this.certificatePath = null;
    this.keyPath = null;
    this.pool = null;
    
    this.checkConfiguration();
  }

  checkConfiguration() {
    // Check for APNS configuration in environment
    const certPath = process.env.APNS_CERT_PATH;
    const keyPath = process.env.APNS_KEY_PATH;
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const bundleId = process.env.APNS_BUNDLE_ID;

    if (certPath && fs.existsSync(certPath)) {
      this.certificatePath = certPath;
      console.log('✅ APNS certificate found');
    } else {
      console.log('⚠️  APNS certificate not configured');
    }

    if (keyPath && fs.existsSync(keyPath)) {
      this.keyPath = keyPath;
      console.log('✅ APNS key found');
    } else {
      console.log('⚠️  APNS key not configured');
    }

    this.keyId = keyId;
    this.teamId = teamId;
    this.bundleId = bundleId || 'com.chaletmoments.mdm';

    this.isConfigured = !!(this.certificatePath || (this.keyPath && this.keyId && this.teamId));
    
    if (this.isConfigured) {
      console.log('✅ APNS service is configured and ready');
    } else {
      console.log('❌ APNS service is not configured');
      console.log('   Required configuration:');
      console.log('   - APNS_CERT_PATH: Path to .p12 certificate');
      console.log('   - OR -');
      console.log('   - APNS_KEY_PATH: Path to .p8 key file');
      console.log('   - APNS_KEY_ID: Key ID from Apple Developer');
      console.log('   - APNS_TEAM_ID: Team ID from Apple Developer');
      console.log('   - APNS_BUNDLE_ID: Your app bundle identifier');
    }
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

  async sendPushNotification(deviceToken, payload) {
    if (!this.isConfigured) {
      console.warn('APNS not configured - simulating push notification');
      return this.simulatePushNotification(deviceToken, payload);
    }

    try {
      // TODO: Implement actual APNS push notification
      // This will use the Apple Push Notification service
      // Recommended library: node-apn or @parse/node-apn
      
      console.log('Sending push notification to device:', deviceToken);
      console.log('Payload:', payload);

      // Placeholder for actual implementation
      // const apn = require('apn');
      // const options = {
      //   token: {
      //     key: this.keyPath,
      //     keyId: this.keyId,
      //     teamId: this.teamId
      //   },
      //   production: process.env.NODE_ENV === 'production'
      // };
      // 
      // const apnProvider = new apn.Provider(options);
      // const note = new apn.Notification();
      // note.expiry = Math.floor(Date.now() / 1000) + 3600;
      // note.badge = payload.badge;
      // note.sound = "ping.aiff";
      // note.alert = payload.alert;
      // note.payload = payload.data;
      // note.topic = this.bundleId;
      // 
      // const result = await apnProvider.send(note, deviceToken);
      // apnProvider.shutdown();
      // 
      // return result;

      return {
        success: false,
        message: 'APNS implementation pending - requires Apple Developer account'
      };

    } catch (error) {
      console.error('APNS push notification error:', error);
      throw error;
    }
  }

  async simulatePushNotification(deviceToken, payload) {
    // Simulate push notification for development
    console.log('📱 Simulating push notification');
    console.log('   Device:', deviceToken);
    console.log('   Payload:', JSON.stringify(payload, null, 2));

    // Store simulated notification in database
    if (!this.pool) {
      this.pool = this.createPool();
    }

    try {
      await this.pool.query(`
        INSERT INTO mdm_push_notifications (
          device_token,
          payload,
          status,
          simulated,
          created_at
        ) VALUES ($1, $2, 'sent', true, CURRENT_TIMESTAMP)
      `, [deviceToken, payload]);

      return {
        success: true,
        simulated: true,
        message: 'Push notification simulated successfully'
      };
    } catch (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        await this.createPushNotificationTable();
        return {
          success: true,
          simulated: true,
          message: 'Push notification simulated (table created)'
        };
      }
      throw error;
    }
  }

  async createPushNotificationTable() {
    if (!this.pool) {
      this.pool = this.createPool();
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_push_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_token VARCHAR(255),
        payload JSONB,
        status VARCHAR(50),
        simulated BOOLEAN DEFAULT false,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP
      )
    `);
  }

  async sendMDMWakeup(deviceId) {
    // MDM wakeup is a special push notification that tells the device
    // to check in with the MDM server
    
    if (!this.pool) {
      this.pool = this.createPool();
    }

    try {
      // Get device push token
      const result = await this.pool.query(`
        SELECT push_token, identifier
        FROM devices
        WHERE id = $1
      `, [deviceId]);

      if (result.rows.length === 0) {
        throw new Error('Device not found');
      }

      const device = result.rows[0];
      
      if (!device.push_token) {
        console.warn(`Device ${device.identifier} has no push token`);
        return {
          success: false,
          message: 'Device has no push token registered'
        };
      }

      // Send MDM wakeup push
      const payload = {
        mdm: deviceId,
        // Magic string that tells the device to check in
        'mdm-push-magic': process.env.MDM_PUSH_MAGIC || 'check-in-now'
      };

      return await this.sendPushNotification(device.push_token, payload);

    } catch (error) {
      console.error('MDM wakeup error:', error);
      throw error;
    }
  }

  async registerDeviceToken(deviceId, pushToken) {
    if (!this.pool) {
      this.pool = this.createPool();
    }

    try {
      await this.pool.query(`
        UPDATE devices
        SET 
          push_token = $2,
          push_token_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [deviceId, pushToken]);

      console.log(`Push token registered for device ${deviceId}`);
      return { success: true };

    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      hasCertificate: !!this.certificatePath,
      hasKey: !!this.keyPath,
      keyId: this.keyId ? '***' + this.keyId.slice(-4) : null,
      teamId: this.teamId,
      bundleId: this.bundleId,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    };
  }

  async cleanup() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Export singleton instance
const apnsService = new APNSService();
export default apnsService;

// Add cleanup on process exit
process.on('beforeExit', async () => {
  await apnsService.cleanup();
});