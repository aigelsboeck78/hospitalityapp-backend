import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to validate and fix URLs
function validateURL(url) {
  if (!url || url === 'NULL' || url === 'null' || url === '') return null;
  
  // Add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Check if it looks like a domain
    if (url.includes('.')) {
      return `https://${url}`;
    }
  }
  
  return url;
}

// Helper function to assess cuisine type automatically
function assessCuisineType(cuisineStr) {
  if (!cuisineStr) return 'Austrian';
  
  const cuisine = cuisineStr.toLowerCase();
  const mapping = {
    'austrian_traditional': 'Austrian',
    'modern_styrian': 'Modern Austrian',
    'austrian_european_asian': 'International',
    'mediterranean_austrian': 'Mediterranean',
    'international_local': 'International',
    'traditional_styrian': 'Austrian',
    'pizza_traditional': 'Italian',
    'traditional_farm': 'Austrian',
    'traditional_party': 'Austrian',
    'traditional_austrian': 'Austrian',
    'traditional_hut': 'Austrian',
    'gourmet_regional': 'Gourmet',
    'modern_alpine': 'Modern Austrian',
    'cafe_traditional': 'Cafe',
    'traditional_vegetarian': 'Vegetarian',
    'innovative_natural_wine': 'Modern European',
    'austrian_party': 'Austrian',
    'austrian_ayurvedic': 'Health Conscious',
    'traditional': 'Austrian',
    'traditional_alpine': 'Austrian',
    'traditional_organic': 'Organic',
    'traditional_bbq': 'BBQ',
    'austrian_international': 'International',
    'traditional_game': 'Austrian',
    'traditional_dairy': 'Austrian',
    'traditional_snacks': 'Cafe',
    'traditional_comfort': 'Austrian'
  };
  
  return mapping[cuisine] || 'Austrian';
}

// Helper function to determine target guest types
function determineTargetGuestTypes(category, familyFriendly, priceRange) {
  const types = [];
  
  // Parse boolean values
  const isFamily = familyFriendly === 'Yes' || familyFriendly === true;
  
  if (isFamily) types.push('families');
  
  // Based on category
  if (category.includes('Fine_Dining')) {
    types.push('couples', 'business');
  } else if (category.includes('Apres_Ski')) {
    types.push('groups', 'party_goers', 'young_adults');
  } else if (category.includes('Mountain_Hut') || category.includes('Alpine_Hut')) {
    types.push('families', 'couples', 'solo_travelers');
  } else if (category.includes('Cafe')) {
    types.push('families', 'couples', 'solo_travelers', 'seniors');
  }
  
  // Based on price range
  const price = parseInt(priceRange) || 2;
  if (price <= 2) {
    types.push('young_adults', 'families');
  } else if (price >= 4) {
    types.push('business', 'couples');
  }
  
  // Add boys/girls weekend for party venues
  if (category.includes('Apres_Ski') || category.includes('Party')) {
    types.push('boys_weekend', 'girls_weekend');
  }
  
  // Remove duplicates
  return [...new Set(types)];
}

