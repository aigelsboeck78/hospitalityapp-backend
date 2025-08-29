import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function setupMDMProduction() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  console.log('🚀 Setting up MDM service for production...');
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, profile_name)
      );
    `);
    console.log('✅ mdm_profiles table ready');
    
    // Create mdm_alerts table with correct schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        metadata JSONB,
        is_resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ mdm_alerts table ready');
    
    // Create mdm_commands table for device management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_commands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        command_type VARCHAR(50) NOT NULL,
        command_data JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        executed_at TIMESTAMP,
        result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ mdm_commands table ready');
    
    // Create mdm_device_status table for real-time monitoring
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdm_device_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        battery_level INTEGER,
        storage_available BIGINT,
        storage_total BIGINT,
        network_status VARCHAR(50),
        current_app VARCHAR(255),
        screen_status VARCHAR(20),
        kiosk_mode_active BOOLEAN DEFAULT false,
        metadata JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ mdm_device_status table ready');
    
    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mdm_alerts_property_id 
        ON mdm_alerts(property_id) WHERE is_resolved = false;
      
      CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device_id 
        ON mdm_alerts(device_id);
      
      CREATE INDEX IF NOT EXISTS idx_mdm_commands_device_id 
        ON mdm_commands(device_id) WHERE status = 'pending';
      
      CREATE INDEX IF NOT EXISTS idx_mdm_device_status_device_id 
        ON mdm_device_status(device_id);
      
      CREATE INDEX IF NOT EXISTS idx_mdm_profiles_property_id 
        ON mdm_profiles(property_id) WHERE is_active = true;
    `);
    console.log('✅ Performance indexes created');
    
    // Create triggers for updated_at timestamps
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Apply triggers to tables with updated_at
    const tablesWithUpdatedAt = ['mdm_profiles', 'mdm_commands', 'mdm_device_status'];
    for (const table of tablesWithUpdatedAt) {
      await pool.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log('✅ Update triggers configured');
    
    // Verify table structure
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('mdm_profiles', 'mdm_alerts', 'mdm_commands', 'mdm_device_status')
      ORDER BY table_name;
    `);
    
    console.log('\n📊 MDM Service Status:');
    console.log('─────────────────────');
    for (const table of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`  ✓ ${table.table_name}: ${count.rows[0].count} records`);
    }
    
    console.log('\n✨ MDM service is ready for production!');
    console.log('   No sample data was added.');
    console.log('   All tables and indexes are configured.');
    
  } catch (error) {
    console.error('❌ Error setting up MDM service:', error);
    console.error('Details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupMDMProduction();