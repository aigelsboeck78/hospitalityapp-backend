import pool from '../src/config/database.js';

async function updateDiningImages() {
    console.log('🖼️  Updating dining image URLs...');
    
    try {
        // Map categories to appropriate placeholder images
        const categoryImages = {
            'Fine_Dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
            'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            'Mountain_Hut': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            'Alpine_Hut': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
            'Apres_Ski': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
            'Apres_Ski_Mega': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
            'Cafe_Bakery': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
            'Gourmet_Hut': 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80',
            'Hotel_Restaurant': 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80',
            'Mountain_Inn': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
            'Mountain_Refuge': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
            'Mountain_Restaurant': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80'
        };
        
        // Get all dining options
        const result = await pool.query('SELECT id, category, name_en FROM dining_options');
        
        console.log(`📊 Found ${result.rows.length} dining options to update`);
        
        let updated = 0;
        
        for (const dining of result.rows) {
            // Get appropriate image based on category
            const imageUrl = categoryImages[dining.category] || 
                           'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'; // Default restaurant image
            
            // Update the image URL
            await pool.query(
                'UPDATE dining_options SET image_url = $1 WHERE id = $2',
                [imageUrl, dining.id]
            );
            
            updated++;
            
            if (updated % 10 === 0) {
                console.log(`   Updated ${updated} dining options...`);
            }
        }
        
        console.log(`\n✅ Successfully updated ${updated} dining image URLs!`);
        
        // Show some specific high-quality images for featured restaurants
        const specificImages = [
            { 
                name: 'JOHANN GENUSSraum',
                url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80'
            },
            {
                name: 'Die Tischlerei',
                url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80'
            },
            {
                name: 'Stadtbräu Schladming',
                url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&q=80'
            },
            {
                name: 'Schladminger Hütte',
                url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80'
            },
            {
                name: 'Hohenhaus Tenne',
                url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
            },
            {
                name: 'Krummholzhütte',
                url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80'
            },
            {
                name: 'Schafalm',
                url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' // Pizza
            },
            {
                name: 'Märchenwiesenhütte',
                url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'
            },
            {
                name: 'ARTiSAN',
                url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80' // Cafe
            },
            {
                name: 'Moarhofalm',
                url: 'https://images.unsplash.com/photo-1540202404-a2f29a6b0c6d?w=800&q=80' // Organic/Bio
            },
            {
                name: 'Ursprungalm',
                url: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&q=80' // Cheese/Dairy
            }
        ];
        
        // Update specific restaurants with better images
        for (const item of specificImages) {
            await pool.query(
                'UPDATE dining_options SET image_url = $1 WHERE name_en = $2',
                [item.url, item.name]
            );
        }
        
        console.log('🌟 Updated featured restaurants with specific images');
        
    } catch (error) {
        console.error('❌ Error updating images:', error);
    } finally {
        await pool.end();
    }
}

// Run the update
updateDiningImages();