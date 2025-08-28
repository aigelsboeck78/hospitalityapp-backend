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

// Map price ranges
const priceRangeMap = {
  '1': '€',
  '2': '€€',
  '3': '€€€',
  '4': '€€€€'
};

// Parse hours to a readable format
function parseHours(winterHours, summerHours) {
  if (winterHours === 'Ski_Season' || winterHours === 'Ski_Season_Extended') {
    return 'Winter: During ski season | Summer: ' + (summerHours || 'Closed');
  }
  if (winterHours === 'Closed' && summerHours) {
    return 'Winter: Closed | Summer: ' + summerHours;
  }
  if (winterHours === summerHours && winterHours !== 'NULL') {
    return winterHours;
  }
  return `Winter: ${winterHours || 'Varies'} | Summer: ${summerHours || 'Varies'}`;
}

// Try to fetch an image from the website
async function fetchWebsiteImage(websiteUrl, name) {
  if (!websiteUrl || websiteUrl === 'NULL') {
    return null;
  }
  
  try {
    // Clean up the website URL
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    console.log(`Fetching image from ${url} for ${name}...`);
    
    // Try to fetch the homepage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DiningImporter/1.0)'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`  Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Look for Open Graph image meta tag (most reliable)
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) {
      let imageUrl = ogImageMatch[1];
      // Make sure it's an absolute URL
      if (!imageUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      }
      console.log(`  Found OG image: ${imageUrl}`);
      return imageUrl;
    }
    
    // Look for Twitter image meta tag
    const twitterImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
    if (twitterImageMatch) {
      let imageUrl = twitterImageMatch[1];
      if (!imageUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      }
      console.log(`  Found Twitter image: ${imageUrl}`);
      return imageUrl;
    }
    
    // Look for first significant image in the page
    const imgMatches = html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    for (const match of imgMatches) {
      let imageUrl = match[1];
      // Skip small images, icons, etc.
      if (imageUrl.includes('logo') || imageUrl.includes('icon') || 
          imageUrl.includes('pixel') || imageUrl.includes('tracking')) {
        continue;
      }
      if (!imageUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).toString();
      }
      // Check if it's a reasonable image
      if (imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        console.log(`  Found image: ${imageUrl}`);
        return imageUrl;
      }
    }
    
    console.log(`  No suitable image found on ${url}`);
    return null;
  } catch (error) {
    console.log(`  Error fetching ${websiteUrl}: ${error.message}`);
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
    
    // Get the property ID for Schladming property
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
      
      console.log(`\nProcessing ${data.Name_EN || data.Name_DE}...`);
      
      try {
        // Prepare website URL
        let websiteUrl = null;
        if (data.Website && data.Website !== 'NULL') {
          websiteUrl = data.Website.trim();
          if (!websiteUrl.startsWith('http')) {
            websiteUrl = 'https://' + websiteUrl;
          }
        }
        
        // Try to fetch an image from the website or use provided URL
        let imageUrl = data.Image_URL;
        if (websiteUrl) {
          const fetchedImage = await fetchWebsiteImage(websiteUrl, data.Name_EN);
          if (fetchedImage) {
            imageUrl = fetchedImage;
          }
        }
        
        // Prepare the data for insertion
        const cuisineType = cuisineTypeMap[data.Cuisine_Type] || 'international';
        const priceRange = priceRangeMap[data.Price_Range] || '€€';
        const openingHours = parseHours(data.Hours_Winter, data.Hours_Summer);
        
        // Calculate distance based on coordinates if available
        let distanceKm = null;
        let travelTimeMinutes = null;
        if (data.Latitude && data.Longitude) {
          // Rough estimate from Schladming center
          const schladmingLat = 47.3947;
          const schladmingLon = 13.6875;
          distanceKm = Math.round(
            Math.sqrt(
              Math.pow((parseFloat(data.Latitude) - schladmingLat) * 111, 2) +
              Math.pow((parseFloat(data.Longitude) - schladmingLon) * 111, 2)
            ) * 10
          ) / 10;
          // Estimate travel time (5 minutes base + 2 minutes per km)
          travelTimeMinutes = Math.round(5 + distanceKm * 2);
        }
        
        // Build specialties based on features
        const specialties = [];
        if (data.Awards && data.Awards !== 'NULL') specialties.push(data.Awards);
        if (data.Vegetarian === 'Yes') specialties.push('Vegetarian options');
        if (data.Vegan === 'Yes') specialties.push('Vegan options');
        if (data.Gluten_Free === 'Yes') specialties.push('Gluten-free options');
        if (data.Family_Friendly === 'Yes') specialties.push('Family-friendly');
        
        // Determine ambiance based on category
        let ambiance = 'Traditional';
        if (data.Category === 'Fine_Dining') ambiance = 'Elegant';
        if (data.Category === 'Apres_Ski' || data.Category === 'Apres_Ski_Mega') ambiance = 'Lively';
        if (data.Category === 'Mountain_Hut' || data.Category === 'Alpine_Hut') ambiance = 'Rustic Alpine';
        if (data.Category === 'Cafe_Bakery') ambiance = 'Cozy';
        
        // Insert into database
        const insertQuery = `
          INSERT INTO dining_places (
            name, name_en, name_de, cuisine_type, price_range, rating, description,
            street_address, location, location_area, city, postal_code,
            phone, website, hours_winter, hours_summer,
            reservations_required,
            specialties, dietary_options, ambiance, images, is_active,
            property_id, latitude, longitude, altitude_m,
            capacity_indoor, capacity_outdoor, parking,
            accessibility, season_recommendation, relevance_status,
            category, event_type, family_friendly, vegetarian, vegan, gluten_free
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38
          )
          ON CONFLICT (name, property_id) 
          DO UPDATE SET
            name_en = EXCLUDED.name_en,
            name_de = EXCLUDED.name_de,
            cuisine_type = EXCLUDED.cuisine_type,
            price_range = EXCLUDED.price_range,
            description = EXCLUDED.description,
            street_address = EXCLUDED.street_address,
            location = EXCLUDED.location,
            location_area = EXCLUDED.location_area,
            website = EXCLUDED.website,
            hours_winter = EXCLUDED.hours_winter,
            hours_summer = EXCLUDED.hours_summer,
            images = EXCLUDED.images,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            altitude_m = EXCLUDED.altitude_m,
            capacity_indoor = EXCLUDED.capacity_indoor,
            capacity_outdoor = EXCLUDED.capacity_outdoor,
            season_recommendation = EXCLUDED.season_recommendation,
            relevance_status = EXCLUDED.relevance_status,
            updated_at = NOW()
          RETURNING id
        `;
        
        const values = [
          data.Name_EN || data.Name_DE,                    // name
          data.Name_EN || data.Name_DE,                    // name_en
          data.Name_DE || data.Name_EN,                    // name_de
          cuisineType,                                      // cuisine_type
          priceRange,                                       // price_range
          4.5,                                             // rating (default)
          `${data.Category.replace(/_/g, ' ')} in ${data.Location_Area.replace(/_/g, ' ')}`, // description
          data.Street_Address || null,                     // street_address
          data.Street_Address || data.Location_Area,       // location
          data.Location_Area,                              // location_area
          data.City || 'Schladming',                       // city
          data.Postal_Code || '8970',                      // postal_code
          data.Phone !== 'NULL' ? data.Phone : null,       // phone
          websiteUrl,                                       // website
          data.Hours_Winter !== 'NULL' ? data.Hours_Winter : null, // hours_winter
          data.Hours_Summer !== 'NULL' ? data.Hours_Summer : null, // hours_summer
          data.Reservations_Required === 'Yes' || data.Reservations_Required === 'Recommended' ? 'Yes' : 'No', // reservations_required (as string)
          specialties.join(', '),                          // specialties
          specialties.filter(s => s.includes('egan') || s.includes('luten')).join(', '), // dietary_options
          ambiance,                                         // ambiance
          imageUrl,                                         // images
          true,                                            // is_active
          propertyId,                                       // property_id
          data.Latitude ? parseFloat(data.Latitude) : null, // latitude
          data.Longitude ? parseFloat(data.Longitude) : null, // longitude
          data.Altitude_m ? parseInt(data.Altitude_m) : null, // altitude_m
          data.Capacity_Indoor ? parseInt(data.Capacity_Indoor) : null, // capacity_indoor
          data.Capacity_Outdoor ? parseInt(data.Capacity_Outdoor) : null, // capacity_outdoor
          data.Parking !== 'No' && data.Parking !== 'NULL', // parking
          data.Accessibility !== 'NULL' ? data.Accessibility : null, // accessibility
          data.Season_Recommendation !== 'NULL' ? data.Season_Recommendation : null, // season_recommendation
          data.Relevance_Status || 'Popular',              // relevance_status
          data.Category,                                    // category
          data.Category,                                    // event_type
          data.Family_Friendly === 'Yes',                  // family_friendly
          data.Vegetarian === 'Yes',                       // vegetarian
          data.Vegan === 'Yes' || data.Vegan === 'Limited', // vegan
          data.Gluten_Free === 'Yes' || data.Gluten_Free === 'Limited' // gluten_free
        ];
        
        const result = await pool.query(insertQuery, values);
        console.log(`  ✓ Imported successfully (ID: ${result.rows[0].id})`);
        successCount++;
        
      } catch (error) {
        console.error(`  ✗ Error importing ${data.Name_EN}: ${error.message}`);
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