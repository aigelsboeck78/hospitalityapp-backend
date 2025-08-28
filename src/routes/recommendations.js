import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { logger } from '../middleware/errorHandler.js';
import pool from '../config/database.js';

const router = express.Router();

// Helper function to determine season from month
function getSeasonFromMonth(month) {
  if (month >= 12 || month <= 3) return 'winter';
  if (month >= 4 && month <= 5) return 'spring';
  if (month >= 6 && month <= 9) return 'summer';
  if (month >= 10 && month <= 11) return 'autumn';
  return 'all';
}

// Get weather-based activity recommendations
router.get('/activities', optionalAuth, async (req, res) => {
  try {
    const { 
      property_id, 
      guest_id, 
      weather = 'sunny', 
      guest_labels = [], 
      limit = 10,
      activity_type,
      date,
      temperature
    } = req.query;

    if (!property_id) {
      return res.status(400).json({
        success: false,
        message: 'property_id is required'
      });
    }

    let guest = null;
    let guestLabels = [];

    // If guest_id is provided, fetch guest preferences
    if (guest_id) {
      try {
        const guestResult = await pool.query(
          'SELECT guest_labels, guest_type FROM guests WHERE id = $1',
          [guest_id]
        );
        if (guestResult.rows.length > 0) {
          guest = guestResult.rows[0];
          guestLabels = guest.guest_labels || [];
        }
      } catch (error) {
        logger.warn(`Guest ${guest_id} not found, using provided labels`);
      }
    }

    // Use provided guest_labels if no guest found or labels provided
    if (Array.isArray(guest_labels) && guest_labels.length > 0) {
      guestLabels = guest_labels;
    } else if (typeof guest_labels === 'string' && guest_labels) {
      guestLabels = guest_labels.split(',').map(l => l.trim());
    }
    
    // Determine current season based on date
    const targetDate = date ? new Date(date) : new Date();
    const targetMonth = targetDate.getMonth() + 1;
    const currentSeason = getSeasonFromMonth(targetMonth);

    // Build the query
    let queryText = `
      SELECT 
        a.*,
        -- Calculate relevance score
        CASE 
          WHEN $3 = ANY(a.weather_suitability) OR 'all_weather' = ANY(a.weather_suitability) OR 'indoor' = ANY(a.weather_suitability) THEN 1.0
          ELSE 0.3
        END as weather_score,
        CASE 
          WHEN $4::text[] && a.activity_labels THEN 1.0
          ELSE 0.5
        END as label_score,
        -- Season matching score
        CASE
          WHEN a.season = 'all' THEN 1.0
          WHEN a.season = $5 THEN 2.0
          WHEN a.season LIKE '%' || $5 || '%' THEN 1.5
          ELSE 0.0
        END as season_score
      FROM activities a
      WHERE a.property_id = $1 
        AND a.is_active = true
        -- Season filter
        AND (
          a.season = 'all' 
          OR a.season = $5
          OR a.season LIKE '%' || $5 || '%'
          OR (
            -- Check if current month is within season range
            CASE 
              WHEN a.season_start_month <= a.season_end_month THEN
                $6 >= a.season_start_month AND $6 <= a.season_end_month
              ELSE -- Handle winter season that crosses year boundary
                $6 >= a.season_start_month OR $6 <= a.season_end_month
            END
          )
        )
    `;
    
    const queryParams = [property_id, limit, weather, guestLabels, currentSeason, targetMonth];
    let paramIndex = 7;

    // Add activity type filter if provided
    if (activity_type) {
      queryText += ` AND a.activity_type = $${paramIndex}`;
      queryParams.push(activity_type);
      paramIndex++;
    }
    
    // Add temperature filter for weather-dependent activities
    if (temperature !== undefined && temperature !== null) {
      queryText += ` 
        AND (
          a.weather_dependent = false 
          OR (
            (a.min_temperature IS NULL OR $${paramIndex} >= a.min_temperature)
            AND (a.max_temperature IS NULL OR $${paramIndex} <= a.max_temperature)
          )
        )
      `;
      queryParams.push(parseInt(temperature));
      paramIndex++;
    }

    // Add weather suitability filter (prioritize weather-appropriate activities)
    queryText += `
      ORDER BY 
        (CASE 
          WHEN $3 = ANY(a.weather_suitability) OR 'all_weather' = ANY(a.weather_suitability) OR 'indoor' = ANY(a.weather_suitability) THEN 1.0
          ELSE 0.3
        END * 2 + 
        CASE 
          WHEN $4::text[] && a.activity_labels THEN 1.0
          ELSE 0.5
        END +
        CASE
          WHEN a.season = 'all' THEN 1.0
          WHEN a.season = $5 THEN 2.0
          WHEN a.season LIKE '%' || $5 || '%' THEN 1.5
          ELSE 0.0
        END) DESC,
        a.display_order ASC,
        a.title ASC
      LIMIT $2
    `;

    const result = await pool.query(queryText, queryParams);

    // Calculate recommendation reasons for each activity
    const recommendations = result.rows.map(activity => {
      const reasons = [];
      const weatherMatch = activity.weather_suitability?.includes(weather) || 
                          activity.weather_suitability?.includes('all_weather') ||
                          activity.weather_suitability?.includes('indoor');
      
      if (weatherMatch) {
        const weatherLabels = {
          'sunny': '☀️ Perfect for sunny weather',
          'cloudy': '☁️ Great for cloudy conditions', 
          'rainy': '🌧️ Ideal indoor activity for rainy day',
          'snowy': '❄️ Perfect winter activity',
          'indoor': '🏠 Weather-independent indoor activity',
          'all_weather': '🌦️ Suitable for any weather'
        };
        
        if (activity.weather_suitability?.includes('indoor')) {
          reasons.push(weatherLabels['indoor']);
        } else if (activity.weather_suitability?.includes('all_weather')) {
          reasons.push(weatherLabels['all_weather']);
        } else {
          reasons.push(weatherLabels[weather] || `Suitable for ${weather} weather`);
        }
      }

      // Check for label matches
      const labelMatches = guestLabels.filter(label => 
        activity.activity_labels?.includes(label)
      );
      
      if (labelMatches.length > 0) {
        const labelIcons = {
          'family': '👨‍👩‍👧‍👦 Perfect for families',
          'intense': '🔥 Adventure seekers will love this',
          'girls_weekend': '👯‍♀️ Great for girls weekend',
          'boys_weekend': '🍺 Perfect for boys weekend', 
          'chill': '🧘‍♀️ Perfect for relaxation'
        };
        
        labelMatches.forEach(label => {
          if (labelIcons[label]) {
            reasons.push(labelIcons[label]);
          }
        });
      }

      return {
        ...activity,
        recommendation_score: parseFloat((parseFloat(activity.weather_score) * 2 + parseFloat(activity.label_score)).toFixed(2)),
        recommendation_reasons: reasons,
        weather_suitable: weatherMatch,
        label_matches: labelMatches
      };
    });

    // Add context about the recommendations
    const context = {
      weather_condition: weather,
      guest_labels: guestLabels,
      total_activities: result.rows.length,
      guest_type: guest?.guest_type || null,
      filters: {
        property_id,
        activity_type: activity_type || 'all',
        weather
      }
    };

    res.json({
      success: true,
      data: recommendations,
      context,
      message: `Found ${recommendations.length} recommended activities for ${weather} weather`
    });

  } catch (error) {
    logger.error('Error fetching activity recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity recommendations',
      error: error.message
    });
  }
});

