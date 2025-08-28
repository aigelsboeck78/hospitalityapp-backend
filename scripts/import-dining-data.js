import fs from 'fs';
import csv from 'csv-parser';
import pg from 'pg';

const { Pool } = pg;

// Create a new pool connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vacation_rental_hospitality',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123'
});

const importDiningData = async () => {
    const diningPlaces = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('../schladming_dining_database.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Convert CSV row to database format
                const place = {
                    name_de: row.Name_DE,
                    name_en: row.Name_EN,
                    category: row.Category,
                    location_area: row.Location_Area,
                    street_address: row.Street_Address,
                    postal_code: row.Postal_Code,
                    city: row.City,
                    altitude_m: row.Altitude_m ? parseInt(row.Altitude_m) : null,
                    phone: row.Phone !== 'NULL' ? row.Phone : null,
                    website: row.Website !== 'NULL' ? row.Website : null,
                    email: row.Email !== 'NULL' ? row.Email : null,
                    hours_winter: row.Hours_Winter !== 'NULL' ? row.Hours_Winter : null,
                    hours_summer: row.Hours_Summer !== 'NULL' ? row.Hours_Summer : null,
                    cuisine_type: row.Cuisine_Type,
                    price_range: parseInt(row.Price_Range),
                    capacity_indoor: row.Capacity_Indoor ? parseInt(row.Capacity_Indoor) : null,
                    capacity_outdoor: row.Capacity_Outdoor ? parseInt(row.Capacity_Outdoor) : null,
                    capacity_total: row.Capacity_Total ? parseInt(row.Capacity_Total) : null,
                    awards: row.Awards !== 'NULL' ? row.Awards : null,
                    accessibility: row.Accessibility,
                    parking: row.Parking === 'Yes',
                    family_friendly: row.Family_Friendly === 'Yes',
                    vegetarian: row.Vegetarian === 'Yes',
                    vegan: row.Vegan === 'Yes' || row.Vegan === 'Limited',
                    gluten_free: row.Gluten_Free === 'Yes' || row.Gluten_Free === 'Limited',
                    reservations_required: row.Reservations_Required === 'Yes' || row.Reservations_Required === 'Recommended',
                    season_recommendation: row.Season_Recommendation,
                    relevance_status: row.Relevance_Status,
                    image_url: row.Image_URL !== 'NULL' ? row.Image_URL : null,
                    latitude: row.Latitude ? parseFloat(row.Latitude) : null,
                    longitude: row.Longitude ? parseFloat(row.Longitude) : null
                };
                diningPlaces.push(place);
            })
            .on('end', async () => {
                console.log(`Read ${diningPlaces.length} dining places from CSV`);
                
                try {
                    // Test connection and schema
                    const schemaTest = await pool.query(`
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = 'dining_places' 
                        AND column_name = 'name_de'
                    `);
                    console.log('Schema check - name_de exists:', schemaTest.rows.length > 0);
                    
                    // Clear existing data
                    await pool.query('TRUNCATE TABLE dining_places CASCADE');
                    console.log('Cleared existing dining places');
                    
                    // Insert new data
                    for (const place of diningPlaces) {
                        const query = `
                            INSERT INTO dining_places (
                                name_de, name_en, category, location_area, street_address,
                                postal_code, city, altitude_m, phone, website, email,
                                hours_winter, hours_summer, cuisine_type, price_range,
                                capacity_indoor, capacity_outdoor, capacity_total, awards,
                                accessibility, parking, family_friendly, vegetarian, vegan,
                                gluten_free, reservations_required, season_recommendation,
                                relevance_status, image_url, latitude, longitude
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                                $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
                                $25, $26, $27, $28, $29, $30, $31
                            )
                        `;
                        
                        const values = [
                            place.name_de, place.name_en, place.category, place.location_area,
                            place.street_address, place.postal_code, place.city, place.altitude_m,
                            place.phone, place.website, place.email, place.hours_winter,
                            place.hours_summer, place.cuisine_type, place.price_range,
                            place.capacity_indoor, place.capacity_outdoor, place.capacity_total,
                            place.awards, place.accessibility, place.parking, place.family_friendly,
                            place.vegetarian, place.vegan, place.gluten_free, place.reservations_required,
                            place.season_recommendation, place.relevance_status, place.image_url,
                            place.latitude, place.longitude
                        ];
                        
                        await pool.query(query, values);
                    }
                    
                    console.log(`Successfully imported ${diningPlaces.length} dining places`);
                    resolve();
                } catch (error) {
                    console.error('Error importing data:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV:', error);
                reject(error);
            });
    });
};

// Run the import
importDiningData()
    .then(async () => {
        console.log('Import completed successfully');
        await pool.end();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('Import failed:', error);
        await pool.end();
        process.exit(1);
    });