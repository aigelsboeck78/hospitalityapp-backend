import pool from '../config/database.js';

class PropertyInformation {
    constructor(data) {
        this.id = data.id;
        this.property_id = data.property_id;
        this.category = data.category;
        this.type = data.type;
        this.title = data.title;
        this.description = data.description;
        this.instructions = data.instructions;
        this.icon = data.icon;
        this.url = data.url;
        this.display_order = data.display_order;
        this.is_active = data.is_active;
        this.metadata = data.metadata;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findByProperty(propertyId, activeOnly = false) {
        let query = `
            SELECT * FROM property_information 
            WHERE property_id = $1
        `;
        const params = [propertyId];

        if (activeOnly) {
            query += ' AND is_active = true';
        }

        query += ' ORDER BY display_order ASC, title ASC';

        const result = await pool.query(query, params);
        return result.rows.map(row => new PropertyInformation(row));
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM property_information WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? new PropertyInformation(result.rows[0]) : null;
    }

    static async findByPropertyAndType(propertyId, type) {
        const result = await pool.query(
            'SELECT * FROM property_information WHERE property_id = $1 AND type = $2',
            [propertyId, type]
        );
        return result.rows.length > 0 ? new PropertyInformation(result.rows[0]) : null;
    }

    static async create(data) {
        const result = await pool.query(`
            INSERT INTO property_information (
                property_id, category, type, title, description, 
                instructions, icon, url, display_order, is_active, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            data.property_id,
            data.category,
            data.type,
            data.title,
            data.description,
            data.instructions,
            data.icon,
            data.url,
            data.display_order || 0,
            data.is_active !== false,
            data.metadata || {}
        ]);
        return new PropertyInformation(result.rows[0]);
    }

    static async update(id, data) {
        const result = await pool.query(`
            UPDATE property_information SET
                category = COALESCE($2, category),
                type = COALESCE($3, type),
                title = COALESCE($4, title),
                description = COALESCE($5, description),
                instructions = COALESCE($6, instructions),
                icon = COALESCE($7, icon),
                url = COALESCE($8, url),
                display_order = COALESCE($9, display_order),
                is_active = COALESCE($10, is_active),
                metadata = COALESCE($11, metadata),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [
            id,
            data.category,
            data.type,
            data.title,
            data.description,
            data.instructions,
            data.icon,
            data.url,
            data.display_order,
            data.is_active,
            data.metadata
        ]);
        return result.rows.length > 0 ? new PropertyInformation(result.rows[0]) : null;
    }

    static async upsert(data) {
        // Try to find existing info by property_id and type
        const existing = await this.findByPropertyAndType(data.property_id, data.type);
        
        if (existing) {
            return await this.update(existing.id, data);
        } else {
            return await this.create(data);
        }
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM property_information WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows.length > 0 ? new PropertyInformation(result.rows[0]) : null;
    }

    static async toggleActive(id) {
        const result = await pool.query(`
            UPDATE property_information 
            SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id]);
        return result.rows.length > 0 ? new PropertyInformation(result.rows[0]) : null;
    }

    static async updateOrder(items) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const item of items) {
                await client.query(
                    'UPDATE property_information SET display_order = $2 WHERE id = $1',
                    [item.id, item.order]
                );
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getCategories() {
        const result = await pool.query(`
            SELECT DISTINCT category FROM property_information ORDER BY category
        `);
        return result.rows.map(row => row.category);
    }

    static async getTypes() {
        const result = await pool.query(`
            SELECT DISTINCT type FROM property_information ORDER BY type
        `);
        return result.rows.map(row => row.type);
    }
}

export default PropertyInformation;