import EventScraperService from '../src/services/eventScraperService.js';
import pool from '../src/config/database.js';

const scraper = new EventScraperService();

async function testScraper() {
    console.log('🧪 Testing improved event scraper...\n');
    
    try {
        // Test connection
        console.log('1️⃣ Testing connection to website...');
        const canConnect = await scraper.testScraping();
        if (!canConnect) {
            console.error('❌ Could not connect to website');
            return;
        }
        console.log('✅ Connection successful!\n');
        
        // Run the actual scraping with just 1 page for testing
        console.log('2️⃣ Running event scraping (1 page max for testing)...');
        const events = await scraper.scrapeEvents(1);
        
        console.log(`\n📊 Results:`);
        console.log(`- Total events scraped: ${events.length}`);
        
        if (events.length > 0) {
            console.log('\n📅 Sample events:');
            events.slice(0, 3).forEach((event, index) => {
                console.log(`\n${index + 1}. ${event.name}`);
                console.log(`   📍 Location: ${event.location}`);
                console.log(`   📅 Date: ${event.start_date.toLocaleDateString()}`);
                console.log(`   🏷️ Category: ${event.category}`);
                console.log(`   🖼️ Image: ${event.image_url ? 'Yes' : 'No'}`);
                console.log(`   💰 Price: ${event.price_info || 'Not specified'}`);
                console.log(`   🔗 Source: ${event.source_url}`);
            });
        }
        
        // Check cleanup functionality
        console.log('\n3️⃣ Testing old event cleanup...');
        const deletedCount = await scraper.cleanupOldEvents();
        console.log(`✅ Deleted ${deletedCount} old events\n`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        // Close database connection
        await pool.end();
        console.log('📝 Test completed');
    }
}

// Run the test
testScraper();