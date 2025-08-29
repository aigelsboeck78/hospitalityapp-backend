#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { put } from '@vercel/blob';

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

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment variables');
  console.log('Please set up Vercel Blob Storage and add the token to your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

// Helper function to import external image to Vercel Blob
async function importImageToBlob(imageUrl, folder, filename) {
  try {
    // Skip if already a blob URL
    if (imageUrl.includes('blob.vercel-storage.com')) {
      return { url: imageUrl, skipped: true };
    }

    // Skip if it's a local/relative URL
    if (imageUrl.startsWith('/') || !imageUrl.startsWith('http')) {
      return { url: imageUrl, skipped: true };
    }

    console.log(`  📥 Fetching: ${imageUrl}`);
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log(`  📤 Uploading to Blob Storage...`);
    
    const blob = await put(`${folder}/${filename}`, Buffer.from(buffer), {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log(`  ✅ Uploaded: ${blob.url}`);
    return { url: blob.url, imported: true };
  } catch (error) {
    console.error(`  ❌ Failed to import: ${error.message}`);
    return { url: imageUrl, error: error.message };
  }
}

async function migrateImages() {
  const client = await pool.connect();
  let stats = {
    activities: { total: 0, imported: 0, skipped: 0, failed: 0 },
    events: { total: 0, imported: 0, skipped: 0, failed: 0 },
    dining: { total: 0, imported: 0, skipped: 0, failed: 0 }
  };

  try {
    console.log('🚀 Starting image migration to Vercel Blob Storage...\n');

    // Migrate Activities
    console.log('📸 Migrating Activity Images...');
    const activities = await client.query(
      'SELECT id, name, image_url FROM activities WHERE image_url IS NOT NULL'
    );
    
    for (const activity of activities.rows) {
      stats.activities.total++;
      console.log(`\n🎯 Activity: ${activity.name}`);
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${activity.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      const result = await importImageToBlob(activity.image_url, 'activities', filename);
      
      if (result.imported) {
        await client.query(
          'UPDATE activities SET image_url = $1 WHERE id = $2',
          [result.url, activity.id]
        );
        stats.activities.imported++;
      } else if (result.skipped) {
        stats.activities.skipped++;
        console.log(`  ⏭️  Skipped (already migrated or local URL)`);
      } else {
        stats.activities.failed++;
      }
    }

    // Migrate Events
    console.log('\n\n📸 Migrating Event Images...');
    const events = await client.query(
      'SELECT id, name, image_url FROM events WHERE image_url IS NOT NULL'
    );
    
    for (const event of events.rows) {
      stats.events.total++;
      console.log(`\n🎪 Event: ${event.name}`);
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${event.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      const result = await importImageToBlob(event.image_url, 'events', filename);
      
      if (result.imported) {
        await client.query(
          'UPDATE events SET image_url = $1 WHERE id = $2',
          [result.url, event.id]
        );
        stats.events.imported++;
      } else if (result.skipped) {
        stats.events.skipped++;
        console.log(`  ⏭️  Skipped (already migrated or local URL)`);
      } else {
        stats.events.failed++;
      }
    }

    // Migrate Dining
    console.log('\n\n📸 Migrating Dining Images...');
    const dining = await client.query(
      'SELECT id, name, image_url FROM dining WHERE image_url IS NOT NULL'
    );
    
    for (const diningItem of dining.rows) {
      stats.dining.total++;
      console.log(`\n🍽️ Dining: ${diningItem.name}`);
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${diningItem.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      const result = await importImageToBlob(diningItem.image_url, 'dining', filename);
      
      if (result.imported) {
        await client.query(
          'UPDATE dining SET image_url = $1 WHERE id = $2',
          [result.url, diningItem.id]
        );
        stats.dining.imported++;
      } else if (result.skipped) {
        stats.dining.skipped++;
        console.log(`  ⏭️  Skipped (already migrated or local URL)`);
      } else {
        stats.dining.failed++;
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    
    for (const [category, stat] of Object.entries(stats)) {
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  Total: ${stat.total}`);
      console.log(`  ✅ Imported: ${stat.imported}`);
      console.log(`  ⏭️  Skipped: ${stat.skipped}`);
      console.log(`  ❌ Failed: ${stat.failed}`);
    }
    
    const totalImported = stats.activities.imported + stats.events.imported + stats.dining.imported;
    const totalProcessed = stats.activities.total + stats.events.total + stats.dining.total;
    
    console.log('\n' + '='.repeat(60));
    console.log(`✨ Migration complete! ${totalImported}/${totalProcessed} images imported to Vercel Blob Storage`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
console.log('Vercel Blob Storage Image Migration Tool');
console.log('=========================================\n');

migrateImages();