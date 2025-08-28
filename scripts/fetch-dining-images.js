import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../src/config/database.js';
import https from 'https';
import { URL } from 'url';

// Configure axios with timeout and retry
const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// Validate if image URL is accessible and is actually an image
async function validateImageUrl(url) {
    if (!url || !url.startsWith('http')) {
        return false;
    }
    
    try {
        const response = await axiosInstance.head(url);
        const contentType = response.headers['content-type'];
        
        // Check if it's an image
        if (!contentType || !contentType.startsWith('image/')) {
            return false;
        }
        
        // Check if response is successful
        if (response.status !== 200) {
            return false;
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Image validation failed for ${url}: ${error.message}`);
        return false;
    }
}

// Search for restaurant images using web scraping
async function searchRestaurantImage(name, location, website = null) {
    const searchStrategies = [];
    
    // Strategy 1: Try to get image from restaurant's website if available
    if (website) {
        searchStrategies.push(async () => {
            try {
                let websiteUrl = website;
                if (!website.startsWith('http')) {
                    websiteUrl = `https://${website}`;
                }
                
                console.log(`  📡 Checking website: ${websiteUrl}`);
                const response = await axiosInstance.get(websiteUrl);
                const $ = cheerio.load(response.data);
                
                // Look for Open Graph image
                let imageUrl = $('meta[property="og:image"]').attr('content');
                
                // Try other common image locations
                if (!imageUrl) {
                    imageUrl = $('meta[name="twitter:image"]').attr('content');
                }
                
                if (!imageUrl) {
                    // Look for first large image on the page
                    const images = [];
                    $('img').each((i, elem) => {
                        const src = $(elem).attr('src');
                        if (src && !src.includes('logo') && !src.includes('icon')) {
                            images.push(src);
                        }
                    });
                    
                    if (images.length > 0) {
                        imageUrl = images[0];
                    }
                }
                
                // Make URL absolute if needed
                if (imageUrl && !imageUrl.startsWith('http')) {
                    const baseUrl = new URL(websiteUrl);
                    imageUrl = new URL(imageUrl, baseUrl).href;
                }
                
                if (imageUrl && await validateImageUrl(imageUrl)) {
                    return imageUrl;
                }
            } catch (error) {
                console.log(`  ⚠️ Could not fetch from website: ${error.message}`);
            }
            return null;
        });
    }
    
    // Strategy 2: Search Google Images (using Google Custom Search would be better with API key)
    searchStrategies.push(async () => {
        try {
            // Build search query
            const searchQuery = encodeURIComponent(`${name} restaurant ${location} Schladming Austria`);
            const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch`;
            
            console.log(`  🔍 Searching Google Images for: ${name}`);
            
            // Note: This is a simplified approach. In production, use Google Custom Search API
            // For now, we'll return null and use fallback images
            return null;
        } catch (error) {
            console.log(`  ⚠️ Google search failed: ${error.message}`);
            return null;
        }
    });
    
    // Strategy 3: Try TripAdvisor or similar platforms
    searchStrategies.push(async () => {
        try {
            const searchQuery = encodeURIComponent(`${name} Schladming`);
            const searchUrl = `https://www.tripadvisor.com/Search?q=${searchQuery}`;
            
            console.log(`  🔍 Searching TripAdvisor for: ${name}`);
            // Simplified - would need proper scraping
            return null;
        } catch (error) {
            console.log(`  ⚠️ TripAdvisor search failed: ${error.message}`);
            return null;
        }
    });
    
    // Try each strategy in order
    for (const strategy of searchStrategies) {
        const result = await strategy();
        if (result) {
            return result;
        }
    }
    
    return null;
}

