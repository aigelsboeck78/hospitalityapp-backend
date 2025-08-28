import pool from '../config/database.js';

export class Event {
    constructor(data) {
        this.id = data.id;
        this.external_id = data.external_id;
        this.name = data.name;
        this.description = data.description;
        this.location = data.location;
        this.start_date = data.start_date;
        this.end_date = data.end_date;
        this.image_url = data.image_url;
        this.source_url = data.source_url;
        this.category = data.category;
        this.is_featured = data.is_featured;
        this.is_active = data.is_active;
        this.price_info = data.price_info;
        this.contact_info = data.contact_info;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT * FROM events
            WHERE is_active = true
        `;
        
        const params = [];
        let paramCount = 0;

        // Add date filters
        if (filters.startDate) {
            paramCount++;
            query += ` AND start_date >= $${paramCount}`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            paramCount++;
            query += ` AND start_date <= $${paramCount}`;
            params.push(filters.endDate);
        }

        // Add category filter
        if (filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
        }

        // Add featured filter
        if (filters.featured) {
            query += ` AND is_featured = true`;
        }

        query += ` ORDER BY start_date ASC`;

        // Add limit
        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => new Event(row));
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM events WHERE id = $1',
            [id]
        );
        
        return result.rows.length > 0 ? new Event(result.rows[0]) : null;
    }

    static async findByExternalId(externalId) {
        const result = await pool.query(
            'SELECT * FROM events WHERE external_id = $1',
            [externalId]
        );
        
        return result.rows.length > 0 ? new Event(result.rows[0]) : null;
    }

    static async create(eventData) {
        const result = await pool.query(`
            INSERT INTO events (
                external_id, name, description, location, start_date, end_date,
                image_url, source_url, category, is_featured, price_info, contact_info
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            eventData.external_id,
            eventData.name,
            eventData.description,
            eventData.location,
            eventData.start_date,
            eventData.end_date,
            eventData.image_url,
            eventData.source_url,
            eventData.category,
            eventData.is_featured || false,
            eventData.price_info,
            eventData.contact_info
        ]);

        return new Event(result.rows[0]);
    }

    static async update(id, eventData) {
        const result = await pool.query(`
            UPDATE events SET
                name = $2,
                description = $3,
                location = $4,
                start_date = $5,
                end_date = $6,
                image_url = $7,
                source_url = $8,
                category = $9,
                is_featured = $10,
                price_info = $11,
                contact_info = $12,
                is_active = $13
            WHERE id = $1
            RETURNING *
        `, [
            id,
            eventData.name,
            eventData.description,
            eventData.location,
            eventData.start_date,
            eventData.end_date,
            eventData.image_url,
            eventData.source_url,
            eventData.category,
            eventData.is_featured,
            eventData.price_info,
            eventData.contact_info,
            eventData.is_active
        ]);

        return result.rows.length > 0 ? new Event(result.rows[0]) : null;
    }

    static async upsert(eventData) {
        // Try to find existing event by external_id
        const existing = await this.findByExternalId(eventData.external_id);
        
        if (existing) {
            // Update existing event
            return await this.update(existing.id, eventData);
        } else {
            // Create new event
            return await this.create(eventData);
        }
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );
        
        return result.rows.length > 0 ? new Event(result.rows[0]) : null;
    }

    static async getTodaysEvents() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const result = await pool.query(`
            SELECT * FROM events
            WHERE is_active = true
            AND ((start_date >= $1 AND start_date <= $2)
                OR (end_date >= $1 AND end_date <= $2)
                OR (start_date <= $1 AND (end_date >= $2 OR end_date IS NULL)))
            ORDER BY start_date ASC
        `, [startOfDay, endOfDay]);

        return result.rows.map(row => new Event(row));
    }

    static async getUpcomingEvents(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        const result = await pool.query(`
            SELECT * FROM events
            WHERE is_active = true
            AND start_date >= $1
            AND start_date <= $2
            ORDER BY start_date ASC
        `, [today, futureDate]);

        return result.rows.map(row => new Event(row));
    }

    static async getFeaturedEvents() {
        const result = await pool.query(`
            SELECT * FROM events
            WHERE is_active = true
            AND is_featured = true
            ORDER BY start_date ASC
            LIMIT 10
        `);

        return result.rows.map(row => new Event(row));
    }

    static async deleteOldEvents(cutoffDate) {
        // Delete events that are older than the cutoff date
        const result = await pool.query(`
            DELETE FROM events
            WHERE start_date < $1
            AND is_featured = false
            RETURNING id
        `, [cutoffDate]);

        return result.rowCount;
    }
}

export default Event;