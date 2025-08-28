import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../src/config/database.js';
import https from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Configure axios
const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// Validate image URL
async function validateImageUrl(url) {
    if (!url || !url.startsWith('http')) {
        return false;
    }
    
    try {
        const response = await axiosInstance.head(url, { timeout: 5000 });
        const contentType = response.headers['content-type'];
        
        return contentType && contentType.startsWith('image/') && response.status === 200;
    } catch (error) {
        return false;
    }
}

// Search using Google Places API (requires API key)
async function searchGooglePlaces(name, location) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
        return null;
    }
    
    try {
        // First, search for the place
        const searchQuery = `${name} ${location} Schladming Austria`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
        
        const searchResponse = await axios.get(searchUrl, {
            params: {
                input: searchQuery,
                inputtype: 'textquery',
                fields: 'place_id,name,photos',
                key: apiKey
            }
        });
        
        if (searchResponse.data.candidates && searchResponse.data.candidates.length > 0) {
            const place = searchResponse.data.candidates[0];
            
            if (place.photos && place.photos.length > 0) {
                const photoReference = place.photos[0].photo_reference;
                const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
                
                return photoUrl;
            }
        }
    } catch (error) {
        console.log(`  ⚠️ Google Places API error: ${error.message}`);
    }
    
    return null;
}

// Scrape from Schladming-Dachstein website
async function scrapeSchladmingWebsite(name) {
    try {
        const searchUrl = `https://www.schladming-dachstein.at/de/search?q=${encodeURIComponent(name)}`;
        const response = await axiosInstance.get(searchUrl);
        const $ = cheerio.load(response.data);
        
        // Look for restaurant in search results
        const results = $('.search-result-item');
        
        for (let i = 0; i < Math.min(3, results.length); i++) {
            const result = $(results[i]);
            const link = result.find('a').attr('href');
            
            if (link && link.includes('/de/')) {
                const fullUrl = link.startsWith('http') ? link : `https://www.schladming-dachstein.at${link}`;
                
                // Visit the restaurant page
                const pageResponse = await axiosInstance.get(fullUrl);
                const page$ = cheerio.load(pageResponse.data);
                
                // Look for images
                let imageUrl = page$('meta[property="og:image"]').attr('content');
                
                if (!imageUrl) {
                    imageUrl = page$('.gallery-image img').first().attr('src');
                }
                
                if (!imageUrl) {
                    imageUrl = page$('.detail-image img').first().attr('src');
                }
                
                if (imageUrl) {
                    if (!imageUrl.startsWith('http')) {
                        imageUrl = `https://www.schladming-dachstein.at${imageUrl}`;
                    }
                    
                    if (await validateImageUrl(imageUrl)) {
                        return imageUrl;
                    }
                }
            }
        }
    } catch (error) {
        console.log(`  ⚠️ Schladming website scrape failed: ${error.message}`);
    }
    
    return null;
}

// Main search function
async function findRestaurantImage(dining) {
    const name = dining.name_en || dining.name_de;
    const location = dining.location_area || dining.city || 'Schladming';
    
    console.log(`\n🔍 Searching for: ${name}`);
    
    // Try different sources in order of preference
    
    // 1. Try Google Places API if available
    if (process.env.GOOGLE_PLACES_API_KEY) {
        console.log(`  📍 Trying Google Places...`);
        const googleImage = await searchGooglePlaces(name, location);
        if (googleImage) {
            console.log(`  ✅ Found on Google Places!`);
            return googleImage;
        }
    }
    
    // 2. Try Schladming-Dachstein website
    console.log(`  🌐 Trying Schladming-Dachstein website...`);
    const schladmingImage = await scrapeSchladmingWebsite(name);
    if (schladmingImage) {
        console.log(`  ✅ Found on Schladming website!`);
        return schladmingImage;
    }
    
    // 3. Try restaurant's own website
    if (dining.website) {
        console.log(`  🏠 Trying restaurant website: ${dining.website}`);
        const websiteImage = await scrapeRestaurantWebsite(dining.website);
        if (websiteImage) {
            console.log(`  ✅ Found on restaurant website!`);
            return websiteImage;
        }
    }
    
    // 4. Use high-quality fallback based on category
    console.log(`  📷 Using category-based fallback`);
    return getCategoryFallback(dining.category, dining.cuisine_type);
}

