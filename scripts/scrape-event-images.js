import { Pool } from 'pg';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vacation_rental_hospitality',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const UPLOAD_DIR = join(__dirname, '..', 'uploads', 'event-images');

async function extractImageFromEventPage(eventUrl) {
  try {
    console.log(`Fetching: ${eventUrl}`);
    const response = await axios.get(eventUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    
    // Look for images in various patterns
    const imagePatterns = [
      /https:\/\/www\.schladming-dachstein\.at\/_default_upload_bucket\/image-thumb__\d+__mainimg-touren\/[^"'\s]+\.(webp|jpg|jpeg|png)/gi,
      /https:\/\/www\.schladming-dachstein\.at\/_default_upload_bucket\/[^"'\s]+\.(webp|jpg|jpeg|png)/gi,
      /"(\/[^"]+\.(webp|jpg|jpeg|png))"/gi
    ];

    let imageUrl = null;
    
    for (const pattern of imagePatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        // Filter out logos and small images
        const validImage = matches.find(url => 
          !url.includes('logo') && 
          !url.includes('icon') && 
          !url.includes('thumbnail') &&
          (url.includes('mainimg') || url.includes('image-thumb'))
        );
        
        if (validImage) {
          imageUrl = validImage.replace(/['"]/g, '');
          if (imageUrl.startsWith('/')) {
            imageUrl = 'https://www.schladming-dachstein.at' + imageUrl;
          }
          break;
        }
      }
    }

    return imageUrl;
  } catch (error) {
    console.error(`Error fetching ${eventUrl}:`, error.message);
    return null;
  }
}

async function downloadImage(imageUrl, filename) {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 30000
    });

    const filePath = join(UPLOAD_DIR, filename);
    await pipeline(response.data, createWriteStream(filePath));
    
    return `/uploads/event-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading ${imageUrl}:`, error.message);
    return null;
  }
}

async function processEvents() {
  try {
    // Get events with specific URLs (containing _ev_)
    const result = await pool.query(
      `SELECT id, name, source_url, image_url 
       FROM events 
       WHERE source_url LIKE '%_ev_%' 
       AND (image_url IS NULL OR image_url LIKE '%logo.svg%')
       ORDER BY id`
    );

    console.log(`Found ${result.rows.length} events to process`);

    for (const event of result.rows) {
      console.log(`\n--- Processing: ${event.name} ---`);
      
      // Extract image URL from the event page
      const imageUrl = await extractImageFromEventPage(event.source_url);
      
      if (imageUrl) {
        console.log(`Found image: ${imageUrl}`);
        
        // Generate filename from event name
        const filename = `${event.id}-${event.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50)}.webp`;
        
        // Download the image
        const localImagePath = await downloadImage(imageUrl, filename);
        
        if (localImagePath) {
          // Update the database
          await pool.query(
            'UPDATE events SET image_url = $1 WHERE id = $2',
            [localImagePath, event.id]
          );
          
          console.log(`✓ Updated event ${event.id} with image: ${localImagePath}`);
        }
      } else {
        console.log(`✗ No image found for: ${event.name}`);
      }
      
      // Add delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('Error processing events:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
processEvents().then(() => {
  console.log('\nEvent image scraping completed!');
}).catch(console.error);