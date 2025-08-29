import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function verifyMDMProduction() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  console.log('🔍 MDM Production Readiness Verification');
  console.log('═'.repeat(60));
  
  // Force SSL handling for Vercel/Supabase
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.com') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });

  let score = 0;
  let maxScore = 0;
  const issues = [];
  const warnings = [];

  try {
    console.log('\n📋 Checking MDM Infrastructure...\n');
    
    // 1. Check database tables
    console.log('1. Database Tables:');
    const requiredTables = ['devices', 'mdm_profiles', 'mdm_alerts', 'mdm_commands', 'mdm_device_status'];
    for (const table of requiredTables) {
      maxScore++;
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`   ✅ ${table} exists`);
        score++;
      } else {
        console.log(`   ❌ ${table} missing`);
        issues.push(`Missing table: ${table}`);
      }
    }
    
    // 2. Check real device connections
    console.log('\n2. Device Connections:');
    maxScore++;
    const devices = await pool.query(`
      SELECT id, device_name, identifier, device_status, last_heartbeat, enrollment_status
      FROM devices
    `);
    
    const realDevices = devices.rows.filter(d => 
      d.identifier && 
      d.identifier !== '00008110-000439023C63801E' && // Known mock ID
      d.identifier !== 'mock-device-id'
    );
    
    if (realDevices.length > 0) {
      console.log(`   ✅ ${realDevices.length} real device(s) registered`);
      score++;
      
      // Check if any are actually online
      const onlineDevices = realDevices.filter(d => {
        if (!d.last_heartbeat) return false;
        const lastSeen = new Date(d.last_heartbeat);
        const minutesAgo = (new Date() - lastSeen) / 1000 / 60;
        return minutesAgo < 10; // Online if heartbeat within 10 minutes
      });
      
      if (onlineDevices.length > 0) {
        console.log(`   ✅ ${onlineDevices.length} device(s) currently online`);
        score++;
        maxScore++;
      } else {
        console.log(`   ⚠️  No devices currently online`);
        warnings.push('No devices have sent heartbeats recently');
      }
    } else {
      console.log(`   ❌ No real devices found (only mock/test devices)`);
      issues.push('No real Apple TV devices are registered');
    }
    
    // 3. Check MDM protocol implementation
    console.log('\n3. MDM Protocol Implementation:');
    maxScore += 5;
    
    // Check for Apple certificates
    const hasCertificate = false; // Would need to check file system or env vars
    if (hasCertificate) {
      console.log(`   ✅ Apple MDM certificate configured`);
      score++;
    } else {
      console.log(`   ❌ No Apple MDM certificate found`);
      issues.push('Apple MDM certificate not configured');
    }
    
    // Check for push notification service
    const hasPushService = false; // Would need actual APNS credentials
    if (hasPushService) {
      console.log(`   ✅ Apple Push Notification Service configured`);
      score++;
    } else {
      console.log(`   ❌ APNS not configured`);
      issues.push('Apple Push Notification Service not configured');
    }
    
    // Check for device enrollment
    const hasEnrollment = devices.rows.some(d => d.enrollment_status === 'enrolled');
    if (hasEnrollment) {
      console.log(`   ⚠️  Device enrollment status found (but may be mocked)`);
      warnings.push('Device enrollment status exists but may not be genuine');
    } else {
      console.log(`   ❌ No enrolled devices`);
      issues.push('No devices have completed enrollment');
    }
    
    // Check for MDM server endpoint
    console.log(`   ❌ MDM server endpoint not implemented`);
    issues.push('No MDM protocol server endpoint');
    
    // Check for command queue processing
    console.log(`   ❌ Command queue processing not active`);
    issues.push('MDM command processing not running');
    
    // 4. Check recent activity
    console.log('\n4. Recent Activity:');
    maxScore += 2;
    
    const recentCommands = await pool.query(`
      SELECT COUNT(*) as count 
      FROM mdm_commands 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    
    if (recentCommands.rows[0].count > 0) {
      console.log(`   ✅ ${recentCommands.rows[0].count} command(s) in last 7 days`);
      score++;
    } else {
      console.log(`   ⚠️  No commands sent in last 7 days`);
      warnings.push('No MDM commands have been sent recently');
    }
    
    const recentAlerts = await pool.query(`
      SELECT COUNT(*) as count 
      FROM mdm_alerts 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    
    if (recentAlerts.rows[0].count > 0) {
      console.log(`   ✅ ${recentAlerts.rows[0].count} alert(s) in last 7 days`);
      score++;
    } else {
      console.log(`   ⚠️  No alerts in last 7 days`);
    }
    
    // 5. Check API endpoints
    console.log('\n5. API Endpoints:');
    maxScore += 3;
    
    // These would need to be tested via HTTP requests in production
    const endpoints = [
      { path: '/api/mdm/devices', method: 'GET', status: 'not_implemented' },
      { path: '/api/mdm/commands', method: 'POST', status: 'not_implemented' },
      { path: '/api/mdm/heartbeat', method: 'POST', status: 'not_implemented' }
    ];
    
    for (const endpoint of endpoints) {
      if (endpoint.status === 'implemented') {
        console.log(`   ✅ ${endpoint.method} ${endpoint.path}`);
        score++;
      } else {
        console.log(`   ❌ ${endpoint.method} ${endpoint.path} not implemented`);
        issues.push(`Missing endpoint: ${endpoint.method} ${endpoint.path}`);
      }
    }
    
    // Final Report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 MDM PRODUCTION READINESS REPORT');
    console.log('═'.repeat(60));
    
    const percentage = Math.round((score / maxScore) * 100);
    console.log(`\nScore: ${score}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 80) {
      console.log('Status: ✅ PRODUCTION READY');
    } else if (percentage >= 50) {
      console.log('Status: ⚠️  PARTIALLY READY');
    } else {
      console.log('Status: ❌ NOT PRODUCTION READY');
    }
    
    if (issues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n💡 Requirements for Full Production MDM:');
    console.log('   1. Apple Developer Enterprise Account ($299/year)');
    console.log('   2. MDM Server Certificate from Apple');
    console.log('   3. Apple Push Notification Service (APNS) setup');
    console.log('   4. Device Enrollment Program (DEP) or manual enrollment');
    console.log('   5. MDM protocol server implementation');
    console.log('   6. Persistent WebSocket or polling for device communication');
    console.log('   7. Command queue processing service');
    console.log('   8. Device heartbeat monitoring');
    
    console.log('\n📌 Current Implementation:');
    console.log('   • Database schema: ✅ Ready');
    console.log('   • Mock devices: ✅ Available for testing');
    console.log('   • Real device connection: ❌ Not implemented');
    console.log('   • MDM protocol: ❌ Not implemented');
    console.log('   • Device control: ❌ Not available');
    console.log('   • Production deployment: ❌ Would require significant work');
    
    console.log('\n✨ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    console.error('Details:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the verification
verifyMDMProduction();
