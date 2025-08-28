import pool from '../config/database.js';

class Activity {
  static async create(activityData) {
    const {
      property_id,
      title,
      description,
      image_url,
      activity_type,
      target_guest_types,
      location,
      contact_info,
      operating_hours,
      price_range,
      booking_required,
      booking_url,
      booking_phone,
      display_order,
      activity_labels,
      weather_suitability,
      title_de,
      description_de,
      multilingual_content
    } = activityData;

    const query = `
      INSERT INTO activities (
        property_id, title, description, image_url, activity_type, 
        target_guest_types, location, contact_info, operating_hours, 
        price_range, booking_required, booking_url, booking_phone, display_order,
        activity_labels, weather_suitability, title_de, description_de, multilingual_content
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      property_id, title, description, image_url, activity_type,
      target_guest_types, location, contact_info, operating_hours,
      price_range, booking_required, booking_url, booking_phone, display_order,
      activity_labels, weather_suitability, title_de, description_de, 
      multilingual_content ? JSON.stringify(multilingual_content) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM activities WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByProperty(propertyId) {
    const query = `
      SELECT * FROM activities 
      WHERE property_id = $1 
      ORDER BY display_order ASC, title ASC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async findByPropertyAndGuestType(propertyId, guestType) {
    const query = `
      SELECT * FROM activities 
      WHERE property_id = $1 
        AND is_active = true
        AND $2 = ANY(target_guest_types)
      ORDER BY display_order ASC, title ASC
    `;
    const result = await pool.query(query, [propertyId, guestType]);
    return result.rows;
  }

  static async update(id, activityData) {
    const {
      title,
      description,
      image_url,
      activity_type,
      target_guest_types,
      location,
      contact_info,
      operating_hours,
      price_range,
      booking_required,
      booking_url,
      booking_phone,
      is_active,
      display_order,
      activity_labels,
      weather_suitability,
      title_de,
      description_de,
      multilingual_content
    } = activityData;

    const query = `
      UPDATE activities 
      SET title = $2, description = $3, image_url = $4, activity_type = $5,
          target_guest_types = $6, location = $7, contact_info = $8,
          operating_hours = $9, price_range = $10, booking_required = $11,
          booking_url = $12, booking_phone = $13, is_active = $14, display_order = $15,
          activity_labels = $16, weather_suitability = $17, title_de = $18, 
          description_de = $19, multilingual_content = $20
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id, title, description, image_url, activity_type,
      target_guest_types, location, contact_info, operating_hours,
      price_range, booking_required, booking_url, booking_phone,
      is_active, display_order, activity_labels, weather_suitability, 
      title_de, description_de,
      multilingual_content ? JSON.stringify(multilingual_content) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM activities WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async updateDisplayOrder(id, displayOrder) {
    const query = `
      UPDATE activities 
      SET display_order = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, displayOrder]);
    return result.rows[0];
  }

  static async toggleActive(id) {
    const query = `
      UPDATE activities 
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Activity;