import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map cuisine types from CSV to our database format
const cuisineTypeMap = {
  'Austrian_Traditional': 'austrian',
  'Modern_Styrian': 'fine_dining', 
  'Austrian_European_Asian': 'international',
  'Mediterranean_Austrian': 'international',
  'International_Local': 'international',
  'Traditional_Styrian': 'austrian',
  'Pizza_Traditional': 'italian',
  'Traditional_Farm': 'austrian',
  'Traditional_Party': 'austrian',
  'Traditional_Austrian': 'austrian',
  'Traditional_Hut': 'austrian',
  'Gourmet_Regional': 'fine_dining',
  'Modern_Alpine': 'fine_dining',
  'Cafe_Traditional': 'cafe',
  'Traditional_Vegetarian': 'vegetarian',
  'Innovative_Natural_Wine': 'fine_dining',
  'Austrian_Party': 'austrian',
  'Austrian_Ayurvedic': 'international',
  'Traditional': 'austrian',
  'Traditional_Organic': 'austrian',
  'Traditional_BBQ': 'steakhouse',
  'Austrian_International': 'international',
  'Traditional_Game': 'austrian',
  'Traditional_Dairy': 'austrian',
  'Traditional_Snacks': 'cafe',
  'Traditional_Comfort': 'austrian'
};

// Try to fetch an image from the website
async function fetchWebsiteImage(websiteUrl, name) {
  if (!websiteUrl || websiteUrl === 'NULL') {
    return null;
  }
  
  try {
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    console.log(`  Fetching image from ${url}...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DiningImporter/1.0)'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Look for Open Graph image meta tag
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) {
      let imageUrl = ogImageMatch[1];
      if (!imageUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      }
      console.log(`    Found image: ${imageUrl}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.log(`    Error: ${error.message}`);
    return null;
  }
}

async function importDiningData() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../schladming_dining_database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log('Starting import of Schladming dining database...\n');
    
    // Get or create property for Schladming
    const propertyResult = await pool.query(
      'SELECT id FROM properties WHERE name ILIKE $1 LIMIT 1',
      ['%Schladming%']
    );
    
    let propertyId = null;
    if (propertyResult.rows.length > 0) {
      propertyId = propertyResult.rows[0].id;
      console.log(`Found property: ${propertyId}\n`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Parse CSV line (handle commas in quoted fields)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      // Map values to object
      const data = {};
      headers.forEach((header, index) => {
        data[header] = values[index] === 'NULL' ? null : values[index];
      });
      
      const name = data.Name_EN || data.Name_DE;
      console.log(`\nProcessing ${name}...`);
      
      try {
        // Prepare website URL
        let websiteUrl = null;
        if (data.Website && data.Website !== 'NULL') {
          websiteUrl = data.Website.trim();
          if (!websiteUrl.startsWith('http')) {
            websiteUrl = 'https://' + websiteUrl;
          }
        }
        
        // Try to fetch an image from the website
        let imageUrl = data.Image_URL;
        if (websiteUrl) {
          const fetchedImage = await fetchWebsiteImage(websiteUrl, name);
          if (fetchedImage) {
            imageUrl = fetchedImage;
          }
        }
        
        // Prepare the data for insertion  
        const cuisineType = cuisineTypeMap[data.Cuisine_Type] || 'international';
        const priceRange = data.Price_Range || '€€';
        
        // Build a comprehensive description
        const description = `${data.Category.replace(/_/g, ' ')} in ${data.Location_Area.replace(/_/g, ' ')}. ` +
          (data.Awards && data.Awards !== 'NULL' ? `Awards: ${data.Awards}. ` : '') +
          (data.Altitude_m ? `Altitude: ${data.Altitude_m}m. ` : '') +
          (data.Capacity_Total ? `Capacity: ${data.Capacity_Total} guests. ` : '');
        
        // Insert into database - using only existing columns
        const insertQuery = `
          INSERT INTO dining_places (
            name, name_en, name_de, 
            cuisine_type, price_range, rating,
            description, location, location_area,
            city, postal_code, street_address,
            phone, website, 
            hours_winter, hours_summer,
            image_url, is_active,
            latitude, longitude, altitude_m,
            capacity_indoor, capacity_outdoor, capacity_total,
            parking, family_friendly, vegetarian, vegan, gluten_free,
            reservations_required, season_recommendation, relevance_status,
            category, awards, accessibility
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35
          )
          RETURNING id
        `;
        
        const queryValues = [
          name,                                              // name
          data.Name_EN || name,                             // name_en
          data.Name_DE || name,                             // name_de
          cuisineType,                                       // cuisine_type
          priceRange,                                        // price_range
          4.5,                                              // rating (default)
          description,                                       // description
          data.Street_Address || data.Location_Area,        // location
          data.Location_Area,                               // location_area
          data.City || 'Schladming',                        // city
          data.Postal_Code || '8970',                       // postal_code
          data.Street_Address,                              // street_address
          data.Phone !== 'NULL' ? data.Phone : null,        // phone
          websiteUrl,                                        // website
          data.Hours_Winter !== 'NULL' ? data.Hours_Winter : null, // hours_winter
          data.Hours_Summer !== 'NULL' ? data.Hours_Summer : null, // hours_summer
          imageUrl,                                          // image_url
          true,                                             // is_active
          data.Latitude ? parseFloat(data.Latitude) : null, // latitude
          data.Longitude ? parseFloat(data.Longitude) : null, // longitude
          data.Altitude_m ? parseInt(data.Altitude_m) : null, // altitude_m
          data.Capacity_Indoor ? parseInt(data.Capacity_Indoor) : null, // capacity_indoor
          data.Capacity_Outdoor ? parseInt(data.Capacity_Outdoor) : null, // capacity_outdoor
          data.Capacity_Total ? parseInt(data.Capacity_Total) : null, // capacity_total
          data.Parking !== 'No' && data.Parking !== 'NULL', // parking
          data.Family_Friendly === 'Yes',                   // family_friendly
          data.Vegetarian === 'Yes',                        // vegetarian
          data.Vegan === 'Yes' || data.Vegan === 'Limited', // vegan
          data.Gluten_Free === 'Yes' || data.Gluten_Free === 'Limited', // gluten_free
          data.Reservations_Required === 'Yes' || data.Reservations_Required === 'Recommended' ? 'Yes' : 'No', // reservations_required (as VARCHAR, not boolean)
          data.Season_Recommendation || null,               // season_recommendation
          data.Relevance_Status || 'Popular',               // relevance_status
          data.Category,                                    // category
          data.Awards !== 'NULL' ? data.Awards : null,      // awards
          data.Accessibility !== 'NULL' ? data.Accessibility : null // accessibility
        ];
        
        const result = await pool.query(insertQuery, queryValues);
        console.log(`  ✓ Imported successfully (ID: ${result.rows[0].id})`);
        successCount++;
        
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n========================================');
    console.log(`Import completed!`);
    console.log(`Success: ${successCount} dining places`);
    console.log(`Errors: ${errorCount}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('Fatal error during import:', error);
  } finally {
    await pool.end();
  }
}

// Run the import
importDiningData();