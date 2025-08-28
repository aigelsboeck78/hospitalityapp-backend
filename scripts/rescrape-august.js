import EventScraperService from '../src/services/eventScraperService.js';
import pool from '../src/config/database.js';
import Event from '../src/models/Event.js';

const scraper = new EventScraperService();

async function rescrapeAugustEvents() {
    console.log('🔄 Re-scraping events for August 16th, 17th, and 18th...\n');
    
    try {
        // First, delete existing events for these dates to ensure fresh data
        console.log('🗑️  Removing old events for August 16-18...');
        
        const deleteQuery = `
            DELETE FROM events 
            WHERE start_date >= '2024-08-16'::date 
            AND start_date <= '2024-08-18'::date
            AND external_id LIKE 'schladming%'
            RETURNING id, name
        `;
        
        const deleteResult = await pool.query(deleteQuery);
        console.log(`✅ Deleted ${deleteResult.rowCount} existing events for these dates\n`);
        
        if (deleteResult.rows.length > 0) {
            console.log('Deleted events:');
            deleteResult.rows.forEach(row => {
                console.log(`  - ${row.name}`);
            });
            console.log('');
        }
        
        // Now scrape fresh events with the improved scraper
        console.log('🔍 Starting improved event scraping...');
        console.log('📊 This will use the enhanced scraper with:');
        console.log('  ✨ Better image extraction (hero, Open Graph, best selection)');
        console.log('  📝 Enhanced information extraction with structured data');
        console.log('  ⏱️  Respectful rate limiting (1.5-3s delays)');
        console.log('  🏷️  Source attribution overlays\n');
        
        // Scrape up to 3 pages to get more events
        const events = await scraper.scrapeEvents(3);
        
        // Filter for events on August 16-18
        const augustEvents = events.filter(event => {
            const eventDate = new Date(event.start_date);
            const day = eventDate.getDate();
            const month = eventDate.getMonth() + 1; // 0-indexed
            
            return month === 8 && day >= 16 && day <= 18;
        });
        
        console.log(`\n📅 Results for August 16-18:`);
        console.log(`- Total events scraped: ${events.length}`);
        console.log(`- Events on Aug 16-18: ${augustEvents.length}\n`);
        
        if (augustEvents.length > 0) {
            console.log('📋 Events for August 16-18:');
            
            // Group by date
            const eventsByDate = {};
            augustEvents.forEach(event => {
                const date = new Date(event.start_date).toLocaleDateString('de-DE');
                if (!eventsByDate[date]) {
                    eventsByDate[date] = [];
                }
                eventsByDate[date].push(event);
            });
            
            // Display grouped events
            Object.keys(eventsByDate).sort().forEach(date => {
                console.log(`\n📅 ${date}:`);
                eventsByDate[date].forEach((event, index) => {
                    console.log(`  ${index + 1}. ${event.name}`);
                    console.log(`     📍 ${event.location}`);
                    console.log(`     🏷️ ${event.category}`);
                    console.log(`     🖼️ Image: ${event.image_url ? 'Yes ✓' : 'No ✗'}`);
                    console.log(`     📝 Description: ${event.description ? event.description.substring(0, 80) + '...' : 'None'}`);
                    console.log(`     💰 ${event.price_info || 'Price not specified'}`);
                    console.log(`     🔗 ${event.source_url}`);
                });
            });
            
            // Summary statistics
            console.log('\n📊 Summary Statistics:');
            const withImages = augustEvents.filter(e => e.image_url && !e.image_url.includes('logo')).length;
            const withDescriptions = augustEvents.filter(e => e.description && e.description.length > 50).length;
            const withPriceInfo = augustEvents.filter(e => e.price_info).length;
            
            console.log(`  ✅ Events with proper images: ${withImages}/${augustEvents.length}`);
            console.log(`  ✅ Events with descriptions: ${withDescriptions}/${augustEvents.length}`);
            console.log(`  ✅ Events with price info: ${withPriceInfo}/${augustEvents.length}`);
            
            // Categories breakdown
            const categories = {};
            augustEvents.forEach(e => {
                categories[e.category] = (categories[e.category] || 0) + 1;
            });
            
            console.log('\n🏷️ Categories:');
            Object.entries(categories).forEach(([cat, count]) => {
                console.log(`  - ${cat}: ${count} events`);
            });
            
        } else {
            console.log('⚠️  No events found for August 16-18');
            console.log('   This could mean:');
            console.log('   - Events for these dates haven\'t been published yet');
            console.log('   - The dates have already passed');
            console.log('   - The source website structure has changed');
        }
        
        // Also show some events from other dates if we found any
        const otherEvents = events.filter(event => {
            const eventDate = new Date(event.start_date);
            const day = eventDate.getDate();
            const month = eventDate.getMonth() + 1;
            return !(month === 8 && day >= 16 && day <= 18);
        });
        
        if (otherEvents.length > 0) {
            console.log(`\n📅 Also found ${otherEvents.length} events for other dates:`);
            otherEvents.slice(0, 5).forEach((event, index) => {
                const date = new Date(event.start_date).toLocaleDateString('de-DE');
                console.log(`  ${index + 1}. ${event.name} (${date})`);
            });
            if (otherEvents.length > 5) {
                console.log(`  ... and ${otherEvents.length - 5} more`);
            }
        }
        
    } catch (error) {
        console.error('❌ Re-scraping failed:', error.message);
        console.error(error.stack);
    } finally {
        // Close database connection
        await pool.end();
        console.log('\n✅ Re-scraping completed');
    }
}

// Run the re-scraping
rescrapeAugustEvents();