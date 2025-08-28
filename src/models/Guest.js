import pool from '../config/database.js';

class Guest {
  static async create(guestData) {
    const {
      property_id,
      name,
      email,
      phone,
      guest_type,
      party_size,
      check_in_date,
      check_out_date,
      room_number,
      guest_labels = [],
      special_requests,
      status = 'reserved',
      notes,
      language = 'en'
    } = guestData;

    // Split name into first and last for backward compatibility
    const nameParts = name?.trim().split(' ') || [''];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const query = `
      INSERT INTO guests (property_id, first_name, last_name, email, phone, guest_type, party_size, check_in_date, check_out_date, guest_labels, special_requests, notes, language)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [property_id, first_name, last_name, email, phone, guest_type, party_size, check_in_date, check_out_date, guest_labels, special_requests, notes, language];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM guests WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByProperty(propertyId) {
    const query = `
      SELECT g.*, p.name as property_name 
      FROM guests g
      JOIN properties p ON g.property_id = p.id
      WHERE g.property_id = $1
      ORDER BY g.check_in_date DESC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async findCurrent(propertyId) {
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

  static async findExpired() {
    const query = `
      SELECT * FROM guests 
      WHERE is_active = true 
        AND check_out_date < NOW()
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async checkIn(id) {
    const query = `
      UPDATE guests 
      SET actual_check_in = NOW(), is_active = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async checkOut(id) {
    const query = `
      UPDATE guests 
      SET actual_check_out = NOW(), is_active = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, guestData) {
    const {
      name,
      email,
      phone,
      guest_type,
      party_size,
      check_in_date,
      check_out_date,
      room_number,
      guest_labels = [],
      special_requests,
      status,
      notes,
      language = 'en',
      // Enhanced profile fields
      profile_type,
      adults,
      children,
      children_ages,
      preferences,
      dietary_restrictions,
      accessibility_needs,
      allergies,
      preferred_activities,
      budget_preference,
      special_occasions,
      profile_completed,
      profile_completion_percentage
    } = guestData;

    // Split name into first and last for backward compatibility
    const nameParts = name?.trim().split(' ') || [''];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Support both field naming conventions - use database column names
    const adultsValue = adults || guestData.number_of_adults;
    const childrenValue = children || guestData.number_of_children;

    const query = `
      UPDATE guests 
      SET first_name = $2, last_name = $3, email = $4, phone = $5, 
          guest_type = $6, party_size = $7, check_in_date = $8, 
          check_out_date = $9, guest_labels = $10, 
          special_requests = $11, notes = $12, language = $13,
          profile_type = COALESCE($14, profile_type),
          adults = COALESCE($15, adults),
          children = COALESCE($16, children),
          dietary_restrictions = COALESCE($17, dietary_restrictions),
          accessibility_needs = COALESCE($18, accessibility_needs),
          preferred_activities = COALESCE($19, preferred_activities),
          budget_preference = COALESCE($20, budget_preference),
          special_occasions = COALESCE($21, special_occasions),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id, first_name, last_name, email, phone, guest_type, party_size, 
      check_in_date, check_out_date, guest_labels, special_requests, notes, language,
      profile_type, adultsValue, childrenValue, 
      dietary_restrictions, accessibility_needs, preferred_activities,
      budget_preference, special_occasions
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM guests WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async getSessions(guestId) {
    const query = `
      SELECT gs.*, ss.service_name, ss.service_type
      FROM guest_sessions gs
      JOIN streaming_services ss ON gs.streaming_service_id = ss.id
      WHERE gs.guest_id = $1 AND gs.is_active = true
      ORDER BY gs.created_at DESC
    `;
    const result = await pool.query(query, [guestId]);
    return result.rows;
  }

  static async createSession(guestId, streamingServiceId, deviceId = null, sessionToken = null) {
    const query = `
      INSERT INTO guest_sessions (guest_id, streaming_service_id, device_id, session_token)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [guestId, streamingServiceId, deviceId, sessionToken];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async endSession(sessionId) {
    const query = `
      UPDATE guest_sessions 
      SET logout_timestamp = NOW(), is_active = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  static async endAllSessions(guestId) {
    const query = `
      UPDATE guest_sessions 
      SET logout_timestamp = NOW(), is_active = false
      WHERE guest_id = $1 AND is_active = true
      RETURNING *
    `;
    const result = await pool.query(query, [guestId]);
    return result.rows;
  }

  static async findCurrentByProperty(propertyId) {
    try {
      // Find the most recent active guest for this property
      // Since there's no status column, we'll use is_active and check dates
      const query = `
        SELECT * FROM guests 
        WHERE property_id = $1 
        AND is_active = true
        AND check_in_date <= NOW()
        AND check_out_date > NOW()
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const result = await pool.query(query, [propertyId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error finding current guest by property:', error);
      throw error;
    }
  }
  // Enhanced profile methods
  static async updateProfile(guestId, profileData) {
    const {
      profile_type,
      adults,
      children,
      number_of_adults,  // Support both field names
      number_of_children, // Support both field names
      children_ages,
      preferences,
      dietary_restrictions,
      accessibility_needs,
      allergies,
      preferred_activities,
      budget_preference,
      special_occasions,
      preferred_language,
      language,  // Support language field from tvOS
      guest_labels  // Support guest labels from tvOS
    } = profileData;
    
    // Use the new field names if provided, fallback to old ones
    const actualAdults = number_of_adults || adults;
    const actualChildren = number_of_children || children;

    // Calculate profile completion percentage
    let completedFields = 0;
    const totalFields = 10;
    
    if (profile_type) completedFields++;
    if (actualAdults > 0) completedFields++;
    if (preferences && Object.keys(preferences).length > 0) completedFields++;
    if (dietary_restrictions && dietary_restrictions.length > 0) completedFields++;
    if (preferred_activities && preferred_activities.length > 0) completedFields++;
    if (budget_preference) completedFields++;
    if (accessibility_needs && accessibility_needs.length > 0) completedFields++;
    if (special_occasions) completedFields++;
    if (preferred_language) completedFields++;
    
    const profile_completion_percentage = Math.round((completedFields / totalFields) * 100);
    const profile_completed = profile_completion_percentage >= 60;

    const query = `
      UPDATE guests 
      SET profile_type = COALESCE($2, profile_type),
          adults = COALESCE($3, adults),
          children = COALESCE($4, children),
          children_ages = COALESCE($5, children_ages),
          preferences = COALESCE($6, preferences),
          dietary_restrictions = COALESCE($7, dietary_restrictions),
          accessibility_needs = COALESCE($8, accessibility_needs),
          allergies = COALESCE($9, allergies),
          preferred_activities = COALESCE($10, preferred_activities),
          budget_preference = COALESCE($11, budget_preference),
          special_occasions = COALESCE($12, special_occasions),
          profile_completed = $13,
          profile_completion_percentage = $14,
          language = COALESCE($15, language),
          guest_labels = COALESCE($16, guest_labels),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      guestId,
      profile_type,
      actualAdults,
      actualChildren,
      children_ages,
      JSON.stringify(preferences),
      dietary_restrictions,
      accessibility_needs,
      allergies,
      preferred_activities,
      budget_preference,
      special_occasions,
      profile_completed,
      profile_completion_percentage,
      language || preferred_language,  // Support both field names
      guest_labels  // Include guest labels for interest-based recommendations
    ];

    console.log('Updating guest profile with values:');
    console.log('dietary_restrictions (position 7):', dietary_restrictions);
    console.log('preferred_activities (position 10):', preferred_activities);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getProfile(guestId) {
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        profile_type,
        adults,
        children,
        children_ages,
        preferences,
        dietary_restrictions,
        accessibility_needs,
        allergies,
        preferred_activities,
        budget_preference,
        special_occasions,
        profile_completed,
        profile_completion_percentage
      FROM guests 
      WHERE id = $1
    `;
    const result = await pool.query(query, [guestId]);
    return result.rows[0];
  }
}

export default Guest;