// Get weather information (mock endpoint - in production would connect to weather API)
router.get('/weather', optionalAuth, async (req, res) => {
  try {
    const { location = 'Schladming, Austria' } = req.query;
    
    // Mock weather data - in production, integrate with OpenWeatherMap or similar
    const mockWeatherConditions = [
      { condition: 'sunny', probability: 0.3 },
      { condition: 'cloudy', probability: 0.4 }, 
      { condition: 'rainy', probability: 0.2 },
      { condition: 'snowy', probability: 0.1 }
    ];
    
    const randomCondition = mockWeatherConditions[
      Math.floor(Math.random() * mockWeatherConditions.length)
    ];
    
    const weatherData = {
      location,
      current: {
        condition: randomCondition.condition,
        temperature: randomCondition.condition === 'snowy' ? -2 : 
                    randomCondition.condition === 'rainy' ? 12 :
                    randomCondition.condition === 'cloudy' ? 18 : 24,
        description: {
          'sunny': 'Clear skies and sunshine',
          'cloudy': 'Partly cloudy with occasional breaks',
          'rainy': 'Light rain showers expected', 
          'snowy': 'Snow showers and cold temperatures'
        }[randomCondition.condition],
        icon: {
          'sunny': '☀️',
          'cloudy': '☁️', 
          'rainy': '🌧️',
          'snowy': '❄️'
        }[randomCondition.condition]
      },
      forecast: [
        { day: 'Today', condition: randomCondition.condition, high: 24, low: 15 },
        { day: 'Tomorrow', condition: 'cloudy', high: 22, low: 14 },
        { day: 'Day 3', condition: 'sunny', high: 26, low: 16 }
      ],
      last_updated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: weatherData
    });
    
  } catch (error) {
    logger.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
});

