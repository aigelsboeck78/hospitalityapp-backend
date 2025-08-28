import axios from 'axios';
import * as cheerio from 'cheerio';
import Event from '../models/Event.js';
import logger from '../utils/logger.js';

const BASE_URL = 'https://www.schladming-dachstein.at';
const EVENTS_URL = `${BASE_URL}/de/Alle-Veranstaltungen`;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

class ImprovedEventScraperService {
    constructor() {
        this.axiosInstance = axios.create({
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000
        });
    }

    async scrapeEvents(maxPages = 3) {
        try {
            logger.info('🔍 Starting improved event scraping from schladming-dachstein.at...');
            
            const allEvents = [];
            let currentPage = 1;
            
            while (currentPage <= maxPages) {
                logger.info(`📄 Scraping page ${currentPage}...`);
                
                const pageUrl = currentPage === 1 ? EVENTS_URL : `${EVENTS_URL}?page=${currentPage}`;
                const events = await this.scrapePage(pageUrl);
                
                if (events.length === 0) {
                    logger.info(`No more events found on page ${currentPage}`);
                    break;
                }
                
                allEvents.push(...events);
                logger.info(`✅ Found ${events.length} events on page ${currentPage}`);
                
                // Respectful delay between pages
                if (currentPage < maxPages) {
                    await this.delay(2000 + Math.random() * 1000);
                }
                
                currentPage++;
            }
            
            logger.info(`📅 Successfully scraped ${allEvents.length} total events`);
            
            // Save to database
            const savedEvents = await this.saveEvents(allEvents);
            logger.info(`💾 Successfully saved ${savedEvents.length} events to database`);
            
            return savedEvents;
        } catch (error) {
            logger.error('❌ Event scraping failed:', error);
            throw error;
        }
    }

    async scrapePage(pageUrl) {
        try {
            const response = await this.axiosInstance.get(pageUrl);
            const $ = cheerio.load(response.data);
            
            const events = [];
            const eventElements = $('.teaser, .event-item, .veranstaltung-item, article.event, [class*="event-card"]').toArray();
            
            for (const element of eventElements) {
                try {
                    const eventData = await this.extractEventFromElement($, element);
                    if (eventData) {
                        events.push(eventData);
                    }
                } catch (error) {
                    logger.warn(`Failed to extract event: ${error.message}`);
                }
            }
            
            return events;
        } catch (error) {
            logger.error(`Error scraping page ${pageUrl}:`, error.message);
            return [];
        }
    }

    async extractEventFromElement($, element) {
        const $elem = $(element);
        
        // Extract basic information
        const name = this.extractText($elem, 'h2, h3, h4, .title, .event-title, .teaser-title');
        if (!name) return null;
        
        // Extract link to detail page
        const link = $elem.find('a').first().attr('href');
        const fullUrl = link ? (link.startsWith('http') ? link : BASE_URL + link) : null;
        
        // Extract date and time with improved parsing
        const dateInfo = this.extractDateAndTime($elem, $);
        
        // Extract or fetch detailed information
        let detailData = {};
        if (fullUrl) {
            detailData = await this.fetchEventDetails(fullUrl);
            await this.delay(500); // Small delay between detail fetches
        }
        
        // Extract image with validation
        const imageUrl = await this.extractAndValidateImage($elem, $, detailData.imageUrl);
        
        // Build event object
        const eventData = {
            external_id: this.generateExternalId(fullUrl || name),
            name: this.cleanText(name),
            description: detailData.description || this.extractText($elem, '.description, .text, p'),
            location: detailData.location || this.extractText($elem, '.location, .ort, .venue'),
            start_date: dateInfo.startDate || detailData.startDate,
            end_date: dateInfo.endDate || detailData.endDate,
            image_url: imageUrl,
            source_url: fullUrl,
            category: this.extractCategory($elem, name),
            price_info: detailData.priceInfo || this.extractText($elem, '.price, .preis, .kosten'),
            contact_info: detailData.contactInfo,
            is_featured: false,
            is_active: true
        };
        
        // Validate event has required fields
        if (!eventData.name || !eventData.start_date) {
            return null;
        }
        
        return eventData;
    }

    async fetchEventDetails(url) {
        try {
            const response = await this.axiosInstance.get(url);
            const $ = cheerio.load(response.data);
            
            // Look for structured data first
            const structuredData = this.extractStructuredData($);
            
            // Extract detailed date and time from detail page
            const dateInfo = this.extractDetailedDateAndTime($);
            
            // Extract image from detail page
            const imageUrl = this.extractDetailPageImage($);
            
            // Extract other details
            const description = this.extractLongText($, '.event-description, .beschreibung, .content, main p');
            const location = this.extractLocation($);
            const priceInfo = this.extractPriceInfo($);
            const contactInfo = this.extractContactInfo($);
            
            return {
                ...structuredData,
                ...dateInfo,
                imageUrl: imageUrl || structuredData?.image,
                description: description || structuredData?.description,
                location: location || structuredData?.location,
                priceInfo: priceInfo || structuredData?.offers?.price,
                contactInfo
            };
        } catch (error) {
            logger.warn(`Failed to fetch details from ${url}: ${error.message}`);
            return {};
        }
    }

