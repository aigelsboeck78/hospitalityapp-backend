import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function checkMDMStatus() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  console.log('🔍 Checking MDM Device Status...');
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
    // Get all devices
    const devices = await pool.query(`
      SELECT 
        id, 
        device_name, 
        device_type,
        device_status,
        last_heartbeat,
        last_seen,
        is_online,
        enrollment_status,
        property_id,
        identifier,
        serial_number
      FROM devices 
      ORDER BY device_name
    `);
    
    console.log(`\n📱 Found ${devices.rows.length} device(s) in database\n`);
    
    for (const device of devices.rows) {
      console.log('─'.repeat(50));
      console.log(`Device: ${device.device_name || 'Unknown'}`);
      console.log(`  ID: ${device.id}`);
      console.log(`  Type: ${device.device_type || 'unknown'}`);
      console.log(`  Status: ${device.device_status || 'unknown'}`);
      console.log(`  Online Flag: ${device.is_online}`);
      console.log(`  Enrollment: ${device.enrollment_status || 'not enrolled'}`);
      console.log(`  Identifier: ${device.identifier || 'none'}`);
      console.log(`  Serial: ${device.serial_number || 'none'}`);
      
      // Check last activity
      const lastHeartbeat = device.last_heartbeat ? new Date(device.last_heartbeat) : null;
      const lastSeen = device.last_seen ? new Date(device.last_seen) : null;
      const now = new Date();
      
      if (lastHeartbeat) {
        const minutesAgo = Math.floor((now - lastHeartbeat) / 1000 / 60);
        console.log(`  Last Heartbeat: ${lastHeartbeat.toISOString()} (${minutesAgo} minutes ago)`);
      } else {
        console.log(`  Last Heartbeat: Never`);
      }
      
      if (lastSeen) {
        const hoursAgo = Math.floor((now - lastSeen) / 1000 / 60 / 60);
        console.log(`  Last Seen: ${lastSeen.toISOString()} (${hoursAgo} hours ago)`);
      } else {
        console.log(`  Last Seen: Never`);
      }
      
      // Determine real status
      let realStatus = 'unknown';
      let statusReason = '';
      
      if (!device.identifier || device.identifier === '00008110-000439023C63801E') {
        // This is a mock/test device
        realStatus = 'mock';
        statusReason = 'This is a test device entry - not a real device';
      } else if (!lastHeartbeat && !lastSeen) {
        realStatus = 'never_connected';
        statusReason = 'Device has never connected to MDM service';
      } else if (lastHeartbeat && (now - lastHeartbeat) < 5 * 60 * 1000) {
        realStatus = 'online';
        statusReason = 'Device sent heartbeat within last 5 minutes';
      } else if (lastHeartbeat && (now - lastHeartbeat) < 30 * 60 * 1000) {
        realStatus = 'idle';
        statusReason = 'Device inactive for less than 30 minutes';
      } else {
        realStatus = 'offline';
        const timeSince = lastHeartbeat || lastSeen;
        const hours = Math.floor((now - timeSince) / 1000 / 60 / 60);
        statusReason = `Device offline for ${hours} hours`;
      }
      
      console.log(`\n  ⚠️  REAL STATUS: ${realStatus.toUpperCase()}`);
      console.log(`  📝 Reason: ${statusReason}`);
      
      // Check if status needs updating
      if (device.device_status !== realStatus) {
        console.log(`  🔄 Updating status from '${device.device_status}' to '${realStatus}'`);
        await pool.query(
          'UPDATE devices SET device_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [realStatus, device.id]
        );
      }
    }
    
    // Check MDM alerts
    const alerts = await pool.query(`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN is_resolved = false THEN 1 END) as unresolved
      FROM mdm_alerts
    `);
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 MDM Service Summary:');
    console.log(`  Total Devices: ${devices.rows.length}`);
    console.log(`  Mock/Test Devices: ${devices.rows.filter(d => d.identifier === '00008110-000439023C63801E').length}`);
    console.log(`  Total Alerts: ${alerts.rows[0].count}`);
    console.log(`  Unresolved Alerts: ${alerts.rows[0].unresolved}`);
    
    // Reality check
    console.log('\n⚠️  IMPORTANT: MDM Service Reality Check');
    console.log('─'.repeat(50));
    console.log('  ❌ No real Apple TV devices are connected');
    console.log('  ❌ No actual MDM protocol implementation exists');
    console.log('  ❌ Device statuses are simulated/mocked');
    console.log('  ❌ No heartbeat mechanism is implemented');
    console.log('\n  💡 To connect real devices, you would need:');
    console.log('     1. Apple Developer Enterprise account');
    console.log('     2. MDM server certificate from Apple');
    console.log('     3. Device enrollment program');
    console.log('     4. Implementation of Apple MDM protocol');
    console.log('     5. Push notification infrastructure');
    
    console.log('\n✨ Status check complete!');
    
  } catch (error) {
    console.error('❌ Error checking MDM status:', error);
    console.error('Details:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
checkMDMStatus();