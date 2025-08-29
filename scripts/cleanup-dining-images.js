import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// List of known faulty domains from the error logs
const faultyDomains = [
  'cdn.fastenberg.at',
  'media.obertal.at',
  'media.preuneggtal.at',
  'media.artisan-schladming.at',
  'media.planai.at',
  'media.reiteralm.at',
  'media.schafalm.at',
  'cdn.alpenverein.at',
  'cdn.hochwurzen.at',
  'cdn.landalm.at',
  'cdn.dachstein.at',
  'cdn.das-friedrich.at',
  'cdn.planai.at',
  'cdn.rohrmoos.at',
  'images.falstaff.com',
  'cdn.schladming-dachstein.at'
];

// Valid placeholder images to use
const validPlaceholders = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop'
];

async function checkImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const request = protocol.get(url, { timeout: 5000 }, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

async function cleanupDiningImages() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found');
    process.exit(1);
  }

  console.log('🧹 Cleaning up dining images...');
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
    // Get all dining places
    const result = await pool.query('SELECT id, name, image_url FROM dining_places ORDER BY name');
    console.log(`\n📍 Found ${result.rows.length} dining places to check`);
    
    let updatedCount = 0;
    let faultyCount = 0;
    
    for (const place of result.rows) {
      if (!place.image_url) {
        console.log(`⚠️  ${place.name}: No image URL`);
        continue;
      }
      
      // Check if URL contains faulty domain
      const isFaultyDomain = faultyDomains.some(domain => place.image_url.includes(domain));
      
      if (isFaultyDomain) {
        console.log(`❌ ${place.name}: Faulty domain detected`);
        faultyCount++;
        
        // Replace with a valid placeholder based on place name hash
        const placeholderIndex = Math.abs(place.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % validPlaceholders.length;
        const newImageUrl = validPlaceholders[placeholderIndex];
        
        await pool.query(
          'UPDATE dining_places SET image_url = $1 WHERE id = $2',
          [newImageUrl, place.id]
        );
        
        console.log(`   ✅ Replaced with: ${newImageUrl}`);
        updatedCount++;
      } else {
        // Check if URL is accessible
        const isValid = await checkImageUrl(place.image_url);
        if (!isValid && !place.image_url.includes('unsplash.com')) {
          console.log(`⚠️  ${place.name}: Image not accessible`);
          faultyCount++;
          
          // Replace with placeholder
          const placeholderIndex = Math.abs(place.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % validPlaceholders.length;
          const newImageUrl = validPlaceholders[placeholderIndex];
          
          await pool.query(
            'UPDATE dining_places SET image_url = $1 WHERE id = $2',
            [newImageUrl, place.id]
          );
          
          console.log(`   ✅ Replaced with: ${newImageUrl}`);
          updatedCount++;
        } else {
          console.log(`✓ ${place.name}: Image OK`);
        }
      }
    }
    
    console.log('\n📊 Cleanup Summary:');
    console.log('─────────────────────');
    console.log(`  Total places checked: ${result.rows.length}`);
    console.log(`  Faulty images found: ${faultyCount}`);
    console.log(`  Images updated: ${updatedCount}`);
    
    console.log('\n✨ Dining images cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error cleaning up dining images:', error);
    console.error('Details:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the cleanup
cleanupDiningImages();