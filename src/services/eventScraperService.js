import axios from 'axios';
import * as cheerio from 'cheerio';
import Event from '../models/Event.js';
import { logger } from '../middleware/errorHandler.js';

const BASE_URL = 'https://www.schladming-dachstein.at';
const EVENTS_URL = `${BASE_URL}/de/Alle-Veranstaltungen`;
const SOURCE_LOGO = `${BASE_URL}/static/img/logo.svg`;

export class EventScraperService {
    constructor() {
        this.axiosConfig = {
            timeout: 20000, // 20 second timeout
            headers: {
                'User-Agent': 'ChaletMoments-Hospitality-Bot/1.0 (Respectful Event Aggregator; contact: info@chaletmoments.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        };
        
        // Rate limiting configuration
        this.lastRequestTime = 0;
        this.minDelayBetweenRequests = 1500; // 1.5 seconds between requests
        this.maxDelayBetweenRequests = 3000; // 3 seconds max delay
    }
    
    // Respectful HTTP request with rate limiting and exponential backoff
    async respectfulRequest(url, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Rate limiting with randomized delay to appear more human-like
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                const randomDelay = this.minDelayBetweenRequests + 
                    Math.random() * (this.maxDelayBetweenRequests - this.minDelayBetweenRequests);
                
                if (timeSinceLastRequest < randomDelay) {
                    const delayNeeded = Math.ceil(randomDelay - timeSinceLastRequest);
                    logger.info(`⏱️  Rate limiting: waiting ${delayNeeded}ms before request to be respectful`);
                    await new Promise(resolve => setTimeout(resolve, delayNeeded));
                }
                
                this.lastRequestTime = Date.now();
                logger.info(`🔍 Fetching ${url} (attempt ${attempt}/${retries})`);
                
                const response = await axios.get(url, this.axiosConfig);
                
                // Success - add small delay before returning to be extra respectful
                await new Promise(resolve => setTimeout(resolve, 500));
                return response;
                
            } catch (error) {
                logger.warn(`⚠️  Attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
                
                if (error.response?.status === 429) {
                    // Rate limited by server - wait much longer
                    const backoffDelay = 30000 * attempt; // 30s, 60s, 90s
                    logger.warn(`🚫 Rate limited! Waiting ${backoffDelay/1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                } else if (attempt < retries) {
                    // Exponential backoff for other errors
                    const backoffDelay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
                    logger.info(`🔄 Retrying in ${backoffDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                } else {
                    throw error;
                }
            }
        }
    }
    
    // Clean up old events (older than 2 days ago)
    async cleanupOldEvents() {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            twoDaysAgo.setHours(0, 0, 0, 0);
            
            logger.info(`🧹 Cleaning up events older than ${twoDaysAgo.toISOString()}`);
            const deletedCount = await Event.deleteOldEvents(twoDaysAgo);
            logger.info(`✅ Deleted ${deletedCount} old events`);
            
            return deletedCount;
        } catch (error) {
            logger.error('❌ Error cleaning up old events:', error);
            return 0;
        }
    }

    async scrapeEvents(maxPages = 2) {
        try {
            logger.info('🔍 Starting respectful event scraping from schladming-dachstein.at...');
            
            // First, clean up old events
            await this.cleanupOldEvents();
            
            const allEvents = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages && currentPage <= maxPages) {
                logger.info(`📄 Scraping page ${currentPage}...`);
                
                const pageUrl = currentPage === 1 
                    ? EVENTS_URL 
                    : `${EVENTS_URL}?page=${currentPage}`;
                
                const pageEvents = await this.scrapePage(pageUrl, currentPage);
                
                if (pageEvents.length === 0) {
                    logger.info(`📄 No events found on page ${currentPage}, stopping pagination`);
                    hasMorePages = false;
                } else {
                    allEvents.push(...pageEvents);
                    logger.info(`✅ Found ${pageEvents.length} events on page ${currentPage}`);
                    currentPage++;
                    
                    // Add extra delay between pages to be respectful
                    if (hasMorePages && currentPage <= maxPages) {
                        const pageDelay = 2000 + Math.random() * 2000; // 2-4 seconds
                        logger.info(`⏳ Waiting ${Math.round(pageDelay/1000)}s before next page...`);
                        await new Promise(resolve => setTimeout(resolve, pageDelay));
                    }
                }
            }

            logger.info(`📅 Successfully scraped ${allEvents.length} total events`);
            
            // Store events in database
            const savedEvents = [];
            for (const eventData of allEvents) {
                try {
                    const savedEvent = await Event.upsert(eventData);
                    savedEvents.push(savedEvent);
                } catch (error) {
                    logger.warn(`⚠️  Error saving event "${eventData.name}":`, error.message);
                }
            }

            logger.info(`💾 Successfully saved ${savedEvents.length} events to database`);
            return savedEvents;

        } catch (error) {
            logger.error('❌ Event scraping failed:', error.message);
            
            // Return mock events as fallback
            return await this.createMockEvents();
        }
    }

    async scrapePage(pageUrl, pageNumber) {
        try {
            const response = await this.respectfulRequest(pageUrl);
            const $ = cheerio.load(response.data);
            
            const events = [];
            
            // Look for event links with the _ev_ pattern
            const eventLinks = [];
            $('a[href*="_ev_"]').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();
                
                if (href && text && text.length > 3) {
                    const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
                    eventLinks.push({
                        url: fullUrl,
                        href,
                        text,
                        element: el
                    });
                }
            });

            // Remove duplicates
            const uniqueLinks = eventLinks.filter((link, index, self) => 
                index === self.findIndex(l => l.href === link.href)
            );

            logger.info(`🎯 Found ${uniqueLinks.length} unique event links on page ${pageNumber}`);

            // Process events with delays to be respectful
            for (let i = 0; i < uniqueLinks.length; i++) {
                const link = uniqueLinks[i];
                try {
                    // Extract basic data from listing page first
                    const eventDataOrArray = await this.extractEventDataFromListing(link, $);
                    
                    // Handle both single events and arrays of events (for recurring events)
                    const eventDataArray = Array.isArray(eventDataOrArray) ? eventDataOrArray : [eventDataOrArray];
                    
                    for (const eventData of eventDataArray) {
                        if (!eventData) continue;
                        
                        // Only fetch individual page if we need more details
                        if (!eventData.description || !eventData.image_url) {
                            logger.info(`📄 Fetching details for: ${eventData.name} (${eventData.start_date.toLocaleDateString()})`);
                            const detailedData = await this.fetchEventPage(link.url);
                            
                            // Merge detailed data
                            if (detailedData) {
                                eventData.description = detailedData.description || eventData.description;
                                eventData.image_url = detailedData.imageUrl || eventData.image_url;
                                eventData.location = detailedData.location || eventData.location;
                                eventData.price_info = detailedData.priceInfo || eventData.price_info;
                                eventData.contact_info = detailedData.contactInfo || eventData.contact_info;
                            }
                        }
                        
                        if (this.isValidEvent(eventData)) {
                            events.push(eventData);
                        }
                    }
                    
                    // Add small delay between processing events
                    if (i < uniqueLinks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    
                } catch (error) {
                    logger.warn(`⚠️  Error extracting event from ${link.href}:`, error.message);
                }
            }

            return events;

        } catch (error) {
            logger.error(`❌ Error scraping page ${pageUrl}:`, error.message);
            return [];
        }
    }

    async extractEventDataFromListing(link, $) {
        try {
            const $linkEl = $(link.element);
            const $container = $linkEl.closest('article, div[class*="event"], div[class*="item"], li').first();
            
            // Extract name
            const name = link.text || this.extractText($container, [
                'h1', 'h2', 'h3', 'h4', '.title', '.event-title',
                '[class*="title"]', '[class*="heading"]'
            ]);

            // Extract description
            const description = this.extractText($container, [
                '.description', '.summary', '.teaser', '.content',
                '[class*="description"]', '[class*="summary"]', 'p'
            ]);

            // Extract location
            const location = this.extractText($container, [
                '.location', '.venue', '.place', '.ort', '.address',
                '[class*="location"]', '[class*="venue"]', '[class*="address"]'
            ]) || 'Schladming-Dachstein';

            // Extract date(s)
            const dateInfo = this.extractDateFromContainer($container);
            
            // Extract image - try to find the most relevant one
            const imageUrl = this.extractBestImage($container, $);

            // Generate external ID
            const baseExternalId = this.generateExternalIdFromUrl(link.href);

            // Extract category
            const category = this.extractCategory(name, description, $container);

            // Extract price
            const priceInfo = this.extractText($container, [
                '.price', '.cost', '.preis', '.eintritt',
                '[class*="price"]', '[class*="cost"]'
            ]);

            // If event has multiple dates, create multiple event objects
            const events = [];
            const allDates = dateInfo.allDates || [dateInfo.startDate];
            
            for (let i = 0; i < allDates.length; i++) {
                const eventDate = allDates[i];
                // Add date suffix to external_id for recurring events
                const externalId = allDates.length > 1 
                    ? `${baseExternalId}_${eventDate.toISOString().split('T')[0]}`
                    : baseExternalId;
                
                events.push({
                    external_id: externalId,
                    name: this.cleanText(name),
                    description: this.cleanText(description),
                    location: this.cleanText(location),
                    start_date: eventDate,
                    end_date: null, // Single day event for each occurrence
                    image_url: imageUrl || SOURCE_LOGO,
                    source_url: link.url,
                    category: category,
                    price_info: this.cleanText(priceInfo),
                    is_featured: false,
                    is_active: true,
                    contact_info: null
                });
            }

            // Return array of events or single event
            return events.length === 1 ? events[0] : events;

        } catch (error) {
            logger.warn(`⚠️  Error in extractEventDataFromListing: ${error.message}`);
            return null;
        }
    }

    async fetchEventPage(eventUrl) {
        try {
            const response = await this.respectfulRequest(eventUrl);
            const $ = cheerio.load(response.data);
            
            // Look for structured data first
            const structuredData = this.extractStructuredData($);
            
            // Extract main content area
            const $main = $('main, article, .content, [role="main"]').first();
            const $body = $main.length ? $main : $('body');
            
            // Extract detailed description
            const description = this.extractLongText($body, [
                '.description', '.details', '.event-description', '.long-description',
                '[class*="description"]', '[class*="details"]', '.text-content'
            ]);

            // Extract location with more detail - including dropdown/expandable content
            const location = this.extractExpandedLocation($, $body) || 
                           this.extractText($body, [
                               '.location', '.venue', '.address', '.place',
                               '[class*="location"]', '[class*="venue"]', '[class*="address"]'
                           ]) || 
                           structuredData?.location;

            // Extract the best image from the page
            const imageUrl = this.extractHeroImage($) || 
                           this.extractOpenGraphImage($) || 
                           this.extractBestImage($body, $) ||
                           structuredData?.image;
            
            // Extract price information
            const priceInfo = this.extractText($body, [
                '.price', '.ticket', '.eintritt', '.kosten',
                '[class*="price"]', '[class*="ticket"]', '[class*="cost"]'
            ]) || structuredData?.price;

            // Extract contact information - including from dropdowns
            const contactInfo = this.extractExpandedContactInfo($, $body);
            
            // Extract all dates from the detail page
            const dateInfo = this.extractAllDatesFromPage($);

            return {
                description: description || structuredData?.description,
                location,
                imageUrl,
                priceInfo,
                contactInfo,
                startDate: dateInfo?.startDate || structuredData?.startDate,
                endDate: dateInfo?.endDate || structuredData?.endDate,
                allDates: dateInfo?.allDates || []
            };

        } catch (error) {
            logger.warn(`⚠️  Error fetching event page ${eventUrl}: ${error.message}`);
            return null;
        }
    }
    
    extractAllDatesFromPage($) {
        // Look for dates in various locations on the page
        const dates = [];
        
        // Look in common date containers
        const dateSelectors = [
            '.date', '.dates', '.event-date', '.event-dates',
            '[class*="date"]', '[class*="termin"]', '[class*="datum"]',
            '.when', '.schedule', '.calendar',
            'time', '[datetime]'
        ];
        
        dateSelectors.forEach(selector => {
            $(selector).each((i, el) => {
                const $el = $(el);
                const text = $el.text();
                const datetime = $el.attr('datetime');
                
                // Try datetime attribute first
                if (datetime) {
                    const date = new Date(datetime);
                    if (!isNaN(date.getTime()) && date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                        dates.push(date);
                    }
                }
                
                // Then try text content
                if (text) {
                    // German date format
                    const germanDatePattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/g;
                    let match;
                    
                    while ((match = germanDatePattern.exec(text)) !== null) {
                        const day = parseInt(match[1]);
                        const month = parseInt(match[2]) - 1;
                        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
                        
                        const date = new Date(year, month, day);
                        if (date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                            dates.push(date);
                        }
                    }
                }
            });
        });
        
        if (dates.length > 0) {
            // Remove duplicates and sort
            const uniqueDates = [...new Set(dates.map(d => d.toISOString()))].map(d => new Date(d));
            uniqueDates.sort((a, b) => a - b);
            
            return {
                startDate: uniqueDates[0],
                endDate: uniqueDates.length > 1 ? uniqueDates[uniqueDates.length - 1] : null,
                allDates: uniqueDates
            };
        }
        
        return null;
    }

    extractStructuredData($) {
        try {
            const scripts = $('script[type="application/ld+json"]');
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts.eq(i).html();
                if (script) {
                    const data = JSON.parse(script);
                    if (data['@type'] === 'Event' || data.type === 'Event') {
                        return {
                            name: data.name,
                            description: data.description,
                            startDate: data.startDate ? new Date(data.startDate) : null,
                            endDate: data.endDate ? new Date(data.endDate) : null,
                            location: data.location?.name || data.location?.address,
                            image: data.image,
                            price: data.offers?.price
                        };
                    }
                }
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
        return null;
    }

    extractHeroImage($) {
        // Look for hero/header images which are often the main event image
        const selectors = [
            '.hero img', '.header img', '.banner img',
            '[class*="hero"] img', '[class*="header"] img', '[class*="banner"] img',
            '.main-image img', '.featured-image img',
            'header img', 'picture img'
        ];
        
        for (const selector of selectors) {
            const $img = $(selector).first();
            if ($img.length) {
                const src = $img.attr('src') || $img.attr('data-src');
                if (src && !src.includes('logo') && !src.includes('icon')) {
                    return src.startsWith('http') ? src : BASE_URL + src;
                }
            }
        }
        return null;
    }

    extractOpenGraphImage($) {
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) {
            return ogImage.startsWith('http') ? ogImage : BASE_URL + ogImage;
        }
        return null;
    }

    extractBestImage($container, $) {
        // Try to find the most relevant image
        const images = [];
        
        $container.find('img').each((i, el) => {
            const $img = $(el);
            const src = $img.attr('src') || $img.attr('data-src');
            
            if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                const width = parseInt($img.attr('width')) || 0;
                const height = parseInt($img.attr('height')) || 0;
                const alt = $img.attr('alt') || '';
                
                images.push({
                    src: src.startsWith('http') ? src : BASE_URL + src,
                    width,
                    height,
                    alt,
                    area: width * height,
                    isFirst: i === 0
                });
            }
        });
        
        // Sort by area (prefer larger images) and position
        images.sort((a, b) => {
            if (a.isFirst && !b.isFirst) return -1;
            if (!a.isFirst && b.isFirst) return 1;
            return b.area - a.area;
        });
        
        return images[0]?.src || null;
    }

    extractLongText($container, selectors) {
        let texts = [];
        
        for (const selector of selectors) {
            $container.find(selector).each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 20) {
                    texts.push(text);
                }
            });
        }
        
        // Return the longest text found
        return texts.sort((a, b) => b.length - a.length)[0] || null;
    }

    extractContactInfo($container) {
        const contacts = [];
        
        // Look for phone numbers
        const phoneRegex = /(\+43|0)\s?\d{1,4}\s?\d{1,10}/g;
        const text = $container.text();
        const phones = text.match(phoneRegex);
        if (phones) {
            contacts.push(...phones.slice(0, 2)); // Max 2 phone numbers
        }
        
        // Look for email addresses
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex);
        if (emails) {
            contacts.push(...emails.slice(0, 1)); // Max 1 email
        }
        
        return contacts.length > 0 ? contacts.join(', ') : null;
    }

    extractExpandedLocation($, $container) {
        // Try to find location/address information that might be in dropdowns or expandable sections
        const locationTexts = [];
        
        // Look for common patterns for expandable location sections
        const locationSelectors = [
            // Direct location/venue selectors
            '.veranstaltungsort', '.location-details', '.venue-details',
            '[class*="veranstaltungsort"]', '[class*="location-detail"]',
            
            // Dropdown/collapsible content
            '.accordion-content', '.collapse-content', '.dropdown-content',
            '[class*="accordion"] [class*="content"]',
            '[class*="collapse"] [class*="body"]',
            '[class*="dropdown"] [class*="content"]',
            
            // Tab content that might contain location
            '.tab-content', '[role="tabpanel"]',
            
            // Details/summary elements
            'details', 'summary + *',
            
            // Common reveal patterns
            '[class*="reveal"]', '[class*="toggle-content"]',
            '[class*="expandable"]', '[class*="collapsible"]',
            
            // Info boxes
            '.info-box', '.detail-box', '[class*="info-box"]',
            
            // Specific German terms
            '.adresse', '.anschrift', '.standort',
            '[class*="adresse"]', '[class*="anschrift"]'
        ];
        
        for (const selector of locationSelectors) {
            $(selector).each((i, el) => {
                const $el = $(el);
                const text = $el.text().trim();
                
                // Look for address patterns (street, ZIP, city)
                if (text && (
                    text.match(/\d{4,5}\s+\w+/) || // ZIP code pattern
                    text.toLowerCase().includes('straße') ||
                    text.toLowerCase().includes('strasse') ||
                    text.toLowerCase().includes('platz') ||
                    text.toLowerCase().includes('weg') ||
                    text.toLowerCase().includes('gasse') ||
                    text.includes(',') // Often addresses have commas
                )) {
                    // Clean up the text
                    const cleanedText = text
                        .replace(/\s+/g, ' ')
                        .replace(/[\n\r]+/g, ', ')
                        .substring(0, 200);
                    
                    if (cleanedText.length > 10) {
                        locationTexts.push(cleanedText);
                    }
                }
            });
        }
        
        // Also check for address microdata
        $('[itemtype*="PostalAddress"], [itemtype*="Place"]').each((i, el) => {
            const $el = $(el);
            const street = $el.find('[itemprop="streetAddress"]').text().trim();
            const locality = $el.find('[itemprop="addressLocality"]').text().trim();
            const postalCode = $el.find('[itemprop="postalCode"]').text().trim();
            
            if (street || locality || postalCode) {
                const parts = [street, postalCode, locality].filter(p => p);
                if (parts.length > 0) {
                    locationTexts.push(parts.join(', '));
                }
            }
        });
        
        // Return the most complete location found
        if (locationTexts.length > 0) {
            // Sort by length (longer = more complete) and return the longest
            return locationTexts.sort((a, b) => b.length - a.length)[0];
        }
        
        return null;
    }

    extractExpandedContactInfo($, $container) {
        const contacts = new Set(); // Use Set to avoid duplicates
        
        // First, get basic contact info
        const basicContacts = this.extractContactInfo($container);
        if (basicContacts) {
            basicContacts.split(', ').forEach(c => contacts.add(c));
        }
        
        // Look for contact info in expandable/dropdown sections
        const contactSelectors = [
            // Direct contact selectors
            '.kontakt', '.contact', '.contact-info',
            '[class*="kontakt"]', '[class*="contact"]',
            
            // Dropdown/expandable content
            '.accordion-content', '.collapse-content',
            '[class*="accordion"] [class*="content"]',
            '[class*="dropdown"] [class*="content"]',
            
            // Details sections
            'details', '[class*="details"]',
            
            // Info sections
            '.info', '.information',
            '[class*="info"]', '[class*="information"]',
            
            // German specific
            '.ansprechpartner', '.veranstalter',
            '[class*="ansprechpartner"]', '[class*="veranstalter"]'
        ];
        
        // Enhanced phone regex to catch more formats
        const phoneRegex = /(?:\+43|0043|0)[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const websiteRegex = /(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g;
        
        for (const selector of contactSelectors) {
            $(selector).each((i, el) => {
                const text = $(el).text();
                
                // Extract phones
                const phones = text.match(phoneRegex);
                if (phones) {
                    phones.slice(0, 2).forEach(phone => {
                        // Clean up phone number
                        const cleaned = phone.replace(/\s+/g, ' ').trim();
                        if (cleaned.length >= 7) { // Minimum valid phone length
                            contacts.add(cleaned);
                        }
                    });
                }
                
                // Extract emails
                const emails = text.match(emailRegex);
                if (emails) {
                    emails.slice(0, 2).forEach(email => {
                        // Filter out common non-contact emails
                        if (!email.includes('example') && !email.includes('domain')) {
                            contacts.add(email.toLowerCase());
                        }
                    });
                }
                
                // Extract website (if no email found)
                if (contacts.size < 3) {
                    const websites = text.match(websiteRegex);
                    if (websites) {
                        websites.slice(0, 1).forEach(site => {
                            if (!site.includes('.png') && !site.includes('.jpg') && 
                                !site.includes('.css') && !site.includes('.js')) {
                                contacts.add('Web: ' + site);
                            }
                        });
                    }
                }
            });
        }
        
        // Also check for contact microdata
        $('[itemtype*="Organization"], [itemtype*="Person"]').each((i, el) => {
            const $el = $(el);
            const phone = $el.find('[itemprop="telephone"]').text().trim();
            const email = $el.find('[itemprop="email"]').text().trim();
            const url = $el.find('[itemprop="url"]').attr('href');
            
            if (phone) contacts.add(phone);
            if (email) contacts.add(email);
            if (url && !url.includes('schladming-dachstein.at')) {
                contacts.add('Web: ' + url);
            }
        });
        
        // Convert Set back to string
        const contactArray = Array.from(contacts);
        return contactArray.length > 0 ? contactArray.slice(0, 4).join(', ') : null;
    }

    extractDateFromContainer($container) {
        // Look for date patterns in various formats
        const text = $container.text();
        const dates = [];
        
        // German date format (DD.MM.YYYY or DD.MM.)
        const germanDatePattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/g;
        let match;
        
        while ((match = germanDatePattern.exec(text)) !== null) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
            
            const date = new Date(year, month, day);
            if (date > new Date() - 2 * 24 * 60 * 60 * 1000) { // Not older than 2 days
                dates.push(date);
            }
        }
        
        // ISO format
        const isoDatePattern = /(\d{4})-(\d{2})-(\d{2})/g;
        while ((match = isoDatePattern.exec(text)) !== null) {
            const date = new Date(match[0]);
            if (!isNaN(date.getTime()) && date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                dates.push(date);
            }
        }
        
        // If we found multiple dates, return them all
        if (dates.length > 0) {
            // Remove duplicates and sort
            const uniqueDates = [...new Set(dates.map(d => d.toISOString()))].map(d => new Date(d));
            uniqueDates.sort((a, b) => a - b);
            
            return {
                startDate: uniqueDates[0],
                endDate: uniqueDates.length > 1 ? uniqueDates[uniqueDates.length - 1] : null,
                allDates: uniqueDates
            };
        }
        
        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { startDate: tomorrow, endDate: null, allDates: [tomorrow] };
    }

    extractText($el, selectors) {
        for (const selector of selectors) {
            const text = $el.find(selector).first().text().trim();
            if (text && text.length > 2) {
                return text;
            }
        }
        return null;
    }

    generateExternalIdFromUrl(href) {
        const match = href.match(/_ev_(\d+)$/);
        if (match) {
            return `schladming_ev_${match[1]}`;
        }
        
        // Create a stable ID from the URL
        const urlParts = href.split('/').filter(p => p);
        const lastPart = urlParts[urlParts.length - 1];
        return `schladming_${lastPart.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
    }

    extractCategory(name, description, $container) {
        const text = `${name || ''} ${description || ''} ${$container.text() || ''}`.toLowerCase();
        
        const categories = {
            'music': ['konzert', 'musik', 'band', 'live', 'dj', 'party'],
            'sports': ['sport', 'ski', 'wandern', 'lauf', 'rennen', 'wettkampf', 'fitness'],
            'culture': ['kultur', 'ausstellung', 'theater', 'kunst', 'museum', 'lesung'],
            'family': ['familie', 'kinder', 'kids', 'familien'],
            'culinary': ['kulinarik', 'essen', 'genuss', 'wein', 'bier', 'verkostung', 'restaurant'],
            'market': ['markt', 'fest', 'messe', 'basar'],
            'wellness': ['wellness', 'yoga', 'meditation', 'entspannung', 'spa'],
            'nature': ['natur', 'wanderung', 'berg', 'alm', 'outdoor']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    cleanText(text) {
        if (!text) return null;
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .substring(0, 1000);
    }

    isValidEvent(eventData) {
        return eventData && 
               eventData.name && 
               eventData.name.length > 3 && 
               eventData.start_date &&
               eventData.external_id;
    }

    async createMockEvents() {
        logger.info('🎭 Creating mock events as fallback...');
        
        const mockEvents = [
            {
                external_id: 'mock_planai_sunset_skiing',
                name: 'Sunset Skiing auf der Planai',
                description: 'Erleben Sie unvergessliche Abfahrten bei Sonnenuntergang auf der Planai. Mit spektakulärem Bergpanorama und perfekt präparierten Pisten.',
                location: 'Planai Bergstation, Schladming',
                start_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                end_date: null,
                image_url: SOURCE_LOGO,
                source_url: 'https://www.schladming-dachstein.at',
                category: 'sports',
                is_featured: true,
                price_info: 'Im Skipass enthalten'
            },
            {
                external_id: 'mock_ramsau_christmas_market',
                name: 'Ramsauer Christkindlmarkt',
                description: 'Traditioneller Weihnachtsmarkt mit regionalen Köstlichkeiten, Handwerk und weihnachtlicher Stimmung.',
                location: 'Dorfplatz Ramsau',
                start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                end_date: null,
                image_url: SOURCE_LOGO,
                source_url: 'https://www.schladming-dachstein.at',
                category: 'market',
                is_featured: false,
                price_info: 'Eintritt frei'
            }
        ];

        const savedEvents = [];
        for (const eventData of mockEvents) {
            try {
                const savedEvent = await Event.upsert(eventData);
                savedEvents.push(savedEvent);
            } catch (error) {
                logger.warn(`Error saving mock event: ${error.message}`);
            }
        }

        return savedEvents;
    }

    async testScraping() {
        try {
            logger.info('🧪 Testing event scraping...');
            const response = await this.respectfulRequest(EVENTS_URL);
            logger.info(`✅ Successfully connected to ${EVENTS_URL}`);
            logger.info(`📄 Page content length: ${response.data.length} characters`);
            
            const $ = cheerio.load(response.data);
            logger.info(`🔍 Page title: ${$('title').text()}`);
            logger.info(`🔗 Found ${$('a[href*="_ev_"]').length} event links`);
            logger.info(`🖼️  Found ${$('img').length} images on page`);
            
            return true;
        } catch (error) {
            logger.error('❌ Test scraping failed:', error.message);
            return false;
        }
    }
}

export default EventScraperService;