    extractDateAndTime($elem, $) {
        const text = $elem.text();
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // German date patterns with time
        const patterns = [
            // DD.MM.YYYY HH:MM
            /(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(?:um\s+)?(\d{1,2}):(\d{2})/g,
            // DD.MM. HH:MM
            /(\d{1,2})\.(\d{1,2})\.\s+(?:um\s+)?(\d{1,2}):(\d{2})/g,
            // DD. Month YYYY HH:MM
            /(\d{1,2})\.\s+(\w+)\s+(\d{4})\s+(?:um\s+)?(\d{1,2}):(\d{2})/g,
            // DD.MM.YYYY
            /(\d{1,2})\.(\d{1,2})\.(\d{4})/g,
            // DD.MM.
            /(\d{1,2})\.(\d{1,2})\./g
        ];
        
        for (const pattern of patterns) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                const match = matches[0];
                
                let day, month, year, hour = 0, minute = 0;
                
                if (match.length >= 6) {
                    // Pattern with time
                    day = parseInt(match[1]);
                    month = match[2].match(/\d+/) ? parseInt(match[2]) - 1 : this.getMonthNumber(match[2]);
                    year = match[3].length === 4 ? parseInt(match[3]) : currentYear;
                    hour = parseInt(match[4] || match[3]);
                    minute = parseInt(match[5] || match[4]);
                } else if (match.length >= 4) {
                    // Pattern without time
                    day = parseInt(match[1]);
                    month = match[2].match(/\d+/) ? parseInt(match[2]) - 1 : this.getMonthNumber(match[2]);
                    year = match[3] ? parseInt(match[3]) : currentYear;
                } else if (match.length >= 3) {
                    // DD.MM. pattern
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    year = currentYear;
                }
                
                const date = new Date(year, month, day, hour, minute);
                
                // Validate date is reasonable (not too far in past or future)
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                
                if (date >= oneMonthAgo && date <= oneYearFromNow) {
                    return { startDate: date, endDate: null };
                }
            }
        }
        
