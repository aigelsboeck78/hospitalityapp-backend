import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function initMDMTables() {
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
    console.log('📱 Creating MDM tables...');
    
    // Create mdm_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        profile_name VARCHAR(255) NOT NULL,
        profile_type VARCHAR(50),
        profile_data JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ mdm_profiles table created');
    
    // Create mdm_alerts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ mdm_alerts table created');
    
    // Create indexes for better performance
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_mdm_alerts_property_id ON mdm_alerts(property_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device_id ON mdm_alerts(device_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_mdm_alerts_resolved ON mdm_alerts(resolved);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_mdm_profiles_property_id ON mdm_profiles(property_id);');
    } catch (indexError) {
      console.log('Note: Some indexes may already exist or failed to create:', indexError.message);
    }
    console.log('✅ Indexes created');
    
    // Insert sample MDM data for testing
    const propertyId = '41059600-402d-434e-9b34-2b4821f6e3a4';
    const deviceId = '9f724aaa-295f-4736-b38a-a226441279ff';
    
    // Check if sample profile exists
    const profileCheck = await pool.query(
      'SELECT id FROM mdm_profiles WHERE property_id = $1 AND profile_name = $2',
      [propertyId, 'Kiosk Mode Profile']
    );
    
    if (profileCheck.rows.length === 0) {
      // Insert sample MDM profile
      await pool.query(`
        INSERT INTO mdm_profiles (property_id, profile_name, profile_type, profile_data, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        propertyId,
        'Kiosk Mode Profile',
        'configuration',
        JSON.stringify({
          kioskMode: {
            enabled: true,
            autoReturn: true,
            returnTimeout: 1800,
            allowedApps: ['com.netflix.Netflix', 'com.google.ios.youtube', 'com.spotify.client']
          },
          restrictions: {
            disableAirPlay: false,
            disableAutoLock: true,
            disableAppRemoval: true
          }
        }),
        true
      ]);
      console.log('✅ Sample MDM profile created');
    }
    
    // Check if sample alerts exist
    const alertCheck = await pool.query(
      'SELECT COUNT(*) as count FROM mdm_alerts WHERE property_id = $1',
      [propertyId]
    );
    
    if (parseInt(alertCheck.rows[0].count) === 0) {
      // Insert sample MDM alerts
      await pool.query(`
        INSERT INTO mdm_alerts (property_id, device_id, alert_type, severity, title, message, resolved)
        VALUES 
        ($1, $2, 'device_offline', 'warning', 'Device Offline', 'Living Room Apple TV has been offline for more than 30 minutes', false),
        ($1, $2, 'app_crash', 'error', 'App Crash Detected', 'Netflix app crashed 3 times in the last hour', false),
        ($1, $2, 'profile_update', 'info', 'Profile Updated', 'Kiosk Mode Profile was successfully applied', true)
      `, [propertyId, deviceId]);
      console.log('✅ Sample MDM alerts created');
    }
    
    // Verify the data
    const profiles = await pool.query('SELECT COUNT(*) as count FROM mdm_profiles');
    const alerts = await pool.query('SELECT COUNT(*) as count FROM mdm_alerts');
    
    console.log(`\n📊 MDM Data Summary:`);
    console.log(`  MDM Profiles: ${profiles.rows[0].count}`);
    console.log(`  MDM Alerts: ${alerts.rows[0].count}`);
    
    console.log('\n✨ MDM tables initialization complete!');
    
  } catch (error) {
    console.error('❌ Error creating MDM tables:', error);
    console.error('Details:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initMDMTables();