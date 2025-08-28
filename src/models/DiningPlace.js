import pool from '../config/database.js';

export class DiningPlace {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.cuisine_type = data.cuisine_type;
        this.price_range = data.price_range;
        this.location = data.location;
        this.address = data.address;
        this.phone = data.phone;
        this.website = data.website;
        this.opening_hours = data.opening_hours;
        this.rating = data.rating;
        this.image_url = data.image_url;
        this.is_featured = data.is_featured;
        this.is_active = data.is_active;
        this.reservation_required = data.reservation_required;
        this.reservation_url = data.reservation_url;
        this.tags = data.tags;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT * FROM dining_places
            WHERE is_active = true
        `;
        
        const params = [];
        let paramCount = 0;

        if (filters.cuisine_type) {
            paramCount++;
            query += ` AND cuisine_type = $${paramCount}`;
            params.push(filters.cuisine_type);
        }

        if (filters.price_range) {
            paramCount++;
            query += ` AND price_range = $${paramCount}`;
            params.push(filters.price_range);
        }

        if (filters.featured) {
            query += ` AND is_featured = true`;
        }

        query += ` ORDER BY is_featured DESC, rating DESC, name ASC`;

        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => new DiningPlace(row));
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM dining_places WHERE id = $1',
            [id]
        );
        
        return result.rows.length > 0 ? new DiningPlace(result.rows[0]) : null;
    }

    static async create(diningData) {
        const result = await pool.query(`
            INSERT INTO dining_places (
                name, description, cuisine_type, price_range, location, address,
                phone, website, opening_hours, rating, image_url, is_featured,
                reservation_required, reservation_url, tags
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            diningData.name,
            diningData.description,
            diningData.cuisine_type,
            diningData.price_range,
            diningData.location,
            diningData.address,
            diningData.phone,
            diningData.website,
            JSON.stringify(diningData.opening_hours),
            diningData.rating,
            diningData.image_url,
            diningData.is_featured || false,
            diningData.reservation_required || false,
            diningData.reservation_url,
            diningData.tags || []
        ]);

        return new DiningPlace(result.rows[0]);
    }

    static async update(id, diningData) {
        const result = await pool.query(`
            UPDATE dining_places SET
                name = $2,
                description = $3,
                cuisine_type = $4,
                price_range = $5,
                location = $6,
                address = $7,
                phone = $8,
                website = $9,
                opening_hours = $10,
                rating = $11,
                image_url = $12,
                is_featured = $13,
                is_active = $14,
                reservation_required = $15,
                reservation_url = $16,
                tags = $17,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [
            id,
            diningData.name,
            diningData.description,
            diningData.cuisine_type,
            diningData.price_range,
            diningData.location,
            diningData.address,
            diningData.phone,
            diningData.website,
            JSON.stringify(diningData.opening_hours),
            diningData.rating,
            diningData.image_url,
            diningData.is_featured,
            diningData.is_active,
            diningData.reservation_required,
            diningData.reservation_url,
            diningData.tags || []
        ]);

        return result.rows.length > 0 ? new DiningPlace(result.rows[0]) : null;
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM dining_places WHERE id = $1 RETURNING *',
            [id]
        );
        
        return result.rows.length > 0 ? new DiningPlace(result.rows[0]) : null;
    }

    static async getFeatured(limit = 6) {
        const result = await pool.query(`
            SELECT * FROM dining_places
            WHERE is_active = true AND is_featured = true
            ORDER BY rating DESC, name ASC
            LIMIT $1
        `, [limit]);

        return result.rows.map(row => new DiningPlace(row));
    }

    static async getByCuisineType(cuisineType, limit = 10) {
        const result = await pool.query(`
            SELECT * FROM dining_places
            WHERE is_active = true AND cuisine_type = $1
            ORDER BY rating DESC, name ASC
            LIMIT $2
        `, [cuisineType, limit]);

        return result.rows.map(row => new DiningPlace(row));
    }
}

export default DiningPlace;