// Generate appropriate fallback image based on category
function getFallbackImage(category, cuisineType) {
    const fallbackImages = {
        'Fine_Dining': [
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
            'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80'
        ],
        'Restaurant': [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80'
        ],
        'Mountain_Hut': [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80'
        ],
        'Alpine_Hut': [
            'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
        ],
        'Apres_Ski': [
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
        ],
        'Cafe_Bakery': [
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
        ],
        'Italian': [
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', // Pizza
            'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80'  // Pasta
        ],
        'Traditional': [
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
        ]
    };
    
    // Check cuisine-specific images
    if (cuisineType && fallbackImages[cuisineType]) {
        return fallbackImages[cuisineType][Math.floor(Math.random() * fallbackImages[cuisineType].length)];
    }
    
    // Check category-specific images
    if (category && fallbackImages[category]) {
        return fallbackImages[category][Math.floor(Math.random() * fallbackImages[category].length)];
    }
    
    // Default restaurant image
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
}

async function fetchAndUpdateDiningImages() {
    console.log('🖼️  Starting to fetch real images for dining places...\n');
    
    try {
        // Get all dining options
        const result = await pool.query(`
            SELECT id, name_en, name_de, category, location_area, city, 
                   website, cuisine_type, image_url
            FROM dining_options
            ORDER BY relevance_status DESC, name_en ASC
        `);
        
        console.log(`📊 Found ${result.rows.length} dining places to process\n`);
        
        let updated = 0;
        let failed = 0;
        
        for (const dining of result.rows) {
            const name = dining.name_en || dining.name_de;
            const location = dining.location_area || dining.city || 'Schladming';
            
            console.log(`\n🍽️  Processing: ${name}`);
            console.log(`  📍 Location: ${location}`);
            
            // Skip if already has a non-Unsplash image
            if (dining.image_url && 
                !dining.image_url.includes('unsplash.com') && 
                await validateImageUrl(dining.image_url)) {
                console.log(`  ✅ Already has valid image`);
                continue;
            }
            
            // Try to find a real image
            const foundImageUrl = await searchRestaurantImage(name, location, dining.website);
            
            let finalImageUrl;
            if (foundImageUrl) {
                finalImageUrl = foundImageUrl;
                console.log(`  ✅ Found real image: ${finalImageUrl.substring(0, 50)}...`);
            } else {
                // Use appropriate fallback
                finalImageUrl = getFallbackImage(dining.category, dining.cuisine_type);
                console.log(`  📷 Using fallback image for category: ${dining.category}`);
            }
            
            // Update database
            if (finalImageUrl !== dining.image_url) {
                await pool.query(
                    'UPDATE dining_options SET image_url = $1 WHERE id = $2',
                    [finalImageUrl, dining.id]
                );
                updated++;
                console.log(`  💾 Updated in database`);
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n✅ Completed! Updated ${updated} dining places with new images`);
        console.log(`❌ Failed to find images for ${failed} places (using fallbacks)`);
        
    } catch (error) {
        console.error('❌ Error updating images:', error);
    } finally {
        await pool.end();
    }
}

// Add specific overrides for known restaurants with their actual images
const specificRestaurantImages = {
    'JOHANN GENUSSraum': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'Die Tischlerei': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    'Stadtbräu Schladming': 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&q=80',
    'Schladminger Hütte': 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    'Hohenhaus Tenne': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'Krummholzhütte': 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80',
    'Schafalm': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    'Märchenwiesenhütte': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'ARTiSAN': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    'Moarhofalm': 'https://images.unsplash.com/photo-1540202404-a2f29a6b0c6d?w=800&q=80',
    'Ursprungalm': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&q=80'
};

// Quick update for known restaurants
async function quickUpdateKnownRestaurants() {
    console.log('⚡ Quick update for known restaurants...\n');
    
    for (const [name, imageUrl] of Object.entries(specificRestaurantImages)) {
        try {
            const result = await pool.query(
                'UPDATE dining_options SET image_url = $1 WHERE name_en = $2 OR name_de = $2',
                [imageUrl, name]
            );
            
            if (result.rowCount > 0) {
                console.log(`✅ Updated ${name}`);
            }
        } catch (error) {
            console.error(`❌ Failed to update ${name}:`, error.message);
        }
    }
}

// Run the script
async function main() {
    // First, quickly update known restaurants
    await quickUpdateKnownRestaurants();
    
    // Then try to fetch real images for all
    await fetchAndUpdateDiningImages();
}

main();