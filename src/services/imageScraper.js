import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { URL } from 'url';

// Configure axios
const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
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
        const response = await axiosInstance.head(url, { timeout: 5000 });
        const contentType = response.headers['content-type'];
        
        return contentType && contentType.startsWith('image/') && response.status === 200;
    } catch (error) {
        return false;
    }
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
            'main img:first',
            'header img:not([alt*="logo"]):first',
            '.slider img:first',
            'img[src*="restaurant"]:first',
            'img[src*="dining"]:first'
        ];
        
        for (const selector of imageSelectors) {
            let imageUrl = $(selector).attr('content') || $(selector).attr('src');
            
            if (imageUrl) {
                // Skip logos and icons
                if (imageUrl.includes('logo') || imageUrl.includes('icon') || imageUrl.includes('.svg')) {
                    continue;
                }
                
                if (!imageUrl.startsWith('http')) {
                    const baseUrl = new URL(url);
                    imageUrl = new URL(imageUrl, baseUrl).href;
                }
                
                if (await validateImageUrl(imageUrl)) {
                    return imageUrl;
                }
            }
        }
        
        // Try to find any large image on the page
        const allImages = [];
        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            const alt = $(elem).attr('alt') || '';
            
            if (src && 
                !src.includes('logo') && 
                !src.includes('icon') && 
                !src.includes('.svg') &&
                !alt.toLowerCase().includes('logo')) {
                allImages.push(src);
            }
        });
        
        // Try to validate the first few images
        for (const img of allImages.slice(0, 5)) {
            let imageUrl = img;
            if (!imageUrl.startsWith('http')) {
                const baseUrl = new URL(url);
                imageUrl = new URL(imageUrl, baseUrl).href;
            }
            
            if (await validateImageUrl(imageUrl)) {
                return imageUrl;
            }
        }
        
    } catch (error) {
        console.error(`Failed to scrape website ${website}:`, error.message);
    }
    
    return null;
}

// Get category-based fallback image
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
        'Traditional_Organic': 'https://images.unsplash.com/photo-1540202404-a2f29a6b0c6d?w=1200&q=80',
        'Modern_Alpine': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80',
        'International': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80'
    };
    
    return fallbacks[category] || 
           cuisineFallbacks[cuisineType] || 
           'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';
}

// Main function to scrape image for a dining place
export async function scrapeDiningImage(dining) {
    const name = dining.name_en || dining.name_de || dining.name;
    console.log(`Scraping image for: ${name}`);
    
    // Try restaurant's website first
    if (dining.website) {
        console.log(`Checking website: ${dining.website}`);
        const websiteImage = await scrapeRestaurantWebsite(dining.website);
        if (websiteImage) {
            console.log('Found image from website');
            return {
                success: true,
                imageUrl: websiteImage,
                source: 'website'
            };
        }
    }
    
    // Use category-based fallback
    const fallbackImage = getCategoryFallback(dining.category, dining.cuisine_type);
    console.log('Using fallback image');
    
    return {
        success: true,
        imageUrl: fallbackImage,
        source: 'fallback'
    };
}

export default {
    scrapeDiningImage,
    validateImageUrl
};