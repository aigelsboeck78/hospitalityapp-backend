import pool from '../config/database.js';

class Property {
  static async create(propertyData) {
    const {
      name,
      address,
      wifi_ssid,
      wifi_password,
      welcome_message,
      house_rules,
      emergency_contact,
      checkout_instructions,
      shop_enabled,
      guest_profile_config
    } = propertyData;

    const query = `
      INSERT INTO properties (name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions, shop_enabled, guest_profile_config)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions, shop_enabled || false, guest_profile_config || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM properties WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM properties ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, propertyData) {
    const {
      name,
      address,
      wifi_ssid,
      wifi_password,
      welcome_message,
      house_rules,
      emergency_contact,
      checkout_instructions,
      shop_enabled,
      guest_profile_config
    } = propertyData;

    const query = `
      UPDATE properties 
      SET name = $2, address = $3, wifi_ssid = $4, wifi_password = $5, 
          welcome_message = $6, house_rules = $7, emergency_contact = $8, 
          checkout_instructions = $9, shop_enabled = $10, guest_profile_config = $11, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions, shop_enabled, guest_profile_config];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM properties WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async getCurrentGuest(propertyId) {
    const query = `
      SELECT * FROM guests 
      WHERE property_id = $1 
        AND is_active = true 
        AND check_in_date <= NOW() 
        AND check_out_date > NOW()
      ORDER BY check_in_date DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows[0];
  }

  static async getGuestProfileConfig(propertyId) {
    const query = 'SELECT guest_profile_config FROM properties WHERE id = $1';
    const result = await pool.query(query, [propertyId]);
    return result.rows[0]?.guest_profile_config || null;
  }

  static async updateGuestProfileConfig(propertyId, config) {
    const query = `
      UPDATE properties 
      SET guest_profile_config = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING guest_profile_config
    `;
    const result = await pool.query(query, [propertyId, config]);
    return result.rows[0]?.guest_profile_config;
  }

  static async getActivities(propertyId, guestType = null) {
    let query = `
      SELECT * FROM activities 
      WHERE property_id = $1 AND is_active = true
    `;
    const values = [propertyId];

    if (guestType) {
      query += ` AND $2 = ANY(target_guest_types)`;
      values.push(guestType);
    }

    query += ` ORDER BY display_order ASC, title ASC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getStreamingServices(propertyId) {
    const query = `
      SELECT * FROM streaming_services 
      WHERE property_id = $1 AND is_active = true
      ORDER BY display_order ASC, service_name ASC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }
}

export default Property;