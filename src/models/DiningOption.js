import pool from '../config/database.js';

export class DiningOption {
    constructor(data) {
        this.id = data.id;
        this.external_id = data.external_id;
        this.name_de = data.name_de;
        this.name_en = data.name_en;
        this.category = data.category;
        this.location_area = data.location_area;
        this.street_address = data.street_address;
        this.postal_code = data.postal_code;
        this.city = data.city;
        this.altitude_m = data.altitude_m;
        this.phone = data.phone;
        this.website = data.website;
        this.email = data.email;
        this.hours_winter = data.hours_winter;
        this.hours_summer = data.hours_summer;
        this.cuisine_type = data.cuisine_type;
        this.price_range = data.price_range;
        this.capacity_indoor = data.capacity_indoor;
        this.capacity_outdoor = data.capacity_outdoor;
        this.capacity_total = data.capacity_total;
        this.awards = data.awards;
        this.accessibility = data.accessibility;
        this.parking = data.parking;
        this.family_friendly = data.family_friendly;
        this.vegetarian = data.vegetarian;
        this.vegan = data.vegan;
        this.gluten_free = data.gluten_free;
        this.reservations_required = data.reservations_required;
        this.season_recommendation = data.season_recommendation;
        this.relevance_status = data.relevance_status;
        this.image_url = data.image_url;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.is_active = data.is_active;
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

        // Add category filter
        if (filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
        }

        // Add location area filter
        if (filters.location_area) {
            paramCount++;
            query += ` AND location_area = $${paramCount}`;
            params.push(filters.location_area);
        }

        // Add cuisine type filter
        if (filters.cuisine_type) {
            paramCount++;
            query += ` AND cuisine_type = $${paramCount}`;
            params.push(filters.cuisine_type);
        }

        // Add price range filter
        if (filters.price_range) {
            paramCount++;
            query += ` AND price_range <= $${paramCount}`;
            params.push(filters.price_range);
        }

        // Add dietary filters
        if (filters.vegetarian) {
            query += ` AND vegetarian = true`;
        }
        if (filters.vegan) {
            query += ` AND vegan = true`;
        }
        if (filters.gluten_free) {
            query += ` AND gluten_free = true`;
        }

        // Add family friendly filter
        if (filters.family_friendly) {
            query += ` AND family_friendly = true`;
        }

        // Add season filter
        if (filters.season) {
            paramCount++;
            query += ` AND (season_recommendation = $${paramCount} OR season_recommendation = 'Year_Round')`;
            params.push(filters.season);
        }

        // Add relevance filter
        if (filters.relevance_status) {
            paramCount++;
            query += ` AND relevance_status = $${paramCount}`;
            params.push(filters.relevance_status);
        }

        // Add search query
        if (filters.search) {
            paramCount++;
            query += ` AND (
                name_de ILIKE $${paramCount} OR 
                name_en ILIKE $${paramCount} OR 
                cuisine_type ILIKE $${paramCount} OR 
                location_area ILIKE $${paramCount}
            )`;
            params.push(`%${filters.search}%`);
        }

        // Add sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':
                    query += ` ORDER BY price_range ASC NULLS LAST`;
                    break;
                case 'price_desc':
                    query += ` ORDER BY price_range DESC NULLS LAST`;
                    break;
                case 'name':
                    query += ` ORDER BY name_en ASC`;
                    break;
                case 'relevance':
                    query += ` ORDER BY 
                        CASE relevance_status 
                            WHEN 'Must_See' THEN 1 
                            WHEN 'Highly_Recommended' THEN 2 
                            WHEN 'Recommended' THEN 3 
                            WHEN 'Popular' THEN 4 
                            ELSE 5 
                        END ASC`;
                    break;
                default:
                    query += ` ORDER BY relevance_status ASC, name_en ASC`;
            }
        } else {
            query += ` ORDER BY relevance_status ASC, name_en ASC`;
        }

        // Add limit
        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => new DiningOption(row));
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM dining_places WHERE id = $1',
            [id]
        );
        
        return result.rows.length > 0 ? new DiningOption(result.rows[0]) : null;
    }

    static async findByExternalId(externalId) {
        const result = await pool.query(
            'SELECT * FROM dining_places WHERE external_id = $1',
            [externalId]
        );
        
        return result.rows.length > 0 ? new DiningOption(result.rows[0]) : null;
    }

    static async getRecommendations(guestProfile = {}, weather = {}) {
        const { 
            adults = 2, 
            children = 0, 
            dietary_preferences = [],
            budget = 'medium',
            interests = []
        } = guestProfile;

        const { 
            condition = 'sunny',
            temperature = 20,
            season = 'summer'
        } = weather;

        let query = `
            SELECT d.* FROM dining_places d
            WHERE d.is_active = true
        `;
        
        const params = [];
        let paramCount = 0;

        // Filter by season
        const currentMonth = new Date().getMonth() + 1;
        const isWinterSeason = currentMonth >= 11 || currentMonth <= 4;
        const seasonFilter = isWinterSeason ? 'Winter' : 'Summer';
        
        query += ` AND (
            d.season_recommendation LIKE '%${seasonFilter}%' OR 
            d.season_recommendation = 'Year_Round'
        )`;

        // Filter by operating hours
        if (isWinterSeason) {
            query += ` AND d.hours_winter NOT IN ('Closed', 'Closed_Winter')`;
        } else {
            query += ` AND d.hours_summer NOT IN ('Closed', 'Closed_Summer')`;
        }

        // Family friendly filter if children present
        if (children > 0) {
            query += ` AND d.family_friendly = true`;
        }

        // Dietary preferences
        if (dietary_preferences.includes('vegetarian')) {
            query += ` AND d.vegetarian = true`;
        }
        if (dietary_preferences.includes('vegan')) {
            query += ` AND d.vegan = true`;
        }
        if (dietary_preferences.includes('gluten_free')) {
            query += ` AND d.gluten_free = true`;
        }

        // Budget filter
        let maxPrice = 5;
        switch (budget) {
            case 'budget':
                maxPrice = 2;
                break;
            case 'medium':
                maxPrice = 3;
                break;
            case 'luxury':
                maxPrice = 5;
                break;
        }
        query += ` AND (d.price_range <= ${maxPrice} OR d.price_range IS NULL)`;

        // Weather-based recommendations
        if (weather.condition === 'rain' || weather.temperature < 10) {
            // Prefer indoor dining in bad weather
            query += ` AND d.capacity_indoor > 0`;
        } else if (weather.temperature > 20 && weather.condition === 'sunny') {
            // Prefer outdoor dining in good weather
            query += ` AND d.capacity_outdoor > 0`;
        }

        // Interest-based filtering
        if (interests.includes('fine_dining')) {
            query += ` AND d.category IN ('Fine_Dining', 'Gourmet_Hut')`;
        }
        if (interests.includes('traditional')) {
            query += ` AND d.cuisine_type LIKE '%Traditional%'`;
        }
        if (interests.includes('mountain_experience')) {
            query += ` AND d.category IN ('Mountain_Hut', 'Alpine_Hut', 'Mountain_Restaurant')`;
        }

        // Prioritize by relevance
        query += ` ORDER BY 
            CASE d.relevance_status 
                WHEN 'Must_See' THEN 1 
                WHEN 'Highly_Recommended' THEN 2 
                WHEN 'Recommended' THEN 3 
                WHEN 'Popular' THEN 4 
                ELSE 5 
            END ASC,
            d.name_en ASC
            LIMIT 10
        `;

        const result = await pool.query(query, params);
        return result.rows.map(row => new DiningOption(row));
    }

    static async getCategories() {
        const result = await pool.query(`
            SELECT DISTINCT category, COUNT(*) as count
            FROM dining_places
            WHERE is_active = true
            GROUP BY category
            ORDER BY category
        `);
        return result.rows;
    }

    static async getCuisineTypes() {
        const result = await pool.query(`
            SELECT DISTINCT cuisine_type, COUNT(*) as count
            FROM dining_places
            WHERE is_active = true AND cuisine_type IS NOT NULL
            GROUP BY cuisine_type
            ORDER BY cuisine_type
        `);
        return result.rows;
    }

    static async getLocationAreas() {
        const result = await pool.query(`
            SELECT DISTINCT location_area, COUNT(*) as count
            FROM dining_places
            WHERE is_active = true AND location_area IS NOT NULL
            GROUP BY location_area
            ORDER BY location_area
        `);
        return result.rows;
    }

    static async create(diningData) {
        const result = await pool.query(`
            INSERT INTO dining_places (
                external_id, name_de, name_en, category, location_area,
                street_address, postal_code, city, altitude_m, phone,
                website, email, hours_winter, hours_summer, cuisine_type,
                price_range, capacity_indoor, capacity_outdoor, capacity_total,
                awards, accessibility, parking, family_friendly, vegetarian,
                vegan, gluten_free, reservations_required, season_recommendation,
                relevance_status, image_url, latitude, longitude
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                    $31, $32)
            RETURNING *
        `, [
            diningData.external_id,
            diningData.name_de,
            diningData.name_en,
            diningData.category,
            diningData.location_area,
            diningData.street_address,
            diningData.postal_code,
            diningData.city,
            diningData.altitude_m,
            diningData.phone,
            diningData.website,
            diningData.email,
            diningData.hours_winter,
            diningData.hours_summer,
            diningData.cuisine_type,
            diningData.price_range,
            diningData.capacity_indoor,
            diningData.capacity_outdoor,
            diningData.capacity_total,
            diningData.awards,
            diningData.accessibility,
            diningData.parking,
            diningData.family_friendly,
            diningData.vegetarian,
            diningData.vegan,
            diningData.gluten_free,
            diningData.reservations_required,
            diningData.season_recommendation,
            diningData.relevance_status,
            diningData.image_url,
            diningData.latitude,
            diningData.longitude
        ]);

        return new DiningOption(result.rows[0]);
    }

    static async update(id, diningData) {
        const result = await pool.query(`
            UPDATE dining_places SET
                name_de = $2,
                name_en = $3,
                category = $4,
                location_area = $5,
                street_address = $6,
                postal_code = $7,
                city = $8,
                altitude_m = $9,
                phone = $10,
                website = $11,
                email = $12,
                hours_winter = $13,
                hours_summer = $14,
                cuisine_type = $15,
                price_range = $16,
                capacity_indoor = $17,
                capacity_outdoor = $18,
                capacity_total = $19,
                awards = $20,
                accessibility = $21,
                parking = $22,
                family_friendly = $23,
                vegetarian = $24,
                vegan = $25,
                gluten_free = $26,
                reservations_required = $27,
                season_recommendation = $28,
                relevance_status = $29,
                image_url = $30,
                latitude = $31,
                longitude = $32,
                is_active = $33,
                access_by_car = $34,
                access_by_cable_car = $35,
                access_by_hiking = $36,
                access_by_bike = $37,
                access_by_lift = $38,
                access_by_public_transport = $39,
                access_difficulty = $40,
                access_time_minutes = $41,
                access_notes = $42,
                event_type = $43,
                atmosphere = $44,
                target_guest_types = $45
            WHERE id = $1
            RETURNING *
        `, [
            id,
            diningData.name_de,
            diningData.name_en,
            diningData.category,
            diningData.location_area,
            diningData.street_address,
            diningData.postal_code,
            diningData.city,
            diningData.altitude_m,
            diningData.phone,
            diningData.website,
            diningData.email,
            diningData.hours_winter,
            diningData.hours_summer,
            diningData.cuisine_type,
            diningData.price_range,
            diningData.capacity_indoor,
            diningData.capacity_outdoor,
            diningData.capacity_total,
            diningData.awards,
            diningData.accessibility,
            diningData.parking,
            diningData.family_friendly,
            diningData.vegetarian,
            diningData.vegan,
            diningData.gluten_free,
            diningData.reservations_required,
            diningData.season_recommendation,
            diningData.relevance_status,
            diningData.image_url,
            diningData.latitude,
            diningData.longitude,
            diningData.is_active !== undefined ? diningData.is_active : true,
            diningData.access_by_car,
            diningData.access_by_cable_car,
            diningData.access_by_hiking,
            diningData.access_by_bike,
            diningData.access_by_lift,
            diningData.access_by_public_transport,
            diningData.access_difficulty,
            diningData.access_time_minutes,
            diningData.access_notes,
            diningData.event_type,
            diningData.atmosphere,
            // Handle target_guest_types - convert JSON array string to PostgreSQL array
            diningData.target_guest_types ? 
                (typeof diningData.target_guest_types === 'string' ? 
                    JSON.parse(diningData.target_guest_types) : 
                    diningData.target_guest_types) : 
                null
        ]);

        return result.rows.length > 0 ? new DiningOption(result.rows[0]) : null;
    }

    static async delete(id) {
        const result = await pool.query(
            'UPDATE dining_places SET is_active = false WHERE id = $1 RETURNING *',
            [id]
        );
        
        return result.rows.length > 0 ? new DiningOption(result.rows[0]) : null;
    }
}

export default DiningOption;