// Get dining recommendations based on time, weather, and preferences
router.get('/dining', optionalAuth, async (req, res) => {
  try {
    const { 
      property_id,
      guest_id,
      weather = 'sunny',
      temperature = 20,
      time_of_day = 'dinner',
      cuisine_preference,
      dietary_preferences = [],
      budget = 'medium',
      family_friendly = false,
      limit = 10
    } = req.query;

    // Determine current season
    const currentMonth = new Date().getMonth() + 1;
    const isWinterSeason = currentMonth >= 11 || currentMonth <= 4;
    const seasonFilter = isWinterSeason ? 'Winter' : 'Summer';

    // Build query to get dining options
    let queryText = `
      SELECT 
        id,
        name_en as name,
        name_de,
        category,
        location_area,
        street_address,
        postal_code,
        city,
        altitude_m,
        phone,
        website,
        email,
        hours_winter,
        hours_summer,
        cuisine_type,
        price_range,
        capacity_indoor,
        capacity_outdoor,
        capacity_total,
        awards,
        accessibility,
        parking,
        family_friendly,
        vegetarian,
        vegan,
        gluten_free,
        reservations_required,
        season_recommendation,
        relevance_status,
        image_url,
        latitude,
        longitude,
        -- Calculate recommendation score
        CASE 
          WHEN relevance_status = 'Must_See' THEN 3.0
          WHEN relevance_status = 'Highly_Recommended' THEN 2.5
          WHEN relevance_status = 'Recommended' THEN 2.0
          WHEN relevance_status = 'Popular' THEN 1.5
          ELSE 1.0
        END +
        -- Weather score
        CASE 
          WHEN $2 = 'rainy' AND capacity_indoor > 0 THEN 1.0
          WHEN $2 = 'sunny' AND capacity_outdoor > 0 THEN 1.0
          ELSE 0.5
        END +
        -- Temperature score for outdoor dining
        CASE 
          WHEN $3 > 20 AND capacity_outdoor > 0 THEN 0.5
          WHEN $3 < 10 AND capacity_indoor > 0 THEN 0.5
          ELSE 0.0
        END as recommendation_score
      FROM dining_places
      WHERE is_active = true
    `;
    
    const queryParams = [limit, weather, temperature];
    let paramIndex = 4;

    // Filter by season availability
    queryText += ` AND (
      season_recommendation = 'Year_Round' OR 
      season_recommendation LIKE '%${seasonFilter}%'
    )`;

    // Filter by operating hours (check if open)
    if (isWinterSeason) {
      queryText += ` AND (hours_winter IS NOT NULL AND hours_winter NOT IN ('Closed', 'Closed_Winter'))`;
    } else {
      queryText += ` AND (hours_summer IS NOT NULL AND hours_summer NOT IN ('Closed', 'Closed_Summer'))`;
    }

    // Add cuisine filter if provided
    if (cuisine_preference) {
      queryText += ` AND LOWER(cuisine_type) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${cuisine_preference}%`);
      paramIndex++;
    }

    // Add dietary filters
    let dietaryFilters = [];
    if (Array.isArray(dietary_preferences)) {
      if (dietary_preferences.includes('vegetarian')) {
        dietaryFilters.push('vegetarian = true');
      }
      if (dietary_preferences.includes('vegan')) {
        dietaryFilters.push('vegan = true');
      }
      if (dietary_preferences.includes('gluten_free')) {
        dietaryFilters.push('gluten_free = true');
      }
    }
    if (dietaryFilters.length > 0) {
      queryText += ` AND (${dietaryFilters.join(' AND ')})`;
    }

    // Family friendly filter
    if (family_friendly === 'true' || family_friendly === true) {
      queryText += ` AND family_friendly = true`;
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
    // Handle both numeric and symbol-based price ranges
    queryText += ` AND (
      LENGTH(price_range) <= ${maxPrice} OR 
      (price_range ~ '^[0-9]+$' AND CAST(price_range AS INTEGER) <= ${maxPrice}) OR
      price_range IS NULL
    )`;

    // Weather-based filtering
    if (weather === 'rainy' || temperature < 10) {
      // Prefer indoor dining in bad weather
      queryText += ` AND capacity_indoor > 0`;
    }

    // Order by recommendation score and limit
    queryText += `
      ORDER BY 
        recommendation_score DESC,
        CASE 
          WHEN relevance_status = 'Must_See' THEN 1
          WHEN relevance_status = 'Highly_Recommended' THEN 2
          WHEN relevance_status = 'Recommended' THEN 3
          WHEN relevance_status = 'Popular' THEN 4
          ELSE 5
        END,
        name_en ASC
      LIMIT $1
    `;

    const result = await pool.query(queryText, queryParams);

    // Add recommendation reasons
    const recommendations = result.rows.map(place => {
      const reasons = [];
      
      // Relevance status
      if (place.relevance_status === 'Must_See') {
        reasons.push('⭐ Must-see dining destination');
      } else if (place.relevance_status === 'Highly_Recommended') {
        reasons.push('🌟 Highly recommended');
      }
      
      // Awards
      if (place.awards) {
        reasons.push(`🏆 ${place.awards}`);
      }
      
      // Weather-based recommendations
      if (weather === 'rainy' && place.capacity_indoor > 0) {
        reasons.push('🌧️ Indoor seating available');
      } else if (weather === 'sunny' && place.capacity_outdoor > 0) {
        reasons.push(`☀️ ${place.capacity_outdoor} outdoor seats`);
      }
      
      // Category-based recommendations
      const categoryDescriptions = {
        'Fine_Dining': '🍽️ Fine dining experience',
        'Restaurant': '🍴 Full-service restaurant',
        'Mountain_Hut': '🏔️ Authentic mountain hut',
        'Alpine_Hut': '⛰️ Traditional alpine dining',
        'Apres_Ski': '🎿 Après-ski atmosphere',
        'Cafe_Bakery': '☕ Café and bakery',
        'Gourmet_Hut': '✨ Gourmet mountain dining'
      };
      
      if (categoryDescriptions[place.category]) {
        reasons.push(categoryDescriptions[place.category]);
      }
      
      // Dietary options
      const dietaryOptions = [];
      if (place.vegetarian) dietaryOptions.push('vegetarian');
      if (place.vegan) dietaryOptions.push('vegan');
      if (place.gluten_free) dietaryOptions.push('gluten-free');
      if (dietaryOptions.length > 0) {
        reasons.push(`🥗 ${dietaryOptions.join(', ')} options`);
      }
      
      // Family friendly
      if (place.family_friendly) {
        reasons.push('👨‍👩‍👧‍👦 Family-friendly');
      }
      
      // Reservations
      if (place.reservations_required === 'Yes' || place.reservations_required === 'Recommended') {
        reasons.push(`📞 Reservations ${place.reservations_required.toLowerCase()}`);
      }
      
      return {
        ...place,
        recommendation_score: parseFloat(place.recommendation_score),
        recommendation_reasons: reasons,
        current_hours: isWinterSeason ? place.hours_winter : place.hours_summer
      };
    });

    res.json({
      success: true,
      data: recommendations,
      context: {
        time_of_day,
        weather,
        temperature,
        season: seasonFilter,
        cuisine_preference: cuisine_preference || 'all',
        dietary_preferences,
        budget,
        family_friendly
      }
    });

  } catch (error) {
    logger.error('Error fetching dining recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining recommendations',
      error: error.message
    });
  }
});

