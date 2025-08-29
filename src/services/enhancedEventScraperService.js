import axios from 'axios';
import * as cheerio from 'cheerio';
import Event from '../models/Event.js';
import { logger } from '../middleware/errorHandler.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.schladming-dachstein.at';
const EVENTS_URL = `${BASE_URL}/de/Alle-Veranstaltungen`;
const SOURCE_LOGO = `${BASE_URL}/static/img/logo.svg`;

export class EnhancedEventScraperService {
    constructor() {
        this.axiosConfig = {
            timeout: 20000,
            headers: {
                'User-Agent': 'ChaletMoments-Hospitality-Bot/2.0 (Respectful Event Aggregator; contact: info@chaletmoments.com)',
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
        this.minDelayBetweenRequests = 1500;
        this.maxDelayBetweenRequests = 3000;
        
        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour
        
        // Batch processing
        this.batchSize = 3;
        this.failedExtractions = [];
    }
    
    // Enhanced respectful request with caching
    async respectfulRequest(url, retries = 3, useCache = true) {
        // Check cache first
        if (useCache && this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                logger.info(`📦 Using cached response for ${url}`);
                return { data: cached.data };
            }
        }
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Rate limiting with randomized delay
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                const randomDelay = this.minDelayBetweenRequests + 
                    Math.random() * (this.maxDelayBetweenRequests - this.minDelayBetweenRequests);
                
                if (timeSinceLastRequest < randomDelay) {
                    const delayNeeded = Math.ceil(randomDelay - timeSinceLastRequest);
                    logger.info(`⏱️  Rate limiting: waiting ${delayNeeded}ms`);
                    await new Promise(resolve => setTimeout(resolve, delayNeeded));
                }
                
                this.lastRequestTime = Date.now();
                logger.info(`🔍 Fetching ${url} (attempt ${attempt}/${retries})`);
                
                const response = await axios.get(url, this.axiosConfig);
                
                // Cache successful response
                if (useCache) {
                    this.cache.set(url, {
                        data: response.data,
                        timestamp: Date.now()
                    });
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                return response;
                
            } catch (error) {
                logger.warn(`⚠️  Attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
                
                if (error.response?.status === 429) {
                    const backoffDelay = 30000 * attempt;
                    logger.warn(`🚫 Rate limited! Waiting ${backoffDelay/1000}s`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                } else if (attempt < retries) {
                    const backoffDelay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
                    logger.info(`🔄 Retrying in ${backoffDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                } else {
                    throw error;
                }
            }
        }
    }
    
    // Clean up old events
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

    // IMPROVEMENT 1: Dynamic pagination detection
    async detectPagination($) {
        const paginationInfo = {
            totalPages: 1,
            currentPage: 1,
            hasNext: false,
            nextUrl: null,
            pageUrls: []
        };
        
        // Look for pagination elements
        const paginationSelectors = [
            '.pagination', '.pager', '.page-numbers',
            '[class*="pagination"]', '[class*="pager"]',
            'nav[aria-label*="pagination"]', 'nav[role="navigation"]',
            '.navigation', '[class*="page-nav"]'
        ];
        
        for (const selector of paginationSelectors) {
            const $pagination = $(selector).first();
            if ($pagination.length) {
                // Find page links
                const pageLinks = $pagination.find('a[href*="page"], a[href*="seite"]');
                pageLinks.each((i, el) => {
                    const href = $(el).attr('href');
                    const pageNum = parseInt($(el).text());
                    if (!isNaN(pageNum)) {
                        paginationInfo.totalPages = Math.max(paginationInfo.totalPages, pageNum);
                        const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
                        paginationInfo.pageUrls.push({ page: pageNum, url: fullUrl });
                    }
                });
                
                // Check for next button
                const $next = $pagination.find('a:contains("weiter"), a:contains("next"), a.next, [aria-label*="next"]');
                if ($next.length) {
                    paginationInfo.hasNext = true;
                    const nextHref = $next.attr('href');
                    paginationInfo.nextUrl = nextHref?.startsWith('http') ? nextHref : BASE_URL + nextHref;
                }
                
                // Get current page
                const $current = $pagination.find('.active, .current, [aria-current="page"]');
                if ($current.length) {
                    const currentText = $current.text().trim();
                    const currentNum = parseInt(currentText);
                    if (!isNaN(currentNum)) {
                        paginationInfo.currentPage = currentNum;
                    }
                }
                
                break;
            }
        }
        
        // Fallback: check URL parameters
        if (paginationInfo.totalPages === 1) {
            $('a[href*="?page="], a[href*="&page="]').each((i, el) => {
                const href = $(el).attr('href');
                const match = href.match(/page=(\d+)/);
                if (match) {
                    const pageNum = parseInt(match[1]);
                    paginationInfo.totalPages = Math.max(paginationInfo.totalPages, pageNum);
                }
            });
        }
        
        logger.info(`📄 Detected pagination: ${paginationInfo.totalPages} pages total`);
        return paginationInfo;
    }

    // IMPROVEMENT 2: Enhanced event link detection
    findEventLinks($) {
        const eventLinks = new Map(); // Use Map to avoid duplicates by URL
        
        // Multiple strategies for finding event links
        
        // Strategy 1: Original _ev_ pattern
        $('a[href*="_ev_"]').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && text && text.length > 3) {
                const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
                eventLinks.set(href, { url: fullUrl, href, text, element: el });
            }
        });
        
        // Strategy 2: Event containers
        const containerSelectors = [
            '.event-item', '.event-teaser', '.veranstaltung',
            'article.event', '[class*="event-card"]', '[class*="event-list"]',
            '.list-item', '.teaser-item'
        ];
        
        containerSelectors.forEach(selector => {
            $(selector).each((i, container) => {
                const $container = $(container);
                const $link = $container.find('a[href*="/de/"], a[href*="/veranstaltungen/"], a[href*="/events/"]').first();
                if ($link.length) {
                    const href = $link.attr('href');
                    const text = $container.find('h1, h2, h3, h4, .title').first().text().trim() || 
                               $link.text().trim();
                    if (href && text && !href.includes('#') && !href.includes('javascript:')) {
                        const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
                        eventLinks.set(href, { url: fullUrl, href, text, element: container });
                    }
                }
            });
        });
        
        // Strategy 3: Links with event-related text
        $('a').each((i, el) => {
            const $link = $(el);
            const href = $link.attr('href');
            const text = $link.text().trim();
            
            // Check if link text contains event indicators
            if (href && text && (
                text.match(/\d{1,2}\.\d{1,2}\./) || // Date pattern
                text.toLowerCase().includes('konzert') ||
                text.toLowerCase().includes('veranstaltung') ||
                text.toLowerCase().includes('event') ||
                text.toLowerCase().includes('fest') ||
                text.toLowerCase().includes('markt') ||
                text.toLowerCase().includes('ausstellung')
            )) {
                // Filter out navigation/category links
                if (!href.includes('/kategorie/') && 
                    !href.includes('/filter/') && 
                    !href.includes('#') &&
                    !eventLinks.has(href)) {
                    const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
                    eventLinks.set(href, { url: fullUrl, href, text, element: el });
                }
            }
        });
        
        return Array.from(eventLinks.values());
    }

    // IMPROVEMENT 3: Enhanced date/time extraction
    extractEnhancedDates(text, $container = null) {
        const dates = [];
        const times = [];
        
        // Handle relative dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const relativeDateMap = {
            'heute': today,
            'morgen': tomorrow,
            'übermorgen': new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        };
        
        // Check for relative dates
        const lowerText = text.toLowerCase();
        for (const [key, date] of Object.entries(relativeDateMap)) {
            if (lowerText.includes(key)) {
                dates.push(new Date(date));
            }
        }
        
        // German date patterns with various formats
        const datePatterns = [
            // DD.MM.YYYY or DD.MM.YY
            /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g,
            // DD. Month YYYY
            /(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s*(\d{4})?/gi,
            // Date ranges: 1.-3. März
            /(\d{1,2})\.-(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/gi
        ];
        
        const monthMap = {
            'januar': 0, 'februar': 1, 'märz': 2, 'april': 3,
            'mai': 4, 'juni': 5, 'juli': 6, 'august': 7,
            'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11
        };
        
        // Extract dates
        for (const pattern of datePatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (pattern === datePatterns[0]) {
                    // DD.MM.YYYY format
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1;
                    const year = match[3] ? 
                        (match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3])) : 
                        new Date().getFullYear();
                    
                    const date = new Date(year, month, day);
                    if (date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                        dates.push(date);
                    }
                } else if (pattern === datePatterns[1]) {
                    // DD. Month YYYY format
                    const day = parseInt(match[1]);
                    const monthName = match[2].toLowerCase();
                    const month = monthMap[monthName];
                    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
                    
                    if (month !== undefined) {
                        const date = new Date(year, month, day);
                        if (date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                            dates.push(date);
                        }
                    }
                } else if (pattern === datePatterns[2]) {
                    // Date range format
                    const startDay = parseInt(match[1]);
                    const endDay = parseInt(match[2]);
                    const monthName = match[3].toLowerCase();
                    const month = monthMap[monthName];
                    const year = new Date().getFullYear();
                    
                    if (month !== undefined) {
                        for (let day = startDay; day <= endDay; day++) {
                            const date = new Date(year, month, day);
                            if (date > new Date() - 2 * 24 * 60 * 60 * 1000) {
                                dates.push(date);
                            }
                        }
                    }
                }
            }
        }
        
        // Extract times (HH:MM format)
        const timePattern = /(\d{1,2}):(\d{2})(?:\s*Uhr)?/g;
        let timeMatch;
        while ((timeMatch = timePattern.exec(text)) !== null) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                times.push({ hours, minutes });
            }
        }
        
        // Handle recurring patterns
        const recurringPatterns = [
            /jeden\s+(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)/gi,
            /täglich/gi,
            /wöchentlich/gi
        ];
        
        let isRecurring = false;
        for (const pattern of recurringPatterns) {
            if (pattern.test(text)) {
                isRecurring = true;
                break;
            }
        }
        
        // Check datetime attributes if container provided
        if ($container) {
            $container.find('[datetime], [data-date], time').each((i, el) => {
                const datetime = $(el).attr('datetime') || $(el).attr('data-date');
                if (datetime) {
                    const date = new Date(datetime);
                    if (!isNaN(date.getTime())) {
                        dates.push(date);
                    }
                }
            });
        }
        
        // Remove duplicates and sort
        const uniqueDates = [...new Set(dates.map(d => d.toISOString()))].map(d => new Date(d));
        uniqueDates.sort((a, b) => a - b);
        
        return {
            dates: uniqueDates,
            times: times,
            isRecurring: isRecurring,
            startDate: uniqueDates[0] || null,
            endDate: uniqueDates.length > 1 ? uniqueDates[uniqueDates.length - 1] : null
        };
    }

    // IMPROVEMENT 4: Schladming-specific selectors
    extractSchladmingEventData($, url) {
        const eventData = {};
        
        // Schladming-specific selectors
        const schladmingSelectors = {
            title: [
                '.event-detail-title', '.veranstaltung-titel',
                'h1.title', '.page-title', '[class*="event-name"]',
                '[data-event-title]', '.detail-headline'
            ],
            description: [
                '.event-detail-content', '.veranstaltung-beschreibung',
                '.detail-text', '.event-description', '[class*="event-text"]',
                '[data-event-description]', '.content-block'
            ],
            location: [
                '.event-location', '.veranstaltung-ort',
                '.venue-info', '[class*="location-info"]',
                '[data-venue]', '.detail-location'
            ],
            date: [
                '.event-date', '.veranstaltung-datum',
                '.date-info', '[class*="event-when"]',
                '[data-event-date]', '.detail-date'
            ],
            price: [
                '.event-price', '.veranstaltung-preis',
                '.ticket-info', '[class*="price-info"]',
                '[data-price]', '.detail-price'
            ],
            contact: [
                '.event-contact', '.veranstaltung-kontakt',
                '.organizer-info', '[class*="contact-info"]',
                '[data-organizer]', '.detail-contact'
            ],
            booking: [
                '.booking-section', '.ticket-link',
                'a[href*="ticket"]', 'a[href*="anmeldung"]',
                '[data-booking-url]', '.detail-booking'
            ],
            category: [
                '.event-category', '.veranstaltung-kategorie',
                '.breadcrumb', '[class*="event-type"]',
                '[data-category]', '.detail-category'
            ]
        };
        
        // Extract data using Schladming-specific selectors
        for (const [field, selectors] of Object.entries(schladmingSelectors)) {
            for (const selector of selectors) {
                const $element = $(selector).first();
                if ($element.length) {
                    const value = field === 'booking' ? 
                        $element.attr('href') || $element.find('a').attr('href') :
                        $element.text().trim();
                    
                    if (value) {
                        eventData[field] = value;
                        break;
                    }
                }
            }
        }
        
        // Extract from meta tags
        eventData.ogTitle = $('meta[property="og:title"]').attr('content');
        eventData.ogDescription = $('meta[property="og:description"]').attr('content');
        eventData.ogImage = $('meta[property="og:image"]').attr('content');
        
        return eventData;
    }

    // IMPROVEMENT 5: Enhanced image handling
    async extractAndStoreImage($, baseUrl, eventTitle) {
        let imageUrl = null;
        
        // Priority 1: Open Graph image
        imageUrl = $('meta[property="og:image"]').attr('content');
        
        // Priority 2: JSON-LD structured data
        if (!imageUrl) {
            try {
                const jsonLd = $('script[type="application/ld+json"]').html();
                if (jsonLd) {
                    const data = JSON.parse(jsonLd);
                    imageUrl = data.image || data.thumbnailUrl;
                }
            } catch (e) {}
        }
        
        // Priority 3: Gallery/slideshow images
        if (!imageUrl) {
            const gallerySelectors = [
                '.gallery img', '.slideshow img', '.slider img',
                '[class*="gallery"] img', '[class*="slideshow"] img',
                '.event-images img', '.detail-images img'
            ];
            
            for (const selector of gallerySelectors) {
                const $img = $(selector).first();
                if ($img.length) {
                    imageUrl = $img.attr('src') || $img.attr('data-src');
                    if (imageUrl) break;
                }
            }
        }
        
        // Priority 4: Main content image
        if (!imageUrl) {
            const contentSelectors = [
                'main img', 'article img', '.content img',
                '.event-detail img', '.detail-image img'
            ];
            
            for (const selector of contentSelectors) {
                const $imgs = $(selector);
                $imgs.each((i, img) => {
                    const src = $(img).attr('src') || $(img).attr('data-src');
                    const alt = $(img).attr('alt') || '';
                    
                    // Skip logos, icons, avatars
                    if (src && !src.includes('logo') && !src.includes('icon') && 
                        !src.includes('avatar') && !alt.toLowerCase().includes('logo')) {
                        imageUrl = src;
                        return false; // break each loop
                    }
                });
                if (imageUrl) break;
            }
        }
        
        // Make URL absolute
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, baseUrl).href;
        }
        
        // Try to download and store locally
        if (imageUrl && process.env.STORE_IMAGES_LOCALLY === 'true') {
            try {
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
                const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
                const filename = `${hash}${ext}`;
                const localPath = path.join(__dirname, '../../public/event-images', filename);
                
                await fs.mkdir(path.dirname(localPath), { recursive: true });
                await fs.writeFile(localPath, response.data);
                
                // Return local URL
                return `/event-images/${filename}`;
            } catch (error) {
                logger.warn(`Failed to download image: ${error.message}`);
            }
        }
        
        return imageUrl || SOURCE_LOGO;
    }

    // IMPROVEMENT 6: Category detection from breadcrumbs and URL
    extractCategory($, url, title = '', description = '') {
        let category = null;
        
        // Check breadcrumbs
        const breadcrumbSelectors = [
            '.breadcrumb', '.breadcrumbs', 'nav[aria-label*="breadcrumb"]',
            '[class*="breadcrumb"]', '.navigation-path'
        ];
        
        for (const selector of breadcrumbSelectors) {
            const $breadcrumb = $(selector).first();
            if ($breadcrumb.length) {
                const items = [];
                $breadcrumb.find('a, span').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text && !text.includes('Home') && !text.includes('Start')) {
                        items.push(text);
                    }
                });
                if (items.length > 0) {
                    category = items[items.length - 1]; // Last non-home item
                    break;
                }
            }
        }
        
        // Check URL path
        if (!category) {
            const urlParts = url.split('/');
            const categoryKeywords = [
                'konzert', 'sport', 'kultur', 'fest', 'markt',
                'ausstellung', 'theater', 'musik', 'familie', 'kinder'
            ];
            
            for (const part of urlParts) {
                const lower = part.toLowerCase();
                for (const keyword of categoryKeywords) {
                    if (lower.includes(keyword)) {
                        category = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                        break;
                    }
                }
                if (category) break;
            }
        }
        
        // Check badges/tags
        if (!category) {
            const tagSelectors = [
                '.event-tag', '.event-badge', '.category-tag',
                '[class*="event-type"]', '[class*="category"]'
            ];
            
            for (const selector of tagSelectors) {
                const $tag = $(selector).first();
                if ($tag.length) {
                    category = $tag.text().trim();
                    break;
                }
            }
        }
        
        // Fallback: keyword analysis
        if (!category) {
            const text = (title + ' ' + description).toLowerCase();
            const categoryMap = {
                'Konzert': ['konzert', 'musik', 'band', 'live'],
                'Sport': ['sport', 'ski', 'lauf', 'rennen', 'wettkampf'],
                'Kultur': ['kultur', 'theater', 'ausstellung', 'lesung'],
                'Familie': ['kinder', 'familie', 'familienfreundlich'],
                'Markt': ['markt', 'messe', 'basar', 'flohmarkt'],
                'Fest': ['fest', 'feier', 'party', 'feiern']
            };
            
            for (const [cat, keywords] of Object.entries(categoryMap)) {
                if (keywords.some(keyword => text.includes(keyword))) {
                    category = cat;
                    break;
                }
            }
        }
        
        return category || 'Sonstiges';
    }

    // IMPROVEMENT 7: Enhanced price extraction
    extractEnhancedPrice($, text = '') {
        const priceInfo = {
            price: null,
            currency: 'EUR',
            isFree: false,
            priceRange: null,
            discounts: []
        };
        
        // Check for free events
        const freePatterns = [
            /eintritt\s*frei/i, /kostenlos/i, /gratis/i,
            /freier\s*eintritt/i, /keine\s*kosten/i
        ];
        
        for (const pattern of freePatterns) {
            if (pattern.test(text)) {
                priceInfo.isFree = true;
                priceInfo.price = 0;
                return priceInfo;
            }
        }
        
        // Extract price ranges
        const rangePattern = /€?\s*(\d+(?:[.,]\d{2})?)\s*(?:-|bis)\s*€?\s*(\d+(?:[.,]\d{2})?)/;
        const rangeMatch = text.match(rangePattern);
        if (rangeMatch) {
            const minPrice = parseFloat(rangeMatch[1].replace(',', '.'));
            const maxPrice = parseFloat(rangeMatch[2].replace(',', '.'));
            priceInfo.priceRange = { min: minPrice, max: maxPrice };
            priceInfo.price = minPrice; // Use minimum as default
        }
        
        // Extract single prices
        if (!priceInfo.price) {
            const pricePattern = /€?\s*(\d+(?:[.,]\d{2})?)\s*€?/;
            const priceMatch = text.match(pricePattern);
            if (priceMatch) {
                priceInfo.price = parseFloat(priceMatch[1].replace(',', '.'));
            }
        }
        
        // Extract discounts
        const discountPatterns = [
            /kinder(?:\s*bis\s*\d+\s*jahre?)?\s*(?:€?\s*(\d+(?:[.,]\d{2})?)|frei)/i,
            /ermäßigt\s*€?\s*(\d+(?:[.,]\d{2})?)/i,
            /studenten\s*€?\s*(\d+(?:[.,]\d{2})?)/i,
            /senioren\s*€?\s*(\d+(?:[.,]\d{2})?)/i
        ];
        
        const discountTypes = ['Kinder', 'Ermäßigt', 'Studenten', 'Senioren'];
        
        discountPatterns.forEach((pattern, index) => {
            const match = text.match(pattern);
            if (match) {
                const discountPrice = match[1] ? parseFloat(match[1].replace(',', '.')) : 0;
                priceInfo.discounts.push({
                    type: discountTypes[index],
                    price: discountPrice
                });
            }
        });
        
        // Check sold out status
        if (/ausverkauft|sold\s*out|keine\s*tickets/i.test(text)) {
            priceInfo.soldOut = true;
        }
        
        return priceInfo;
    }

    // IMPROVEMENT 8: Enhanced location extraction with GPS
    extractEnhancedLocation($) {
        const location = {
            name: null,
            address: null,
            city: 'Schladming',
            postalCode: null,
            coordinates: null,
            indoor: null,
            capacity: null
        };
        
        // Extract from structured data
        try {
            const jsonLd = $('script[type="application/ld+json"]').html();
            if (jsonLd) {
                const data = JSON.parse(jsonLd);
                if (data.location) {
                    location.name = data.location.name;
                    if (data.location.address) {
                        location.address = data.location.address.streetAddress;
                        location.city = data.location.address.addressLocality;
                        location.postalCode = data.location.address.postalCode;
                    }
                    if (data.location.geo) {
                        location.coordinates = {
                            lat: data.location.geo.latitude,
                            lng: data.location.geo.longitude
                        };
                    }
                }
            }
        } catch (e) {}
        
        // Extract from microdata
        const $venue = $('[itemtype*="Place"], [itemtype*="PostalAddress"]').first();
        if ($venue.length) {
            location.name = $venue.find('[itemprop="name"]').text().trim() || location.name;
            location.address = $venue.find('[itemprop="streetAddress"]').text().trim() || location.address;
            location.city = $venue.find('[itemprop="addressLocality"]').text().trim() || location.city;
            location.postalCode = $venue.find('[itemprop="postalCode"]').text().trim() || location.postalCode;
        }
        
        // Extract from Google Maps links
        $('a[href*="maps.google"], a[href*="google.com/maps"]').each((i, el) => {
            const href = $(el).attr('href');
            const coordMatch = href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) {
                location.coordinates = {
                    lat: parseFloat(coordMatch[1]),
                    lng: parseFloat(coordMatch[2])
                };
            }
        });
        
        // Check for indoor/outdoor indicators
        const venueText = $('.venue-info, .location-details').text().toLowerCase();
        if (venueText.includes('indoor') || venueText.includes('halle') || venueText.includes('saal')) {
            location.indoor = true;
        } else if (venueText.includes('outdoor') || venueText.includes('freien') || venueText.includes('platz')) {
            location.indoor = false;
        }
        
        // Extract capacity if mentioned
        const capacityMatch = venueText.match(/(\d+)\s*(?:plätze|personen|besucher)/i);
        if (capacityMatch) {
            location.capacity = parseInt(capacityMatch[1]);
        }
        
        return location;
    }

    // IMPROVEMENT 9: Booking status integration
    extractBookingInfo($) {
        const booking = {
            url: null,
            status: 'available',
            availableTickets: null,
            deadline: null,
            provider: null,
            requiresRegistration: false
        };
        
        // Find booking/ticket links
        const bookingSelectors = [
            'a[href*="ticket"]', 'a[href*="anmeldung"]', 'a[href*="reservierung"]',
            '.ticket-button', '.booking-link', '[class*="ticket-link"]',
            'a:contains("Tickets")', 'a:contains("Anmelden")', 'a:contains("Buchen")'
        ];
        
        for (const selector of bookingSelectors) {
            const $link = $(selector).first();
            if ($link.length) {
                booking.url = $link.attr('href');
                if (booking.url && !booking.url.startsWith('http')) {
                    booking.url = BASE_URL + booking.url;
                }
                
                // Extract provider from URL
                if (booking.url) {
                    const url = new URL(booking.url);
                    booking.provider = url.hostname.replace('www.', '');
                }
                break;
            }
        }
        
        // Check availability status
        const statusSelectors = [
            '.ticket-status', '.availability', '[class*="ticket-availability"]'
        ];
        
        for (const selector of statusSelectors) {
            const $status = $(selector).first();
            if ($status.length) {
                const statusText = $status.text().toLowerCase();
                if (statusText.includes('ausverkauft') || statusText.includes('sold out')) {
                    booking.status = 'sold_out';
                } else if (statusText.includes('wenige') || statusText.includes('limited')) {
                    booking.status = 'limited';
                } else if (statusText.includes('verfügbar') || statusText.includes('available')) {
                    booking.status = 'available';
                }
                
                // Extract number of available tickets
                const ticketMatch = statusText.match(/(\d+)\s*(?:tickets?|karten?|plätze?)/i);
                if (ticketMatch) {
                    booking.availableTickets = parseInt(ticketMatch[1]);
                }
            }
        }
        
        // Check for registration requirement
        if ($('*:contains("Anmeldung erforderlich")').length || 
            $('*:contains("Registration required")').length) {
            booking.requiresRegistration = true;
        }
        
        // Extract deadline
        const deadlinePatterns = [
            /anmeldung\s*bis\s*(\d{1,2}\.\d{1,2}\.(?:\d{4})?)/i,
            /deadline[:\s]*(\d{1,2}\.\d{1,2}\.(?:\d{4})?)/i
        ];
        
        const pageText = $('body').text();
        for (const pattern of deadlinePatterns) {
            const match = pageText.match(pattern);
            if (match) {
                booking.deadline = match[1];
                break;
            }
        }
        
        return booking;
    }

    // IMPROVEMENT 10: Performance optimization with batch processing
    async processBatch(links, $) {
        const results = [];
        const batch = links.slice(0, this.batchSize);
        
        // Process batch concurrently with controlled concurrency
        const promises = batch.map(async (link, index) => {
            // Add staggered delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, index * 500));
            
            try {
                return await this.extractEventFromLink(link, $);
            } catch (error) {
                logger.warn(`Failed to extract event from ${link.url}: ${error.message}`);
                this.failedExtractions.push(link);
                return null;
            }
        });
        
        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter(r => r !== null));
        
        return results;
    }

    // Main scraping method with all improvements
    async scrapeEvents(maxPages = null) {
        try {
            logger.info('🚀 Starting enhanced event scraping from schladming-dachstein.at...');
            
            // Clean up old events first
            await this.cleanupOldEvents();
            
            const allEvents = [];
            let currentPage = 1;
            let hasMorePages = true;
            
            // First page - detect pagination
            const firstPageResponse = await this.respectfulRequest(EVENTS_URL);
            const $ = cheerio.load(firstPageResponse.data);
            
            const paginationInfo = await this.detectPagination($);
            const totalPages = maxPages || paginationInfo.totalPages || 5;
            
            logger.info(`📄 Will scrape up to ${totalPages} pages`);
            
            // Process first page
            const firstPageEvents = await this.scrapePage($, EVENTS_URL, 1);
            allEvents.push(...firstPageEvents);
            
            // Process remaining pages
            for (let page = 2; page <= totalPages && hasMorePages; page++) {
                const pageUrl = `${EVENTS_URL}?page=${page}`;
                
                try {
                    const response = await this.respectfulRequest(pageUrl);
                    const $page = cheerio.load(response.data);
                    
                    const pageEvents = await this.scrapePage($page, pageUrl, page);
                    
                    if (pageEvents.length === 0) {
                        logger.info(`📄 No events found on page ${page}, stopping`);
                        hasMorePages = false;
                    } else {
                        allEvents.push(...pageEvents);
                        logger.info(`✅ Found ${pageEvents.length} events on page ${page}`);
                    }
                    
                    // Add delay between pages
                    if (page < totalPages) {
                        const delay = 2000 + Math.random() * 2000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                } catch (error) {
                    logger.error(`Failed to scrape page ${page}: ${error.message}`);
                }
            }
            
            // Retry failed extractions once
            if (this.failedExtractions.length > 0) {
                logger.info(`🔄 Retrying ${this.failedExtractions.length} failed extractions...`);
                const retryLinks = [...this.failedExtractions];
                this.failedExtractions = [];
                
                for (const link of retryLinks) {
                    try {
                        const event = await this.extractEventFromLink(link, null);
                        if (event) {
                            allEvents.push(event);
                        }
                    } catch (error) {
                        logger.warn(`Retry failed for ${link.url}`);
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
            
            // Clear cache after successful scrape
            this.cache.clear();
            
            return savedEvents;
            
        } catch (error) {
            logger.error('❌ Enhanced event scraping failed:', error);
            throw error;
        }
    }

    // Process a single page
    async scrapePage($, pageUrl, pageNumber) {
        try {
            const events = [];
            
            // Find all event links using enhanced detection
            const eventLinks = this.findEventLinks($);
            
            logger.info(`🎯 Found ${eventLinks.length} potential events on page ${pageNumber}`);
            
            // Process in batches
            for (let i = 0; i < eventLinks.length; i += this.batchSize) {
                const batch = eventLinks.slice(i, i + this.batchSize);
                const batchEvents = await this.processBatch(batch, $);
                events.push(...batchEvents);
                
                // Add delay between batches
                if (i + this.batchSize < eventLinks.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            return events.flat(); // Flatten in case of multiple dates per event
            
        } catch (error) {
            logger.error(`Error scraping page ${pageUrl}: ${error.message}`);
            return [];
        }
    }

    // Extract event from a link
    async extractEventFromLink(link, $listingPage) {
        try {
            // Try to extract from listing page first
            let eventData = {};
            
            if ($listingPage && link.element) {
                const $container = $listingPage(link.element).closest('article, .event-item, .teaser-item');
                
                // Extract basic info from listing
                eventData.name = this.extractText($container, [
                    'h1', 'h2', 'h3', '.title', '.event-title'
                ]) || link.text;
                
                eventData.description = this.extractText($container, [
                    '.description', '.summary', '.teaser-text', 'p'
                ]);
                
                const dateInfo = this.extractEnhancedDates($container.text(), $container);
                eventData.start_date = dateInfo.startDate;
                eventData.end_date = dateInfo.endDate;
                eventData.dates = dateInfo.dates;
                eventData.times = dateInfo.times;
            }
            
            // Fetch detail page for complete information
            const response = await this.respectfulRequest(link.url);
            const $ = cheerio.load(response.data);
            
            // Extract using Schladming-specific selectors
            const schladmingData = this.extractSchladmingEventData($, link.url);
            
            // Merge data
            eventData = { ...eventData, ...schladmingData };
            
            // Extract enhanced date/time if not already found
            if (!eventData.start_date) {
                const dateInfo = this.extractEnhancedDates($('body').text(), $('body'));
                eventData.start_date = dateInfo.startDate;
                eventData.end_date = dateInfo.endDate;
                eventData.dates = dateInfo.dates;
                eventData.times = dateInfo.times;
            }
            
            // Extract image
            eventData.image_url = await this.extractAndStoreImage($, link.url, eventData.name);
            
            // Extract category
            eventData.category = this.extractCategory($, link.url, eventData.name, eventData.description);
            
            // Extract price info
            const priceText = $('.price, .ticket-info, [class*="price"]').text() || $('body').text();
            const priceInfo = this.extractEnhancedPrice($, priceText);
            eventData.price = priceInfo.price;
            eventData.price_info = JSON.stringify(priceInfo);
            
            // Extract location
            const locationInfo = this.extractEnhancedLocation($);
            eventData.location = locationInfo.name || locationInfo.address || locationInfo.city;
            eventData.location_details = JSON.stringify(locationInfo);
            
            // Extract booking info
            const bookingInfo = this.extractBookingInfo($);
            eventData.booking_url = bookingInfo.url;
            eventData.booking_info = JSON.stringify(bookingInfo);
            
            // Generate external ID
            eventData.external_id = this.generateExternalId(link.url, eventData.start_date);
            eventData.source_url = link.url;
            
            // Handle multiple dates (create separate events)
            if (eventData.dates && eventData.dates.length > 1) {
                const events = [];
                for (const date of eventData.dates) {
                    events.push({
                        ...eventData,
                        start_date: date,
                        end_date: null,
                        external_id: this.generateExternalId(link.url, date)
                    });
                }
                return events;
            }
            
            return eventData;
            
        } catch (error) {
            logger.error(`Error extracting event from ${link.url}: ${error.message}`);
            throw error;
        }
    }

    // Helper methods
    extractText($container, selectors) {
        for (const selector of selectors) {
            const text = $container.find(selector).first().text().trim();
            if (text && text.length > 3) {
                return this.cleanText(text);
            }
        }
        return null;
    }

    cleanText(text) {
        if (!text) return null;
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim()
            .substring(0, 5000);
    }

    generateExternalId(url, date = null) {
        const baseId = crypto.createHash('md5')
            .update(url)
            .digest('hex')
            .substring(0, 12);
        
        if (date) {
            const dateStr = date.toISOString().split('T')[0];
            return `schladming_${baseId}_${dateStr}`;
        }
        
        return `schladming_${baseId}`;
    }

    isValidEvent(eventData) {
        return eventData && 
               eventData.name && 
               eventData.name.length > 3 &&
               eventData.start_date &&
               eventData.start_date instanceof Date &&
               !isNaN(eventData.start_date.getTime());
    }
}

export default EnhancedEventScraperService;