import cron from 'node-cron';
import EventScraperService from './eventScraperService.js';

const eventScraper = new EventScraperService();

class CronService {
    constructor() {
        this.jobs = [];
    }

    startEventScrapingJob() {
        // Run daily at 3:00 AM
        const job = cron.schedule('0 3 * * *', async () => {
            console.log('🕒 Starting scheduled event scraping...');
            try {
                await eventScraper.scrapeEvents();
                console.log('✅ Scheduled event scraping completed successfully');
            } catch (error) {
                console.error('❌ Scheduled event scraping failed:', error);
            }
        }, {
            scheduled: false, // Don't start immediately
            timezone: "Europe/Vienna"
        });

        this.jobs.push({ name: 'eventScraping', job });
        
        console.log('📅 Event scraping cron job configured (daily at 3:00 AM CET)');
        return job;
    }

    // Also run on server startup after a delay
    scheduleInitialEventScraping() {
        setTimeout(async () => {
            console.log('🚀 Running initial event scraping on startup...');
            try {
                await eventScraper.scrapeEvents();
                console.log('✅ Initial event scraping completed');
            } catch (error) {
                console.error('❌ Initial event scraping failed:', error);
            }
        }, 30000); // Wait 30 seconds after server startup
    }

    startAllJobs() {
        console.log('🎯 Starting all cron jobs...');
        
        this.jobs.forEach(({ name, job }) => {
            job.start();
            console.log(`✅ Started cron job: ${name}`);
        });

        // Schedule initial scraping
        this.scheduleInitialEventScraping();
    }

    stopAllJobs() {
        console.log('🛑 Stopping all cron jobs...');
        
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            console.log(`🛑 Stopped cron job: ${name}`);
        });
    }

    getJobStatus() {
        return this.jobs.map(({ name, job }) => ({
            name,
            running: job.running
        }));
    }

    // Manual trigger for testing
    async triggerEventScraping() {
        console.log('🔧 Manually triggering event scraping...');
        try {
            const events = await eventScraper.scrapeEvents();
            console.log(`✅ Manual scraping completed, found ${events.length} events`);
            return events;
        } catch (error) {
            console.error('❌ Manual scraping failed:', error);
            throw error;
        }
    }
}

export default new CronService();