async function importDining() {
  console.log('Starting dining import from CSV...');
  
  const dining = [];
  const csvPath = path.join(process.cwd(), 'schladming_dining_database.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        dining.push(row);
      })
      .on('end', async () => {
        console.log(`Found ${dining.length} dining places to import`);
        
        for (const place of dining) {
          try {
            // Validate and fix data
            const website = validateURL(place.Website);
            const imageUrl = validateURL(place.Image_URL);
            const cuisineType = assessCuisineType(place.Cuisine_Type);
            const targetGuestTypes = determineTargetGuestTypes(
              place.Category,
              place.Family_Friendly,
              place.Price_Range
            );
            
            // Parse coordinates
            const latitude = parseFloat(place.Latitude) || null;
            const longitude = parseFloat(place.Longitude) || null;
            
            // Parse capacities
            const capacityIndoor = parseInt(place.Capacity_Indoor) || null;
            const capacityOutdoor = parseInt(place.Capacity_Outdoor) || null;
            const capacityTotal = parseInt(place.Capacity_Total) || null;
            
            // Parse booleans
            const familyFriendly = place.Family_Friendly === 'Yes';
            const vegetarian = place.Vegetarian === 'Yes';
            const vegan = place.Vegan === 'Yes';
            const glutenFree = place.Gluten_Free === 'Yes';
            const reservationsRequired = place.Reservations_Required === 'Yes';
            
            // Parse price range (convert number to symbols)
            const priceNum = parseInt(place.Price_Range) || 2;
            const priceRange = '$'.repeat(Math.min(4, Math.max(1, priceNum)));
            
            // Check if already exists
            const existing = await pool.query(
              'SELECT id FROM dining_places WHERE external_id = $1',
              [place.ID]
            );
            
            if (existing.rows.length > 0) {
              // Update existing
              await pool.query(`
                UPDATE dining_places SET
                  name_de = $2, name_en = $3, category = $4, location_area = $5,
                  street_address = $6, postal_code = $7, city = $8, altitude_m = $9,
                  phone = $10, website = $11, email = $12, hours_winter = $13,
                  hours_summer = $14, cuisine_type = $15, price_range = $16,
                  capacity_indoor = $17, capacity_outdoor = $18, capacity_total = $19,
                  awards = $20, accessibility = $21, parking = $22, family_friendly = $23,
                  vegetarian = $24, vegan = $25, gluten_free = $26,
                  reservations_required = $27, season_recommendation = $28,
                  relevance_status = $29, image_url = $30, latitude = $31, longitude = $32,
                  target_guest_types = $33, atmosphere = $34
                WHERE external_id = $1
              `, [
                place.ID, place.Name_DE, place.Name_EN, place.Category,
                place.Location_Area, place.Street_Address, place.Postal_Code,
                place.City, place.Altitude_m, place.Phone, website,
                place.Email === 'NULL' ? null : place.Email,
                place.Hours_Winter, place.Hours_Summer, cuisineType,
                priceRange, capacityIndoor, capacityOutdoor, capacityTotal,
                place.Awards === 'NULL' ? null : place.Awards,
                place.Accessibility, place.Parking, familyFriendly,
                vegetarian, vegan, glutenFree, reservationsRequired,
                place.Season_Recommendation, place.Relevance_Status,
                imageUrl, latitude, longitude, targetGuestTypes,
                place.Category // Use category as atmosphere for now
              ]);
              
              console.log(`Updated: ${place.Name_EN}`);
            } else {
              // Insert new
              await pool.query(`
                INSERT INTO dining_places (
                  external_id, name_de, name_en, category, location_area,
                  street_address, postal_code, city, altitude_m, phone,
                  website, email, hours_winter, hours_summer, cuisine_type,
                  price_range, capacity_indoor, capacity_outdoor, capacity_total,
                  awards, accessibility, parking, family_friendly, vegetarian,
                  vegan, gluten_free, reservations_required, season_recommendation,
                  relevance_status, image_url, latitude, longitude, target_guest_types,
                  atmosphere, is_active
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                  $31, $32, $33, $34, $35
                )
              `, [
                place.ID, place.Name_DE, place.Name_EN, place.Category,
                place.Location_Area, place.Street_Address, place.Postal_Code,
                place.City, place.Altitude_m, place.Phone, website,
                place.Email === 'NULL' ? null : place.Email,
                place.Hours_Winter, place.Hours_Summer, cuisineType,
                priceRange, capacityIndoor, capacityOutdoor, capacityTotal,
                place.Awards === 'NULL' ? null : place.Awards,
                place.Accessibility, place.Parking, familyFriendly,
                vegetarian, vegan, glutenFree, reservationsRequired,
                place.Season_Recommendation, place.Relevance_Status,
                imageUrl, latitude, longitude, targetGuestTypes,
                place.Category, // Use category as atmosphere for now
                true // is_active
              ]);
              
              console.log(`Imported: ${place.Name_EN}`);
            }
          } catch (err) {
            console.error(`Error importing ${place.Name_EN}:`, err.message);
          }
        }
        
        console.log('Dining import completed!');
        await pool.end();
        resolve();
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        reject(err);
      });
  });
}

// Run import
importDining().catch(console.error);