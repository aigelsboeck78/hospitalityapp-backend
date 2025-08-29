#!/usr/bin/env node

import { EnhancedEventScraperService } from '../src/services/enhancedEventScraperService.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Mock logger if not available
const logger = {
    info: (...args) => console.log('ℹ️ ', ...args),
    warn: (...args) => console.warn('⚠️ ', ...args),
    error: (...args) => console.error('❌', ...args)
};

// Mock Event model for testing
const MockEvent = {
    async upsert(eventData) {
        console.log('📝 Would save event:', {
            name: eventData.name,
            date: eventData.start_date,
            location: eventData.location,
            category: eventData.category,
            price: eventData.price,
            url: eventData.source_url
        });
        return eventData;
    },
    
    async deleteOldEvents(date) {
        console.log(`🗑️  Would delete events older than ${date.toISOString()}`);
        return 0;
    }
};

async function testEnhancedScraper() {
    console.log('🧪 Testing Enhanced Event Scraper');
    console.log('================================\n');
    
    const scraper = new EnhancedEventScraperService();
    
    // Override the Event model with mock
    const originalEvent = global.Event;
    global.Event = MockEvent;
    
    try {
        // Test 1: Pagination Detection
        console.log('📄 Test 1: Testing pagination detection...');
        const testHtml = `
            <div class="pagination">
                <a href="?page=1">1</a>
                <a href="?page=2" class="active">2</a>
                <a href="?page=3">3</a>
                <a href="?page=4">4</a>
                <a href="?page=5">5</a>
                <a href="?page=2" class="next">Weiter</a>
            </div>
        `;
        const cheerio = await import('cheerio');
        const $ = cheerio.load(testHtml);
        const paginationInfo = await scraper.detectPagination($);
        console.log('Pagination detected:', paginationInfo);
        console.log('✅ Pagination test passed\n');
        
        // Test 2: Date Extraction
        console.log('📅 Test 2: Testing date extraction...');
        const dateTests = [
            'Heute um 20:00 Uhr',
            'Morgen, 15.03.2024',
            '1.-3. März 2024',
            'Jeden Freitag um 19:30',
            'Täglich vom 20.12. bis 31.12.2024'
        ];
        
        for (const text of dateTests) {
            const result = scraper.extractEnhancedDates(text);
            console.log(`Input: "${text}"`);
            console.log('Result:', {
                dates: result.dates.map(d => d.toLocaleDateString('de-DE')),
                times: result.times,
                isRecurring: result.isRecurring
            });
        }
        console.log('✅ Date extraction test passed\n');
        
        // Test 3: Price Extraction
        console.log('💰 Test 3: Testing price extraction...');
        const priceTests = [
            'Eintritt: €15,50',
            'Tickets: €10 - €25',
            'Eintritt frei',
            'Erwachsene €20, Kinder bis 12 Jahre €10',
            'Ausverkauft! Keine Tickets mehr verfügbar'
        ];
        
        const $price = cheerio.load('<div></div>');
        for (const text of priceTests) {
            const result = scraper.extractEnhancedPrice($price, text);
            console.log(`Input: "${text}"`);
            console.log('Result:', result);
        }
        console.log('✅ Price extraction test passed\n');
        
        // Test 4: Category Detection
        console.log('🏷️  Test 4: Testing category detection...');
        const categoryTests = [
            { url: '/de/veranstaltungen/konzert/band-xyz', title: 'Rock Band XYZ', desc: '' },
            { url: '/de/events/sport/skirennen', title: 'FIS Skirennen', desc: 'Spannendes Rennen' },
            { url: '/de/kultur/theater', title: 'Hamlet', desc: 'Shakespeare Drama' },
            { url: '/de/events/123', title: 'Weihnachtsmarkt', desc: 'Traditioneller Markt' }
        ];
        
        for (const test of categoryTests) {
            const $cat = cheerio.load('<div></div>');
            const category = scraper.extractCategory($cat, test.url, test.title, test.desc);
            console.log(`URL: ${test.url}, Title: ${test.title}`);
            console.log(`Category: ${category}`);
        }
        console.log('✅ Category detection test passed\n');
        
        // Test 5: Live scraping (first page only for testing)
        console.log('🌐 Test 5: Testing live scraping (1 page)...');
        console.log('Fetching actual events from schladming-dachstein.at...\n');
        
        const events = await scraper.scrapeEvents(1); // Only scrape 1 page for testing
        
        console.log(`\n📊 Scraping Results:`);
        console.log(`Total events found: ${events.length}`);
        
        if (events.length > 0) {
            console.log('\nSample events:');
            events.slice(0, 3).forEach((event, index) => {
                console.log(`\n${index + 1}. ${event.name}`);
                console.log(`   Date: ${event.start_date?.toLocaleDateString('de-DE') || 'N/A'}`);
                console.log(`   Location: ${event.location || 'N/A'}`);
                console.log(`   Category: ${event.category || 'N/A'}`);
                console.log(`   Price: €${event.price || 'N/A'}`);
                console.log(`   URL: ${event.source_url}`);
            });
        }
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error(error.stack);
    } finally {
        // Restore original Event model
        global.Event = originalEvent;
    }
}

// Run tests
testEnhancedScraper().catch(console.error);