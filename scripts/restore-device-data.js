import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function restoreDeviceData() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  console.log('Using connection string:', connectionString.replace(/:[^:@]+@/, ':***@'));
  
  // Force SSL handling for Vercel/Supabase
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.com') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('📱 Restoring device data...');
    
    // First check if devices table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'devices'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating devices table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS devices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
          device_name VARCHAR(255) NOT NULL,
          device_type VARCHAR(50),
          mac_address VARCHAR(17),
          ip_address VARCHAR(45),
          last_seen TIMESTAMP,
          software_version VARCHAR(50),
          is_online BOOLEAN DEFAULT false,
          settings JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          identifier VARCHAR(255),
          serial_number VARCHAR(255),
          model VARCHAR(255),
          os_version VARCHAR(50),
          app_version VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          is_primary BOOLEAN DEFAULT false,
          metadata JSONB,
          push_token TEXT,
          last_connected TIMESTAMP,
          last_ip_address VARCHAR(45),
          supervised BOOLEAN DEFAULT false,
          enrollment_status VARCHAR(50),
          enrollment_date TIMESTAMP,
          provisional_period_end TIMESTAMP,
          mdm_profile_uuid VARCHAR(255),
          configuration_profiles JSONB,
          kiosk_mode_enabled BOOLEAN DEFAULT false,
          kiosk_mode_config JSONB,
          allowed_apps JSONB,
          restrictions JSONB,
          last_command_sent TIMESTAMP,
          last_command_status VARCHAR(50),
          pending_commands JSONB,
          command_history JSONB,
          room_number VARCHAR(50),
          device_status VARCHAR(50),
          last_heartbeat TIMESTAMP,
          battery_level INTEGER,
          storage_available BIGINT,
          storage_total BIGINT
        );
      `);
      
      console.log('✅ Devices table created');
    }
    
    // Check if the property exists (Chalet 20)
    const propertyCheck = await pool.query(
      `SELECT id, name FROM properties WHERE id = '41059600-402d-434e-9b34-2b4821f6e3a4'`
    );
    
    let propertyId = '41059600-402d-434e-9b34-2b4821f6e3a4';
    
    if (propertyCheck.rows.length === 0) {
      console.log('Property not found, creating Chalet 20...');
      
      // Create the property if it doesn't exist
      const propertyResult = await pool.query(`
        INSERT INTO properties (
          id, name, address, wifi_ssid, wifi_password, welcome_message
        ) VALUES (
          '41059600-402d-434e-9b34-2b4821f6e3a4',
          'Chalet 20',
          'Schladming, Austria',
          'Chalet20_WiFi',
          'Welcome2024',
          'Welcome to Chalet 20! Enjoy your stay.'
        )
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name
        RETURNING id;
      `);
      
      console.log('✅ Property created/updated');
    }
    
    // Check if device already exists
    const deviceCheck = await pool.query(
      `SELECT id FROM devices WHERE id = '9f724aaa-295f-4736-b38a-a226441279ff'`
    );
    
    if (deviceCheck.rows.length > 0) {
      console.log('Device already exists, updating...');
    }
    
    // Insert or update the device
    const result = await pool.query(`
      INSERT INTO devices (
        id, property_id, device_name, device_type, mac_address, ip_address,
        last_seen, software_version, is_online, settings, created_at, updated_at,
        identifier, serial_number, model, os_version, app_version, is_active,
        is_primary, metadata, push_token, last_connected, last_ip_address,
        supervised, enrollment_status, enrollment_date, provisional_period_end,
        mdm_profile_uuid, configuration_profiles, kiosk_mode_enabled,
        kiosk_mode_config, allowed_apps, restrictions, last_command_sent,
        last_command_status, pending_commands, command_history, room_number,
        device_status, last_heartbeat, battery_level, storage_available, storage_total
      ) VALUES (
        '9f724aaa-295f-4736-b38a-a226441279ff',
        '41059600-402d-434e-9b34-2b4821f6e3a4',
        'Living Room Apple TV',
        'apple_tv',
        NULL,
        NULL,
        '2025-08-19 10:31:53.972217+00',
        NULL,
        false,
        NULL,
        '2025-08-19 10:31:53.972217+00',
        '2025-08-19 11:48:37.250148+00',
        '00008110-000439023C63801E',
        'MW1R9ND9G1',
        'Apple TV 4K (3rd generation)',
        NULL,
        NULL,
        true,
        true,
        '{"hdr": true, "storage": "128GB", "generation": "3rd", "resolution": "4K"}'::jsonb,
        NULL,
        NULL,
        NULL,
        false,
        'enrolled',
        '2025-08-19 10:52:12.959495',
        '2025-09-18 10:52:12.959495',
        NULL,
        '[]'::jsonb,
        true,
        '{"mode": "autonomous", "enabled": true, "autoReturn": true, "returnTimeout": 1800}'::jsonb,
        '[{"name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix"}, {"name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube"}, {"name": "Spotify", "enabled": true, "bundleId": "com.spotify.client"}]'::jsonb,
        '{"disableAirPlay": false, "disableAutoLock": true, "disableAppRemoval": true}'::jsonb,
        '2025-08-19 11:48:37.250148',
        'EnableKioskMode',
        '[]'::jsonb,
        '[]'::jsonb,
        'Living Room',
        'online',
        NULL,
        NULL,
        NULL,
        NULL
      )
      ON CONFLICT (id) DO UPDATE SET
        device_name = EXCLUDED.device_name,
        device_type = EXCLUDED.device_type,
        identifier = EXCLUDED.identifier,
        serial_number = EXCLUDED.serial_number,
        model = EXCLUDED.model,
        metadata = EXCLUDED.metadata,
        kiosk_mode_enabled = EXCLUDED.kiosk_mode_enabled,
        kiosk_mode_config = EXCLUDED.kiosk_mode_config,
        allowed_apps = EXCLUDED.allowed_apps,
        restrictions = EXCLUDED.restrictions,
        room_number = EXCLUDED.room_number,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, device_name;
    `);
    
    console.log('✅ Device restored successfully:', result.rows[0]);
    
    // Verify the device was added
    const verification = await pool.query(`
      SELECT d.*, p.name as property_name 
      FROM devices d
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE d.id = '9f724aaa-295f-4736-b38a-a226441279ff'
    `);
    
    if (verification.rows.length > 0) {
      const device = verification.rows[0];
      console.log('\n📱 Device Details:');
      console.log(`  Name: ${device.device_name}`);
      console.log(`  Type: ${device.device_type}`);
      console.log(`  Model: ${device.model}`);
      console.log(`  Property: ${device.property_name}`);
      console.log(`  Room: ${device.room_number}`);
      console.log(`  Kiosk Mode: ${device.kiosk_mode_enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`  Status: ${device.device_status}`);
    }
    
    console.log('\n✨ Device data restoration complete!');
    
  } catch (error) {
    console.error('❌ Error restoring device data:', error);
    console.error('Details:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the restoration
restoreDeviceData();