        // If no date found, return null
        return { startDate: null, endDate: null };
    }

    extractDetailedDateAndTime($) {
        // Look for date in specific containers on detail page
        const selectors = [
            '.event-date-time',
            '.datum-zeit',
            '.when',
            'time',
            '[itemprop="startDate"]',
            '.date-container',
            '.termin'
        ];
        
        for (const selector of selectors) {
            const $elem = $(selector).first();
            if ($elem.length) {
                const dateTime = $elem.attr('datetime') || $elem.text();
                const parsed = this.parseDateTimeString(dateTime);
                if (parsed) return parsed;
            }
        }
        
        // Look in the page text for date patterns
        const pageText = $('body').text();
        return this.extractDateAndTime({ text: () => pageText }, $);
    }

    parseDateTimeString(dateStr) {
        if (!dateStr) return null;
        
        // ISO date format
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(dateStr);
            if (!isNaN(date)) {
                return { startDate: date, endDate: null };
            }
        }
        
        // Try other formats
        const cleaned = dateStr.trim();
        const date = new Date(cleaned);
        if (!isNaN(date) && date.getFullYear() > 2020) {
            return { startDate: date, endDate: null };
        }
        
        return null;
    }

    async extractAndValidateImage($elem, $, detailImage) {
        // Priority order for image extraction
        const imageSources = [
            detailImage,
            $elem.find('img').first().attr('src'),
            $elem.find('img').first().attr('data-src'),
            $elem.find('[style*="background-image"]').first().css('background-image')?.match(/url\(['"]?(.+?)['"]?\)/)?.[1],
            $('meta[property="og:image"]').attr('content'),
            $('.event-image img').first().attr('src')
        ];
        
        for (let src of imageSources) {
            if (!src) continue;
            
            // Make URL absolute
            if (!src.startsWith('http')) {
                src = BASE_URL + (src.startsWith('/') ? '' : '/') + src;
            }
            
            // Validate image URL
            if (await this.isValidImageUrl(src)) {
                return src;
            }
        }
        
        // Return a default image if none found
        return '/uploads/default-event.jpg';
    }

    async isValidImageUrl(url) {
        try {
            const response = await this.axiosInstance.head(url, { timeout: 5000 });
            const contentType = response.headers['content-type'];
            return contentType && contentType.startsWith('image/');
        } catch {
            return false;
        }
    }

    extractDetailPageImage($) {
        // Try multiple strategies to find the main image
        const strategies = [
            () => $('meta[property="og:image"]').attr('content'),
            () => $('.event-image img, .hauptbild img, .main-image img').first().attr('src'),
            () => $('figure img').first().attr('src'),
            () => $('main img').not('[alt*="logo"]').first().attr('src'),
            () => {
                // Find largest image on page
                let largestImg = null;
                let largestSize = 0;
                
                $('img').each((i, img) => {
                    const $img = $(img);
                    const width = parseInt($img.attr('width') || 0);
                    const height = parseInt($img.attr('height') || 0);
                    const size = width * height;
                    
                    if (size > largestSize && !$img.attr('src')?.includes('logo')) {
                        largestSize = size;
                        largestImg = $img.attr('src');
                    }
                });
                
                return largestImg;
            }
        ];
        
        for (const strategy of strategies) {
            const url = strategy();
            if (url) {
                return url.startsWith('http') ? url : BASE_URL + url;
            }
        }
        
        return null;
    }

    extractStructuredData($) {
        const scripts = $('script[type="application/ld+json"]').toArray();
        
        for (const script of scripts) {
            try {
                const data = JSON.parse($(script).html());
                
                if (data['@type'] === 'Event' || data.type === 'Event') {
                    return {
                        name: data.name,
                        description: data.description,
                        startDate: data.startDate ? new Date(data.startDate) : null,
                        endDate: data.endDate ? new Date(data.endDate) : null,
                        location: data.location?.name || data.location?.address,
                        image: data.image,
                        offers: data.offers
                    };
                }
            } catch {
                continue;
            }
        }
        
        return {};
    }

    extractLocation($) {
        const selectors = [
            '.location',
            '.venue',
            '.ort',
            '[itemprop="location"]',
            '.adresse',
            '.event-location'
        ];
        
        for (const selector of selectors) {
            const text = this.extractText($, selector);
            if (text) return text;
        }
        
        return null;
    }

    extractPriceInfo($) {
        const selectors = [
            '.price',
            '.preis',
            '.eintritt',
            '.kosten',
            '.ticket-price',
            '[itemprop="price"]'
        ];
        
        for (const selector of selectors) {
            const text = this.extractText($, selector);
            if (text && (text.includes('€') || text.includes('EUR') || text.match(/\d/))) {
                return text;
            }
        }
        
        return null;
    }

    extractContactInfo($) {
        const info = [];
        
        // Phone
        const phone = this.extractText($, '.phone, .telefon, [href^="tel:"]');
        if (phone) info.push(`Tel: ${phone}`);
        
        // Email
        const email = this.extractText($, '.email, [href^="mailto:"]');
        if (email) info.push(`Email: ${email}`);
        
        // Website
        const website = this.extractText($, '.website, .webseite, .homepage');
        if (website) info.push(`Web: ${website}`);
        
        return info.length > 0 ? info.join(', ') : null;
    }

    extractCategory($elem, name) {
        const text = ($elem.text() + ' ' + name).toLowerCase();
        
        const categories = {
            'music': ['konzert', 'musik', 'band', 'live', 'festival'],
            'sport': ['sport', 'lauf', 'ski', 'bike', 'wandern', 'klettern'],
            'culture': ['kultur', 'theater', 'ausstellung', 'museum', 'kunst'],
            'culinary': ['kulinarik', 'essen', 'restaurant', 'verkostung', 'brunch'],
            'family': ['kinder', 'familie', 'family', 'kids'],
            'market': ['markt', 'basar', 'flohmarkt', 'handwerk'],
            'nature': ['natur', 'wanderung', 'führung', 'tour'],
            'wellness': ['wellness', 'yoga', 'meditation', 'entspannung']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    extractText($elem, selector) {
        if (typeof $elem === 'string') {
            // If $elem is actually a selector string
            selector = $elem;
            $elem = this.$;
        }
        
        const elem = selector ? $elem.find(selector).first() : $elem;
        return elem.text().trim() || null;
    }

    extractLongText($, selector) {
        const elements = $(selector);
        const texts = [];
        
        elements.each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 20) {
                texts.push(text);
            }
        });
        
        return texts.join('\n\n').substring(0, 2000); // Limit description length
    }

    cleanText(text) {
        if (!text) return null;
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    generateExternalId(url) {
        if (!url) return `event_${Date.now()}`;
        
        // Extract ID from URL if present
        const idMatch = url.match(/_ev_(\d+)/);
        if (idMatch) {
            return `schladming_ev_${idMatch[1]}`;
        }
        
        // Generate from URL
        const urlParts = url.split('/').filter(p => p);
        return `schladming_${urlParts[urlParts.length - 1]}`.substring(0, 100);
    }

    getMonthNumber(monthName) {
        const months = {
            'jänner': 0, 'januar': 0, 'january': 0,
            'februar': 1, 'february': 1,
            'märz': 2, 'march': 2,
            'april': 3,
            'mai': 4, 'may': 4,
            'juni': 5, 'june': 5,
            'juli': 6, 'july': 6,
            'august': 7,
            'september': 8,
            'oktober': 9, 'october': 9,
            'november': 10,
            'dezember': 11, 'december': 11
        };
        
        const lower = monthName.toLowerCase();
        return months[lower] !== undefined ? months[lower] : -1;
    }

    async saveEvents(events) {
        const savedEvents = [];
        
        for (const eventData of events) {
            try {
                const savedEvent = await Event.upsert(eventData);
                savedEvents.push(savedEvent);
            } catch (error) {
                logger.warn(`Failed to save event "${eventData.name}": ${error.message}`);
            }
        }
        
        return savedEvents;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new ImprovedEventScraperService();