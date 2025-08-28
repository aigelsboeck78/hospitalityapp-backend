import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

async function setupUsersTable() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('📊 Setting up users table...');
    
    // Read and execute SQL file
    const sqlPath = path.join(__dirname, '../sql/create_users_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Users tables created successfully');

    // Check if admin user already exists
    const checkAdmin = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (checkAdmin.rows.length === 0) {
      // Create default admin user
      console.log('👤 Creating default admin user...');
      
      // Generate secure random password
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let tempPassword = '';
      for (let i = 0; i < 16; i++) {
        tempPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      await pool.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'admin@chaletmoments.com',
          'admin',
          hashedPassword,
          'System',
          'Administrator',
          'admin',
          true,
          true
        ]
      );
      
      console.log('✅ Admin user created successfully');
      console.log('');
      console.log('========================================');
      console.log('🔐 IMPORTANT: Save these credentials!');
      console.log('========================================');
      console.log(`Username: admin`);
      console.log(`Email: admin@chaletmoments.com`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log('========================================');
      console.log('⚠️  Please change this password immediately after first login!');
      console.log('');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Display current users
    const users = await pool.query('SELECT id, username, email, role FROM users');
    console.log('\n📋 Current users in database:');
    console.table(users.rows);

  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupUsersTable();