import axios from 'axios';
import * as cheerio from 'cheerio';

async function checkPageStructure() {
    const url = 'https://www.schladming-dachstein.at/de/Alle-Veranstaltungen';
    
    console.log(`🔍 Fetching ${url}...\n`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('📄 Page structure analysis:\n');
        
        // Check for different event selectors
        const selectors = [
            '.event-item',
            '.veranstaltung-item',
            'article.event',
            '[class*="event-card"]',
            '.veranstaltung',
            '.event',
            'article',
            '.item',
            '.card',
            '[data-event]',
            '.teaser',
            '.list-item'
        ];
        
        for (const selector of selectors) {
            const count = $(selector).length;
            if (count > 0) {
                console.log(`✅ Found ${count} elements with selector: ${selector}`);
                
                // Show sample element
                const $first = $(selector).first();
                console.log(`   Sample HTML structure:`);
                console.log(`   ${$first.html()?.substring(0, 200)}...`);
                console.log();
            }
        }
        
        // Look for links with event patterns
        console.log('🔗 Event links found:\n');
        const eventLinks = [];
        
        $('a[href*="/Alle-Veranstaltungen/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.includes('?page') && i < 5) {
                eventLinks.push(href);
                const title = $(elem).text().trim() || $(elem).find('h2, h3, .title').text().trim();
                console.log(`   ${title || 'No title'}: ${href}`);
            }
        });
        
        // Check for date patterns in the page
        console.log('\n📅 Date patterns found:\n');
        const datePatterns = [
            /\d{1,2}\.\d{1,2}\.\d{4}/g,  // DD.MM.YYYY
            /\d{1,2}\.\s+\w+\s+\d{4}/g,   // DD. Month YYYY
            /\d{1,2}\.\d{1,2}\./g          // DD.MM.
        ];
        
        const pageText = $('body').text();
        for (const pattern of datePatterns) {
            const matches = pageText.match(pattern);
            if (matches && matches.length > 0) {
                console.log(`   Found ${matches.length} dates matching ${pattern}`);
                console.log(`   First 3: ${matches.slice(0, 3).join(', ')}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkPageStructure();