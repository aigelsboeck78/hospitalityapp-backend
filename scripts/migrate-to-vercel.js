#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' }); // For Vercel env vars pulled locally

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  // For migrations, use the non-pooling connection
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || 
                          process.env.POSTGRES_URL || 
                          process.env.DATABASE_URL ||
                          `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DATABASE}?sslmode=require`;

  if (!connectionString || connectionString.includes('undefined')) {
    log('❌ No valid database connection found!', 'red');
    log('Please ensure you have run: vercel env pull .env.local', 'yellow');
    process.exit(1);
  }

  log(`📝 Using connection: ${connectionString.split('@')[1]?.split('?')[0] || 'unknown'}`, 'cyan');
    
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : {
      rejectUnauthorized: false,
      // For Supabase connections
      require: true
    }
  });

  try {
    log('🔌 Connecting to Vercel Postgres...', 'cyan');
    await client.connect();
    
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    log(`✅ Connected to database: ${result.rows[0].db}`, 'green');
    log(`📅 Server time: ${result.rows[0].time}`, 'green');
    
    return client;
  } catch (error) {
    log(`❌ Connection failed: ${error.message}`, 'red');
    throw error;
  }
}

async function checkExistingData(client) {
  try {
    const tables = [
      'properties',
      'guests', 
      'activities',
      'streaming_services',
      'shop_products',
      'events',
      'dining_places',
      'background_images',
      'property_devices'
    ];
    
    log('\n📊 Checking existing data...', 'cyan');
    
    for (const table of tables) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          log(`  • ${table}: ${count} records`, 'yellow');
        }
      } catch (err) {
        // Table might not exist yet
        log(`  • ${table}: not found (will be created)`, 'cyan');
      }
    }
  } catch (error) {
    log('Note: Some tables do not exist yet', 'yellow');
  }
}

async function migrateData(client, backupFile) {
  try {
    log(`\n📦 Reading backup file: ${backupFile}`, 'cyan');
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    log(`📄 Backup file size: ${(sqlContent.length / 1024).toFixed(2)} KB`, 'green');
    
    // Split SQL content into individual statements
    // Handle statements that might contain semicolons in strings
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const prevChar = i > 0 ? sqlContent[i - 1] : '';
      
      // Track if we're inside a string
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      }
      
      currentStatement += char;
      
      // If we hit a semicolon and we're not in a string, it's the end of a statement
      if (char === ';' && !inString) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    log(`\n🔄 Processing ${statements.length} SQL statements...`, 'cyan');
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      
      // Skip certain statements that might cause issues
      if (statement.includes('CREATE EXTENSION') || 
          statement.includes('COMMENT ON') ||
          statement.includes('pg_catalog') ||
          statement.includes('DROP EXTENSION')) {
        skipCount++;
        continue;
      }
      
      try {
        await client.query(statement);
        successCount++;
        
        // Show progress every 10 statements
        if (successCount % 10 === 0) {
          log(`  ✓ Progress: ${successCount}/${statements.length}`, 'green');
        }
      } catch (error) {
        // Handle specific errors gracefully
        if (error.message.includes('already exists')) {
          skipCount++;
        } else if (error.message.includes('does not exist') && statement.includes('DROP')) {
          skipCount++;
        } else {
          errorCount++;
          log(`  ✗ Error on statement ${i}: ${preview}...`, 'red');
          log(`    ${error.message}`, 'red');
        }
      }
    }
    
    log(`\n📈 Migration Summary:`, 'bright');
    log(`  ✅ Successful: ${successCount}`, 'green');
    log(`  ⏭️  Skipped: ${skipCount}`, 'yellow');
    log(`  ❌ Errors: ${errorCount}`, 'red');
    
    return { successCount, skipCount, errorCount };
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    throw error;
  }
}

async function verifyMigration(client) {
  try {
    log('\n🔍 Verifying migration...', 'cyan');
    
    const checks = [
      { table: 'properties', critical: true },
      { table: 'guests', critical: false },
      { table: 'activities', critical: false },
      { table: 'streaming_services', critical: false },
      { table: 'shop_products', critical: false },
      { table: 'events', critical: false },
      { table: 'dining_places', critical: false },
      { table: 'background_images', critical: false },
      { table: 'property_devices', critical: false }
    ];
    
    let allGood = true;
    
    for (const check of checks) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM ${check.table}`
        );
        const count = parseInt(result.rows[0].count);
        log(`  ✅ ${check.table}: ${count} records`, 'green');
      } catch (error) {
        if (check.critical) {
          log(`  ❌ ${check.table}: FAILED (critical table)`, 'red');
          allGood = false;
        } else {
          log(`  ⚠️  ${check.table}: not found (optional)`, 'yellow');
        }
      }
    }
    
    return allGood;
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 Vercel Postgres Migration Tool', 'bright');
  log('=' .repeat(50), 'cyan');
  
  let client;
  
  try {
    // Step 1: Test connection
    client = await testConnection();
    
    // Step 2: Check existing data
    await checkExistingData(client);
    
    // Step 3: Find the latest backup file
    const backupFiles = fs.readdirSync(path.join(__dirname, '..'))
      .filter(f => f.startsWith('backup_migration_') && f.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (backupFiles.length === 0) {
      throw new Error('No backup files found. Please run the export first.');
    }
    
    const latestBackup = path.join(__dirname, '..', backupFiles[0]);
    log(`\n📁 Using backup file: ${backupFiles[0]}`, 'cyan');
    
    // Step 4: Confirm before proceeding
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question(
        `\n⚠️  This will import data to Vercel Postgres. Continue? (yes/no): `,
        resolve
      );
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      log('\n❌ Migration cancelled by user', 'yellow');
      process.exit(0);
    }
    
    // Step 5: Run migration
    const results = await migrateData(client, latestBackup);
    
    // Step 6: Verify migration
    const verified = await verifyMigration(client);
    
    if (verified && results.errorCount === 0) {
      log('\n✨ Migration completed successfully!', 'green');
    } else if (results.successCount > 0) {
      log('\n⚠️  Migration completed with some issues', 'yellow');
      log('Please review the errors above', 'yellow');
    } else {
      log('\n❌ Migration failed', 'red');
    }
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      log('\n🔌 Database connection closed', 'cyan');
    }
  }
}

// Run the migration
main();