// Get event recommendations based on date and preferences
router.get('/events', optionalAuth, async (req, res) => {
  try {
    const {
      property_id,
      guest_id,
      date,
      category,
      limit = 5
    } = req.query;

    // Calculate date range
    const targetDate = date ? new Date(date) : new Date();
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 7); // Look ahead 7 days

    let queryText = `
      SELECT 
        id,
        name,
        description,
        category,
        location,
        start_date,
        end_date,
        image_url,
        source_url,
        price_info,
        is_featured,
        created_at,
        updated_at,
        -- Calculate recommendation score
        CASE 
          WHEN is_featured THEN 2.0
          ELSE 1.0
        END +
        CASE 
          WHEN start_date::date = $1::date THEN 2.0
          WHEN start_date::date <= $2::date THEN 1.0
          ELSE 0.5
        END as recommendation_score
      FROM events
      WHERE is_active = true
        AND start_date >= $1::date
        AND start_date <= $2::date
    `;
    
    const queryParams = [targetDate, endDate];
    let paramIndex = 3;

    // Add category filter if provided
    if (category) {
      queryText += ` AND LOWER(category) = LOWER($${paramIndex})`;
      queryParams.push(category);
      paramIndex++;
    }
    
    // Temperature filter removed as events table doesn't have these columns

    // Order by recommendation score and date
    queryText += `
      ORDER BY 
        recommendation_score DESC,
        start_date ASC
      LIMIT $${paramIndex}
    `;
    queryParams.push(limit);

    const result = await pool.query(queryText, queryParams);

    // Add recommendation reasons
    const recommendations = result.rows.map(event => {
      const reasons = [];
      const eventDate = new Date(event.start_date);
      const today = new Date();
      
      if (event.is_featured) {
        reasons.push('⭐ Featured event');
      }
      
      // Date-based recommendations
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate.getTime() === today.getTime()) {
        reasons.push('📅 Happening today!');
      } else if (eventDate.getTime() === today.getTime() + 86400000) {
        reasons.push('📅 Tomorrow');
      } else {
        const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 7) {
          reasons.push(`📅 In ${daysUntil} days`);
        }
      }
      
      // Price-based recommendations
      if (event.price_info && event.price_info.toLowerCase().includes('free')) {
        reasons.push('🎟️ Free event');
      }
      
      // Category-based recommendations
      const categoryIcons = {
        'sports': '⛷️ Sports activity',
        'winter_sports': '🎿 Winter sports',
        'summer_sports': '🚴 Summer sports',
        'cultural': '🎭 Cultural experience',
        'wellness': '🧘 Wellness & relaxation',
        'family': '👨‍👩‍👧‍👦 Family-friendly',
        'music': '🎵 Live music',
        'food': '🍽️ Food & dining'
      };
      
      if (categoryIcons[event.category?.toLowerCase()]) {
        reasons.push(categoryIcons[event.category.toLowerCase()]);
      }
      
      return {
        ...event,
        recommendation_score: parseFloat(event.recommendation_score),
        recommendation_reasons: reasons
      };
    });

    res.json({
      success: true,
      data: recommendations,
      context: {
        date: targetDate.toISOString(),
        category: category || 'all',
        days_ahead: 7
      }
    });

  } catch (error) {
    logger.error('Error fetching event recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event recommendations',
      error: error.message
    });
  }
});

export default router;