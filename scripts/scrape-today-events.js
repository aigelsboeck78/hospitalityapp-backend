import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../src/config/database.js';

async function scrapeTodayEvents() {
  console.log('🔍 Scraping events for TODAY (August 19, 2025)...');
  
  try {
    // First, let's try to get today's events from the main page
    const url = 'https://www.schladming-dachstein.at/de/Alle-Veranstaltungen';
    console.log(`📄 Fetching ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Look for events with today's date
    const today = new Date('2025-08-19');
    const tomorrow = new Date('2025-08-20');
    
    let foundEvents = [];
    
    // Find all event cards
    $('.event-card, .veranstaltung-item, article').each((i, elem) => {
      const $elem = $(elem);
      const title = $elem.find('h2, h3, .title').text().trim();
      const dateText = $elem.find('.date, .datum, time').text().trim();
      const link = $elem.find('a').attr('href');
      
      if (title && dateText) {
        // Try to parse the date
        if (dateText.includes('19.08') || dateText.includes('19.8') || dateText.includes('August 19')) {
          foundEvents.push({
            title,
            dateText,
            link: link ? `https://www.schladming-dachstein.at${link}` : null
          });
        }
      }
    });
    
    console.log(`\n📅 Found ${foundEvents.length} events for August 19th`);
    
    // Also specifically check the Women's ReConnect event
    console.log('\n🔍 Checking specific Women\'s ReConnect event...');
    const eventUrl = 'https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Women-s-ReConnect-mit-Wildkraeuter-Yoga_ev_23690150';
    
    try {
      const eventResponse = await axios.get(eventUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      const $event = cheerio.load(eventResponse.data);
      
      // Look for date patterns
      const pageText = $event.text();
      const datePatterns = [
        /19\.08\.2025/g,
        /19\. August 2025/g,
        /Monday.*19.*August/gi,
        /Montag.*19.*August/gi
      ];
      
      let eventDate = null;
      for (const pattern of datePatterns) {
        const match = pageText.match(pattern);
        if (match) {
          eventDate = match[0];
          break;
        }
      }
      
      if (eventDate) {
        console.log(`✅ Women's ReConnect event date found: ${eventDate}`);
        
        // Update the event in the database
        const updateQuery = `
          UPDATE events 
          SET start_date = '2025-08-19 09:00:00'::timestamp
          WHERE external_id = 'schladming_ev_23690150'
          RETURNING name, start_date;
        `;
        
        const result = await pool.query(updateQuery);
        if (result.rows.length > 0) {
          console.log(`✅ Updated event date: ${result.rows[0].name} -> ${result.rows[0].start_date}`);
        }
      } else {
        console.log('⚠️  Could not find specific date on event page');
        
        // Try to extract from structured data
        const jsonLd = $event('script[type="application/ld+json"]').text();
        if (jsonLd) {
          try {
            const data = JSON.parse(jsonLd);
            console.log('Found structured data:', data);
          } catch (e) {
            console.log('Could not parse structured data');
          }
        }
      }
      
    } catch (err) {
      console.error('Error fetching specific event:', err.message);
    }
    
    // Now let's also create a new scrape for today's events
    console.log('\n🔄 Re-scraping with date filter for August 19...');
    
    // The website might use date parameters
    const todayUrl = `${url}?date=2025-08-19`;
    try {
      const todayResponse = await axios.get(todayUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      const $today = cheerio.load(todayResponse.data);
      console.log('Fetched today\'s events page');
      
      // Look for any events
      const eventCount = $today('.event-card, .veranstaltung-item, article').length;
      console.log(`Found ${eventCount} event elements on filtered page`);
      
    } catch (err) {
      console.log('Could not fetch date-filtered page');
    }
    
  } catch (error) {
    console.error('❌ Error scraping events:', error.message);
  } finally {
    await pool.end();
  }
}

scrapeTodayEvents();