// Scrape restaurant's own website
async function scrapeRestaurantWebsite(website) {
    try {
        let url = website;
        if (!url.startsWith('http')) {
            url = `https://${website}`;
        }
        
        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);
        
        // Priority order for finding images
        const imageSelectors = [
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            '.hero img',
            '.header-image img',
            '.restaurant-image',
            '.gallery img:first',
            'main img:first'
        ];
        
        for (const selector of imageSelectors) {
            let imageUrl = $(selector).attr('content') || $(selector).attr('src');
            
            if (imageUrl) {
                if (!imageUrl.startsWith('http')) {
                    const baseUrl = new URL(url);
                    imageUrl = new URL(imageUrl, baseUrl).href;
                }
                
                if (await validateImageUrl(imageUrl)) {
                    return imageUrl;
                }
            }
        }
    } catch (error) {
        // Silent fail
    }
    
    return null;
}

// High-quality category-based fallbacks
function getCategoryFallback(category, cuisineType) {
    const fallbacks = {
        'Fine_Dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
        'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
        'Mountain_Hut': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        'Alpine_Hut': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
        'Apres_Ski': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80',
        'Apres_Ski_Mega': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
        'Cafe_Bakery': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
        'Gourmet_Hut': 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=1200&q=80',
        'Hotel_Restaurant': 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200&q=80',
        'Mountain_Inn': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
        'Mountain_Refuge': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        'Mountain_Restaurant': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80'
    };
    
    // Cuisine-specific fallbacks
    const cuisineFallbacks = {
        'Italian': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
        'Traditional_Austrian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
        'Modern_Alpine': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80',
        'International': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80'
    };
    
    return fallbacks[category] || 
           cuisineFallbacks[cuisineType] || 
           'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';
}

// Main execution
async function updateAllDiningImages() {
    console.log('🚀 Advanced Dining Image Fetcher\n');
    console.log('================================\n');
    
    if (process.env.GOOGLE_PLACES_API_KEY) {
        console.log('✅ Google Places API key found\n');
    } else {
        console.log('⚠️  No Google Places API key found (set GOOGLE_PLACES_API_KEY in .env)\n');
    }
    
    try {
        const result = await pool.query(`
            SELECT id, external_id, name_en, name_de, category, 
                   location_area, city, website, cuisine_type, image_url
            FROM dining_options
            WHERE is_active = true
            ORDER BY relevance_status DESC, name_en ASC
        `);
        
        console.log(`📊 Processing ${result.rows.length} dining places\n`);
        
        let updated = 0;
        let skipped = 0;
        let failed = 0;
        
        for (const dining of result.rows) {
            const name = dining.name_en || dining.name_de;
            
            // Skip if already has a valid non-Unsplash image
            if (dining.image_url && 
                !dining.image_url.includes('unsplash.com') && 
                await validateImageUrl(dining.image_url)) {
                console.log(`⏭️  Skipping ${name} (has valid image)`);
                skipped++;
                continue;
            }
            
            const newImageUrl = await findRestaurantImage(dining);
            
            if (newImageUrl && newImageUrl !== dining.image_url) {
                await pool.query(
                    'UPDATE dining_options SET image_url = $1, updated_at = NOW() WHERE id = $2',
                    [newImageUrl, dining.id]
                );
                console.log(`  💾 Saved to database\n`);
                updated++;
            } else if (!newImageUrl) {
                console.log(`  ❌ Failed to find image\n`);
                failed++;
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        console.log('\n================================');
        console.log('📊 Final Results:');
        console.log(`  ✅ Updated: ${updated}`);
        console.log(`  ⏭️  Skipped: ${skipped}`);
        console.log(`  ❌ Failed: ${failed}`);
        console.log('================================\n');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
updateAllDiningImages();