import improvedScraper from '../src/services/improvedEventScraperService.js';
import pool from '../src/config/database.js';

async function testImprovedScraper() {
    console.log('🧪 Testing improved event scraper...\n');
    
    try {
        // First, let's clear old test events to see fresh results
        console.log('🧹 Clearing events from the last hour for testing...');
        await pool.query(`
            DELETE FROM events 
            WHERE created_at > NOW() - INTERVAL '1 hour'
            AND source_url LIKE '%schladming-dachstein%'
        `);
        
        // Run the improved scraper for just 1 page to test
        console.log('🔍 Running improved scraper for 1 page...\n');
        const events = await improvedScraper.scrapeEvents(1);
        
        console.log(`\n✅ Scraped ${events.length} events\n`);
        
        // Display sample results
        if (events.length > 0) {
            console.log('📊 Sample of scraped events:\n');
            
            const samples = events.slice(0, 3);
            for (const event of samples) {
                console.log('─'.repeat(60));
                console.log(`📌 Event: ${event.name}`);
                console.log(`📅 Date: ${event.start_date}`);
                console.log(`📍 Location: ${event.location || 'Not specified'}`);
                console.log(`🖼️  Image: ${event.image_url}`);
                console.log(`💰 Price: ${event.price_info || 'Not specified'}`);
                console.log(`🏷️  Category: ${event.category}`);
                console.log(`🔗 URL: ${event.source_url}`);
                console.log();
            }
            
            // Check date accuracy
            console.log('📅 Date Distribution:\n');
            const dateCounts = {};
            for (const event of events) {
                const date = new Date(event.start_date).toLocaleDateString('de-DE');
                dateCounts[date] = (dateCounts[date] || 0) + 1;
            }
            
            for (const [date, count] of Object.entries(dateCounts)) {
                console.log(`   ${date}: ${count} events`);
            }
            
            // Check image validity
            console.log('\n🖼️  Image URL Check:\n');
            let validImages = 0;
            let invalidImages = 0;
            
            for (const event of events) {
                if (event.image_url && !event.image_url.includes('default')) {
                    validImages++;
                } else {
                    invalidImages++;
                }
            }
            
            console.log(`   Valid images: ${validImages}`);
            console.log(`   Default/missing images: ${invalidImages}`);
            
            // Specific event check
            console.log('\n🔍 Checking specific events:\n');
            
            // Check Women's ReConnect event
            const womensEvent = events.find(e => e.name.includes('Women') || e.name.includes('ReConnect'));
            if (womensEvent) {
                console.log(`✅ Women's ReConnect found:`);
                console.log(`   Date: ${womensEvent.start_date}`);
                console.log(`   Expected: Should be Aug 19, 2025`);
            }
            
            // Check Gröbminger Kulturmontag
            const kulturEvent = events.find(e => e.name.includes('Kulturmontag'));
            if (kulturEvent) {
                console.log(`✅ Gröbminger Kulturmontag found:`);
                console.log(`   Date: ${kulturEvent.start_date}`);
                console.log(`   Expected: Should be Sep 1, 2025`);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await pool.end();
    }
}

testImprovedScraper();