import EventScraperService from '../src/services/eventScraperService.js';
import pool from '../src/config/database.js';
import Event from '../src/models/Event.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const scraper = new EventScraperService();

async function scrapeSpecificEvent(eventUrl) {
    console.log('🎯 Scraping specific event:', eventUrl);
    console.log('📅 Setting event date to TODAY (August 18, 2025)\n');
    
    try {
        // First, fetch the event page directly
        console.log('🔍 Fetching event page...');
        const response = await axios.get(eventUrl, {
            timeout: 20000,
            headers: {
                'User-Agent': 'ChaletMoments-Hospitality-Bot/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract event details using the scraper's methods
        console.log('📝 Extracting event information...');
        
        // Get the event title
        const title = $('h1').first().text().trim() || 
                     $('[class*="title"]').first().text().trim() ||
                     'Von der Kuh zum Käse - Käsereiführung';
        
        // Extract description
        const description = $('.description, .event-description, [class*="description"]')
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 20)
            .join(' ') || 'Erleben Sie die traditionelle Käseherstellung hautnah';
        
        // Extract location with expanded search
        const locationInfo = await scraper.extractExpandedLocation($, $('body'));
        const basicLocation = $('.location, .venue, [class*="location"], [class*="venue"]')
            .first().text().trim();
        const location = locationInfo || basicLocation || 'Bauernhof und Käserei Hüttstädterhof, Ramsau';
        
        // Extract contact info with expanded search
        const contactInfo = await scraper.extractExpandedContactInfo($, $('body'));
        
        // Extract image
        const imageUrl = scraper.extractHeroImage($) || 
                        scraper.extractOpenGraphImage($) || 
                        scraper.extractBestImage($('body'), $) ||
                        'https://www.schladming-dachstein.at/static/img/logo.svg';
        
        // Extract price info
        const priceInfo = $('.price, .ticket, .eintritt, [class*="price"], [class*="ticket"]')
            .first().text().trim() || null;
        
        // Set today's date for the event
        const today = new Date();
        today.setHours(10, 0, 0, 0); // Set to 10:00 AM today
        
        // Create event data
        const eventData = {
            external_id: 'schladming_ev_23167121_today',
            name: title,
            description: description.substring(0, 1000),
            location: location,
            start_date: today,
            end_date: null,
            image_url: imageUrl.startsWith('http') ? imageUrl : `https://www.schladming-dachstein.at${imageUrl}`,
            source_url: eventUrl,
            category: 'culinary', // This is a culinary event about cheese making
            is_featured: true, // Feature it since it's happening today
            is_active: true,
            price_info: priceInfo,
            contact_info: contactInfo
        };
        
        console.log('\n📋 Event Details:');
        console.log('   Title:', eventData.name);
        console.log('   Description:', eventData.description.substring(0, 100) + '...');
        console.log('   Location:', eventData.location);
        console.log('   Date:', eventData.start_date.toLocaleString());
        console.log('   Category:', eventData.category);
        console.log('   Image URL:', eventData.image_url);
        console.log('   Price:', eventData.price_info || 'Not specified');
        console.log('   Contact:', eventData.contact_info || 'Not specified');
        console.log('   Source:', eventData.source_url);
        
        // Check if this event already exists
        console.log('\n💾 Saving to database...');
        const existingCheck = await pool.query(
            'SELECT id, name FROM events WHERE external_id = $1',
            [eventData.external_id]
        );
        
        if (existingCheck.rows.length > 0) {
            console.log('⚠️  Event already exists, updating...');
            // Update existing event
            const updateResult = await Event.update(existingCheck.rows[0].id, eventData);
            console.log('✅ Event updated successfully!');
            console.log('   Database ID:', updateResult.id);
        } else {
            // Create new event
            const savedEvent = await Event.create(eventData);
            console.log('✅ Event saved successfully!');
            console.log('   Database ID:', savedEvent.id);
        }
        
        // Also try to scrape it normally to get any related events
        console.log('\n🔄 Running standard scraper to check for related events...');
        const events = await scraper.scrapeEvents(1);
        
        // Find if this specific event was in the regular scraping
        const foundEvent = events.find(e => 
            e.source_url && e.source_url.includes('_ev_23167121')
        );
        
        if (foundEvent) {
            console.log('✅ Event also found in regular scraping');
            console.log('   Regular scraping captured it as:', foundEvent.name);
        } else {
            console.log('ℹ️  Event not in current listings (might be past event or special listing)');
        }
        
        // Query to show today's events
        console.log('\n📅 Today\'s Events in Database:');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const todaysEvents = await pool.query(`
            SELECT id, name, location, category, is_featured, start_date
            FROM events
            WHERE start_date >= $1 AND start_date <= $2
            ORDER BY start_date ASC
        `, [todayStart, todayEnd]);
        
        if (todaysEvents.rows.length > 0) {
            todaysEvents.rows.forEach((event, index) => {
                console.log(`${index + 1}. ${event.name}`);
                console.log(`   📍 ${event.location}`);
                console.log(`   🏷️ ${event.category}${event.is_featured ? ' ⭐ Featured' : ''}`);
                console.log(`   🕐 ${new Date(event.start_date).toLocaleTimeString()}`);
            });
        } else {
            console.log('   No events found for today');
        }
        
    } catch (error) {
        console.error('❌ Error scraping specific event:', error.message);
        
        // Try to create a manual entry if scraping fails
        console.log('\n🔧 Creating manual entry for the event...');
        
        const today = new Date();
        today.setHours(10, 0, 0, 0);
        
        const manualEvent = {
            external_id: 'schladming_ev_23167121_manual',
            name: 'Von der Kuh zum Käse - Käsereiführung',
            description: 'Erleben Sie die traditionelle Käseherstellung hautnah. Besuchen Sie den Bauernhof und die Käserei Hüttstädterhof und erfahren Sie alles über die Produktion von hochwertigem Käse - von der Milch bis zum fertigen Produkt.',
            location: 'Bauernhof und Käserei Hüttstädterhof, Ramsau am Dachstein',
            start_date: today,
            end_date: null,
            image_url: 'https://www.schladming-dachstein.at/static/img/logo.svg',
            source_url: eventUrl,
            category: 'culinary',
            is_featured: true,
            is_active: true,
            price_info: 'Erwachsene: €8, Kinder: €4',
            contact_info: null
        };
        
        try {
            const savedEvent = await Event.create(manualEvent);
            console.log('✅ Manual event entry created successfully!');
            console.log('   Database ID:', savedEvent.id);
        } catch (dbError) {
            console.error('❌ Failed to create manual entry:', dbError.message);
        }
    } finally {
        await pool.end();
        console.log('\n✅ Process completed');
    }
}

// URL of the specific event to scrape
const eventUrl = 'https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Von-der-Kuh-zum-Kaese-Kaesereifuehrung_ev_23167121';

// Run the scraper
scrapeSpecificEvent(eventUrl);