import pool from '../config/database.js';

class StreamingService {
  static async create(serviceData) {
    const {
      property_id,
      service_name,
      service_type,
      app_url_scheme,
      logo_url,
      instructions,
      requires_login,
      display_order
    } = serviceData;

    const query = `
      INSERT INTO streaming_services (
        property_id, service_name, service_type, app_url_scheme, 
        logo_url, instructions, requires_login, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      property_id, service_name, service_type, app_url_scheme,
      logo_url, instructions, requires_login, display_order
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM streaming_services WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByProperty(propertyId) {
    const query = `
      SELECT * FROM streaming_services 
      WHERE property_id = $1 
      ORDER BY display_order ASC, service_name ASC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async findActiveByProperty(propertyId) {
    const query = `
      SELECT * FROM streaming_services 
      WHERE property_id = $1 AND is_active = true
      ORDER BY display_order ASC, service_name ASC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async findByType(propertyId, serviceType) {
    const query = `
      SELECT * FROM streaming_services 
      WHERE property_id = $1 AND service_type = $2 AND is_active = true
      ORDER BY display_order ASC, service_name ASC
    `;
    const result = await pool.query(query, [propertyId, serviceType]);
    return result.rows;
  }

  static async update(id, serviceData) {
    const {
      service_name,
      service_type,
      app_url_scheme,
      logo_url,
      instructions,
      requires_login,
      is_active,
      display_order
    } = serviceData;

    const query = `
      UPDATE streaming_services 
      SET service_name = $2, service_type = $3, app_url_scheme = $4, 
          logo_url = $5, instructions = $6, requires_login = $7, 
          is_active = $8, display_order = $9
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id, service_name, service_type, app_url_scheme,
      logo_url, instructions, requires_login, is_active, display_order
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM streaming_services WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async updateDisplayOrder(id, displayOrder) {
    const query = `
      UPDATE streaming_services 
      SET display_order = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, displayOrder]);
    return result.rows[0];
  }

  static async toggleActive(id) {
    const query = `
      UPDATE streaming_services 
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getActiveSessions(serviceId) {
    const query = `
      SELECT gs.*, g.first_name, g.last_name, g.guest_type
      FROM guest_sessions gs
      JOIN guests g ON gs.guest_id = g.id
      WHERE gs.streaming_service_id = $1 AND gs.is_active = true
      ORDER BY gs.created_at DESC
    `;
    const result = await pool.query(query, [serviceId]);
    return result.rows;
  }
}

export default StreamingService;