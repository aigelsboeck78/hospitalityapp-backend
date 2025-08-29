#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

// Database connection
const connectionString = process.env.DATABASE_URL || 
                        process.env.POSTGRES_PRISMA_URL || 
                        process.env.POSTGRES_URL ||
                        process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error('❌ No database connection string found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

async function fixImageUrlColumn() {
  try {
    console.log('🔧 Fixing background_images.image_url column size...');
    
    // Read the migration SQL
    const migrationPath = join(__dirname, '..', 'migrations', 'increase_image_url_size.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Successfully changed image_url column to TEXT type');
    
    // Check current images
    const result = await pool.query('SELECT COUNT(*) as count FROM background_images');
    console.log(`📊 Current background images in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing image_url column:', error.message);
    if (error.code === '42P01') {
      console.log('ℹ️  Table background_images does not exist yet');
    } else if (error.message.includes('already exists')) {
      console.log('ℹ️  Column already fixed');
    } else {
      console.error('Error details:', error);
    }
  } finally {
    await pool.end();
  }
}

// Run the fix
fixImageUrlColumn();