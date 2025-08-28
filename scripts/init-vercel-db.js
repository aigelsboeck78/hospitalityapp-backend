import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  // Use POSTGRES_PRISMA_URL for Supabase with proper SSL handling
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                          process.env.POSTGRES_URL || 
                          process.env.DATABASE_URL || 
                          `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create tables from schema
    console.log('📦 Creating database schema...');
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons but preserve those within strings
      const statements = schema
        .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
        .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await client.query(statement);
            console.log(`✓ Executed: ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
          } catch (err) {
            console.error(`✗ Failed to execute: ${statement.substring(0, 50)}...`);
            console.error(err.message);
          }
        }
      }
    }

    // Run migrations in order
    console.log('\n📝 Running migrations...');
    const migrationsDir = path.join(__dirname, '../migrations');
    
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const migration of migrations) {
        console.log(`\n→ Running migration: ${migration}`);
        const migrationPath = path.join(migrationsDir, migration);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        const migrationStatements = migrationSql
          .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
          .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
        
        for (const statement of migrationStatements) {
          if (statement.trim()) {
            try {
              await client.query(statement);
              console.log(`  ✓ ${statement.substring(0, 60).replace(/\n/g, ' ')}...`);
            } catch (err) {
              // Check if error is because object already exists
              if (err.message.includes('already exists')) {
                console.log(`  ⚠ Skipped (already exists): ${statement.substring(0, 50)}...`);
              } else {
                console.error(`  ✗ Failed: ${statement.substring(0, 50)}...`);
                console.error(`    Error: ${err.message}`);
              }
            }
          }
        }
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying database structure...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

    console.log('\n✅ Database initialized successfully!');
    
    // Add sample property if none exists
    const propertyCheck = await client.query('SELECT COUNT(*) FROM properties');
    if (propertyCheck.rows[0].count === '0') {
      console.log('\n🏠 Adding sample property...');
      await client.query(`
        INSERT INTO properties (name, address, wifi_ssid, wifi_password, welcome_message)
        VALUES ('Chalet Schladming', 'Schladming, Austria', 'ChaletWiFi', 'Welcome2024', 
                'Welcome to Chalet Schladming! We hope you enjoy your stay.')
        ON CONFLICT DO NOTHING;
      `);
      console.log('✓ Sample property added');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('🚀 Starting database initialization...\n');
  initDatabase()
    .then(() => {
      console.log('\n✨ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database setup failed:', error);
      process.exit(1);
    });
}

export default initDatabase;