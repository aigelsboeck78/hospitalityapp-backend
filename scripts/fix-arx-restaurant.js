import pool from '../src/config/database.js';

async function fixARXRestaurant() {
  try {
    const updateQuery = `
      UPDATE dining_places 
      SET 
        name_en = 'ARX Restaurant',
        name_de = 'ARX Restaurant',
        name = 'ARX Restaurant',
        category = 'Fine_Dining',
        location_area = 'Rohrmoostal',
        street_address = 'Rohrmoostal 223',
        postal_code = '8971',
        city = 'Rohrmoos',
        altitude_m = 1100,
        cuisine_type = COALESCE(cuisine_type, 'fine_dining'),
        price_range = COALESCE(price_range, '3'),
        hours_winter = 'Daily_Lunch_Dinner',
        hours_summer = 'Daily_Lunch_Dinner',
        family_friendly = true,
        vegetarian = true,
        vegan = false,
        gluten_free = true,
        parking = true,
        capacity_indoor = 120,
        capacity_outdoor = 50,
        capacity_total = 170,
        reservations_required = 'Yes',
        season_recommendation = 'Year_Round',
        relevance_status = 'Highly_Recommended',
        awards = 'Gault_Millau',
        accessibility = 'Car,Walk'
      WHERE id = 20;
    `;

    const result = await pool.query(updateQuery);
    
    if (result.rowCount > 0) {
      console.log('✅ Successfully restored ARX Restaurant data');
      
      // Verify the update
      const checkResult = await pool.query('SELECT name_en, name_de, category, location_area FROM dining_places WHERE id = 20');
      console.log('Updated record:', checkResult.rows[0]);
    } else {
      console.log('❌ No record found with ID 20');
    }
    
  } catch (error) {
    console.error('Error fixing ARX Restaurant:', error);
  } finally {
    await pool.end();
  }
}

fixARXRestaurant();