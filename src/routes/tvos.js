import express from 'express';
import path from 'path';
import { authenticateApiKey } from '../middleware/auth.js';
import {
  getProperty,
  getProperties
} from '../controllers/propertyController.js';
import {
  getActivities,
  getActivity
} from '../controllers/activityController.js';
import {
  getStreamingServices
} from '../controllers/streamingController.js';
import {
  getGuest,
  getGuests
} from '../controllers/guestController.js';
import Guest from '../models/Guest.js';
import Property from '../models/Property.js';
import BackgroundImage from '../models/BackgroundImage.js';
import Event from '../models/Event.js';
import DiningOption from '../models/DiningOption.js';
import PropertyInformation from '../models/PropertyInformation.js';
import weatherKitService from '../services/weatherKitService.js';
import pool from '../config/database.js';

const router = express.Router();

// Apply API key authentication to all tvOS routes
router.use(authenticateApiKey);

// Device registration and property mapping
router.post('/device/register', async (req, res) => {
  try {
    const { device_identifier, device_name, model, os_version, app_version } = req.body;
    
    if (!device_identifier) {
      return res.status(400).json({
        success: false,
        message: 'Device identifier is required'
      });
    }
    
    // Check if device exists and get its property
    const deviceQuery = `
      SELECT d.*, p.id as property_id, p.name as property_name
      FROM devices d
      JOIN properties p ON d.property_id = p.id
      WHERE d.identifier = $1 AND d.is_active = true
    `;
    
    const deviceResult = await pool.query(deviceQuery, [device_identifier]);
    
    if (deviceResult.rows.length > 0) {
      const device = deviceResult.rows[0];
      
      // Update device last seen and info
      const updateQuery = `
        UPDATE devices 
        SET last_seen = NOW(), 
            is_online = true, 
            os_version = COALESCE($2, os_version),
            app_version = COALESCE($3, app_version),
            model = COALESCE($4, model),
            device_name = COALESCE($5, device_name)
        WHERE id = $1
        RETURNING *
      `;
      
      await pool.query(updateQuery, [
        device.id, 
        os_version, 
        app_version, 
        model, 
        device_name || device.device_name
      ]);
      
      return res.json({
        success: true,
        data: {
          device_id: device.id,
          property_id: device.property_id,
          property_name: device.property_name,
          room_number: device.room_number,
          settings: device.settings || {}
        }
      });
    } else {
      // Device not found - return error
      return res.status(404).json({
        success: false,
        message: 'Device not registered. Please contact property management.',
        device_identifier: device_identifier
      });
    }
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message
    });
  }
});

// Properties routes for tvOS
router.get('/properties', getProperties);
router.get('/properties/:id', getProperty);

// Activities routes for tvOS
router.get('/activities', getActivities);
router.get('/activities/:id', getActivity);

// Streaming services routes for tvOS
router.get('/streaming-services', getStreamingServices);

// Recommendations routes for tvOS
router.get('/recommendations/activities', async (req, res) => {
  try {
    // Get live weather data and use it for recommendations
    const { property_id, latitude, longitude, guest_labels, limit = 10 } = req.query;
    
    // Fetch current weather conditions
    let weatherCondition = null;
    try {
      weatherCondition = await weatherKitService.getWeatherForRecommendations(
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null
      );
      console.log('Weather condition for recommendations:', weatherCondition);
    } catch (error) {
      console.warn('Could not fetch weather for recommendations, using default:', error.message);
    }
    
    // Get activities and mark some as recommended based on simple criteria
    const { getActivities } = await import('../controllers/activityController.js');
    const mockReq = { query: { property_id, limit: limit * 2 } }; // Get more to filter better
    const mockRes = { json: (data) => data };
    
    // Get activities using the controller
    const activitiesData = await new Promise((resolve) => {
      getActivities(mockReq, {
        json: resolve,
        status: () => ({ json: resolve })
      });
    });
    
    const activities = activitiesData.data || [];
    
    // Enhanced recommendation logic based on weather and guest labels
    const recommendations = activities
      .map(activity => {
        let score = 3; // Base score
        const reasons = [];
        let weatherSuitable = true;
        
        // Weather-based scoring
        if (weatherCondition) {
          const activityType = activity.activity_type?.toLowerCase() || '';
          const description = activity.description?.toLowerCase() || '';
          
          if (weatherCondition.condition === 'rain' || weatherCondition.rainProbability > 60) {
            // Favor indoor activities during rain
            if (activityType.includes('indoor') || description.includes('indoor') || 
                description.includes('museum') || description.includes('spa')) {
              score += 1.5;
              reasons.push('Perfect for rainy weather');
            } else if (activityType.includes('outdoor') || description.includes('outdoor')) {
              score -= 1;
              weatherSuitable = false;
              reasons.push('Weather not ideal');
            }
          } else if (weatherCondition.isGoodForOutdoor) {
            // Favor outdoor activities during good weather
            if (activityType.includes('outdoor') || description.includes('outdoor') ||
                description.includes('hiking') || description.includes('bike')) {
              score += 1.5;
              reasons.push('Great weather for outdoor activities');
            }
          }
          
          // Temperature-based recommendations
          if (weatherCondition.temperature < 5) {
            if (description.includes('winter') || description.includes('ski') || description.includes('snow')) {
              score += 1;
              reasons.push('Perfect winter activity');
            }
          } else if (weatherCondition.temperature > 20) {
            if (description.includes('swimming') || description.includes('lake') || description.includes('water')) {
              score += 1;
              reasons.push('Great for warm weather');
            }
          }
        }
        
        // Guest label matching
        const labelMatches = guest_labels ? guest_labels.split(',').filter(label => 
          activity.target_guest_types?.includes(label) || 
          activity.description?.toLowerCase().includes(label.toLowerCase())
        ) : [];
        
        if (labelMatches.length > 0) {
          score += labelMatches.length * 0.5;
          reasons.push(`Matches your interests: ${labelMatches.join(', ')}`);
        }
        
        // Add some randomness for variety
        score += Math.random() * 0.5;
        
        if (reasons.length === 0) {
          reasons.push('Popular with guests');
        }
        
        return {
          ...activity,
          recommendation_score: Math.min(5, Math.max(1, score)),
          recommendation_reasons: reasons,
          weather_suitable: weatherSuitable,
          weather_condition: weatherCondition?.condition || 'unknown',
          label_matches: labelMatches
        };
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);
    
    res.json({
      success: true,
      data: recommendations,
      context: {
        weather_condition: weatherCondition?.condition || 'unknown',
        weather_description: weatherCondition?.description || 'Unknown',
        temperature: weatherCondition?.temperature || null,
        rain_probability: weatherCondition?.rainProbability || null,
        guest_labels: guest_labels ? guest_labels.split(',') : [],
        total_activities: activities.length,
        weather_source: weatherCondition ? 'live' : 'unavailable'
      }
    });
  } catch (error) {
    console.error('Error getting activity recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

router.get('/recommendations/weather', async (req, res) => {
  try {
    // Get coordinates from query params (optional)
    const { latitude, longitude } = req.query;
    
    console.log(`Fetching weather data for coordinates: ${latitude || 'default'}, ${longitude || 'default'}`);
    
    // Get live weather data from WeatherKit
    const weatherData = await weatherKitService.getWeather(
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null
    );
    
    console.log('Weather data fetched successfully from:', weatherData.source);
    
    res.json({
      success: true,
      data: weatherData,
      metadata: {
        coordinates: weatherData.coordinates,
        source: weatherData.source,
        lastUpdated: weatherData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting weather:', error);
    
    // Fallback to mock data if WeatherKit fails
    try {
      const fallbackWeather = await weatherKitService.getMockWeatherData();
      res.json({
        success: true,
        data: fallbackWeather,
        warning: 'Using fallback weather data due to API error',
        error: error.message
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to get weather information',
        error: error.message
      });
    }
  }
});

// Property information route for tvOS
router.get('/property-information', async (req, res) => {
  try {
    const { property_id } = req.query;
    
    if (!property_id) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }
    
    const propertyInfo = await PropertyInformation.findByProperty(property_id);
    
    res.json({
      success: true,
      data: propertyInfo
    });
  } catch (error) {
    console.error('Error fetching property information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property information',
      error: error.message
    });
  }
});

// Background images route for tvOS
router.get('/properties/:propertyId/backgrounds', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { season } = req.query;
    
    const images = await BackgroundImage.findByProperty(propertyId);
    
    // Get the host from request headers
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    
    // Transform image URLs to include full server URL with proper path
    const fullImages = images.map((img, index) => ({
      id: index + 1, // Use numeric ID for compatibility
      filename: img.filename || path.basename(img.image_url || ''),
      url: img.image_url && img.image_url.startsWith('http') 
        ? img.image_url 
        : `${baseUrl}${img.image_url || ''}`,
      title: img.title || null,
      description: img.description || null,
      season: img.season || 'all',
      displayOrder: img.display_order || 0,
      uploadedAt: img.created_at || new Date().toISOString(),
      image_url: img.image_url && img.image_url.startsWith('http') 
        ? img.image_url 
        : `${baseUrl}${img.image_url || ''}`
    }));
    
    res.json({
      success: true,
      data: fullImages
    });
  } catch (error) {
    console.error('Error fetching background images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch background images',
      error: error.message
    });
  }
});

// Guest routes for tvOS (limited access)
router.get('/guests/current/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // For tvOS, we'll return the first active guest for the property
    // In a real app, this would be based on device/room identification
    const currentGuest = await Guest.findCurrentByProperty(propertyId);
    
    res.json({
      success: true,
      data: currentGuest
    });
  } catch (error) {
    console.error('Error fetching current guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current guest'
    });
  }
});

// Property backgrounds for tvOS
router.get('/properties/:id/backgrounds', async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { season, date } = req.query;
    
    // Determine season from date if provided
    let targetSeason = season;
    if (!targetSeason && date) {
      const targetDate = new Date(date);
      const month = targetDate.getMonth() + 1;
      if (month >= 12 || month <= 3) targetSeason = 'winter';
      else if (month >= 4 && month <= 5) targetSeason = 'spring';
      else if (month >= 6 && month <= 9) targetSeason = 'summer';
      else if (month >= 10 && month <= 11) targetSeason = 'autumn';
    }
    
    // Get seasonal background images for the property
    const backgrounds = await BackgroundImage.findByProperty(propertyId, targetSeason);
    
    res.json({
      success: true,
      data: backgrounds,
      context: {
        season: targetSeason || 'auto',
        totalImages: backgrounds.length
      }
    });
  } catch (error) {
    console.error('Error fetching property backgrounds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property backgrounds'
    });
  }
});

// Property Information routes for tvOS
router.get('/properties/:id/information', async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { active } = req.query;
    
    // Get property information items
    const information = await PropertyInformation.findByProperty(
      propertyId,
      active === 'true' || active === undefined // Default to active only
    );
    
    // Group by category for easier consumption
    const grouped = {
      amenities: [],
      guides: [],
      services: [],
      rules: [],
      emergency: []
    };
    
    // Get property details for rules and emergency info
    const property = await Property.findById(propertyId);
    
    information.forEach(item => {
      const formattedItem = {
        id: item.id,
        category: item.category === 'amenity' ? 'amenities' : item.category,
        type: item.type || item.category,
        title: item.title,
        subtitle: item.subtitle || '',
        description: item.description,
        instructions: item.instructions,
        icon: item.icon,
        url: item.url,
        display_order: item.display_order,
        metadata: item.metadata || {},
        is_active: item.is_active,
        is_emergency: item.type === 'emergency' || false
      };
      
      switch(item.category) {
        case 'amenity':
          grouped.amenities.push(formattedItem);
          break;
        case 'guide':
          grouped.guides.push(formattedItem);
          break;
        case 'service':
          grouped.services.push(formattedItem);
          break;
        case 'rule':
        case 'policy':
          grouped.rules.push(formattedItem);
          break;
        case 'emergency':
          grouped.emergency.push(formattedItem);
          break;
      }
    });
    
    // Add property rules if available
    if (property) {
      if (property.house_rules) {
        grouped.rules.push({
          id: 'house-rules',
          category: 'rules',
          type: 'rule',
          title: 'House Rules',
          subtitle: 'Important guidelines for your stay',
          description: property.house_rules,
          instructions: null,
          icon: 'list.bullet.rectangle',
          url: null,
          display_order: 1,
          metadata: {},
          is_active: true,
          is_emergency: false
        });
      }
      
      if (property.emergency_contact) {
        grouped.emergency.push({
          id: 'emergency-contact',
          category: 'safety',
          type: 'emergency',
          title: 'Emergency Contact',
          subtitle: '24/7 Support',
          description: 'For urgent assistance, call this number immediately.',
          instructions: null,
          icon: 'phone.fill',
          url: null,
          display_order: 1,
          metadata: {
            phone: property.emergency_contact
          },
          is_active: true,
          is_emergency: true
        });
      }
      
      if (property.checkout_instructions) {
        grouped.guides.push({
          id: 'checkout-instructions',
          category: 'guides',
          type: 'guide',
          title: 'Check-out Instructions',
          subtitle: 'How to check out',
          description: property.checkout_instructions,
          instructions: property.checkout_instructions,
          icon: 'door.left.hand.open',
          url: null,
          display_order: 99,
          metadata: {},
          is_active: true,
          is_emergency: false
        });
      }
    }
    
    res.json({
      success: true,
      data: grouped,
      total: information.length,
      context: {
        propertyId,
        activeOnly: active === 'true' || active === undefined
      }
    });
  } catch (error) {
    console.error('Error fetching property information for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property information'
    });
  }
});

// Guest Profile routes for tvOS
router.get('/guests/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Guest.getProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Guest profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest profile'
    });
  }
});

router.put('/guests/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;
    
    console.log('Received profile update for guest:', id);
    console.log('Profile data received:', JSON.stringify(profileData, null, 2));
    
    const updatedProfile = await Guest.updateProfile(id, profileData);
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating guest profile:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest profile',
      error: error.message
    });
  }
});

// Get guest profile configuration for a property
router.get('/properties/:propertyId/guest-profile-config', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const config = await Property.getGuestProfileConfig(propertyId);
    
    if (!config) {
      // Return default configuration if none exists
      return res.json({
        success: true,
        data: {
          enabled: true,
          profile_types: {
            family: { enabled: true, label: "Family", icon: "person.3.fill" },
            couple: { enabled: true, label: "Couple", icon: "heart.fill" },
            adventure: { enabled: true, label: "Adventure", icon: "figure.hiking" },
            wellness: { enabled: true, label: "Wellness", icon: "leaf.fill" },
            business: { enabled: true, label: "Business", icon: "briefcase.fill" }
          },
          preferences: {
            activities: { enabled: true, options: ["Skiing", "Hiking", "Swimming", "Dining"] },
            dietary: { enabled: true, options: ["Vegetarian", "Vegan", "Gluten-Free"] },
            accessibility: { enabled: true, options: ["Wheelchair Access", "Ground Floor"] },
            budget: { enabled: true, options: ["Budget", "Moderate", "Premium", "Luxury"] },
            languages: { enabled: true, options: ["EN", "DE", "FR", "IT"] }
          },
          party_details: {
            adults: { enabled: true, min: 1, max: 10, default: 2 },
            children: { enabled: true, min: 0, max: 10, default: 0 },
            pets: { enabled: false, min: 0, max: 3, default: 0 }
          },
          additional_fields: {
            special_occasions: { enabled: true, label: "Special Occasions", type: "text" },
            arrival_time: { enabled: false, label: "Arrival Time", type: "time" },
            transportation: { enabled: false, label: "Transportation Method", type: "select", options: ["Car", "Train", "Plane", "Bus"] }
          }
        }
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching guest profile config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest profile configuration'
    });
  }
});

// Get current guest profile by property
router.get('/properties/:propertyId/current-guest-profile', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Find current guest for property
    const currentGuest = await Guest.findCurrentByProperty(propertyId);
    
    if (!currentGuest) {
      return res.status(404).json({
        success: false,
        message: 'No current guest found for this property'
      });
    }
    
    // Get their profile
    const profile = await Guest.getProfile(currentGuest.id);
    
    res.json({
      success: true,
      data: {
        guestId: currentGuest.id,
        guestName: `${currentGuest.first_name} ${currentGuest.last_name}`.trim(),
        checkIn: currentGuest.check_in_date,
        checkOut: currentGuest.check_out_date,
        profile: profile || {}
      }
    });
  } catch (error) {
    console.error('Error fetching current guest profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current guest profile'
    });
  }
});

// Events routes for tvOS
router.get('/events', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const events = await Event.findAll({ limit });
    
    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    console.error('Error fetching events for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

router.get('/events/today', async (req, res) => {
  try {
    const events = await Event.getTodaysEvents();
    
    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    console.error('Error fetching today\'s events for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s events'
    });
  }
});

router.get('/events/upcoming', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const events = await Event.getUpcomingEvents(days);
    
    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    console.error('Error fetching upcoming events for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
});

router.get('/events/featured', async (req, res) => {
  try {
    const events = await Event.getFeaturedEvents();
    
    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    console.error('Error fetching featured events for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured events'
    });
  }
});

// Dining routes for tvOS
router.get('/dining/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    // Get Must_See and Highly_Recommended dining places
    const filters = {
      relevance_status: 'Must_See',
      limit: limit
    };
    const diningOptions = await DiningOption.findAll(filters);
    
    // Convert to tvOS format
    const diningPlaces = diningOptions.map(option => ({
      id: option.id,
      name: option.name_en || option.name_de,
      description: `${option.cuisine_type} cuisine` + (option.awards ? ` - ${option.awards}` : ''),
      cuisine_type: option.cuisine_type || 'Traditional',
      price_range: option.price_range ? (typeof option.price_range === 'number' ? '$'.repeat(Math.min(option.price_range, 4)) : option.price_range) : '$$',
      location: {
        latitude: parseFloat(option.latitude) || 47.3928,
        longitude: parseFloat(option.longitude) || 13.6863,
        name: option.location_area || option.city || 'Schladming',
        walking_time_minutes: null,
        driving_time_minutes: null
      },
      address: `${option.street_address || ''}, ${option.postal_code || ''} ${option.city || ''}`.trim(),
      phone: option.phone,
      website: option.website,
      opening_hours: {
        monday: option.hours_winter || '11:00-22:00',
        tuesday: option.hours_winter || '11:00-22:00',
        wednesday: option.hours_winter || '11:00-22:00',
        thursday: option.hours_winter || '11:00-22:00',
        friday: option.hours_winter || '11:00-23:00',
        saturday: option.hours_winter || '11:00-23:00',
        sunday: option.hours_winter || '11:00-22:00'
      },
      rating: "4.5",
      image_url: option.image_url,
      is_featured: option.relevance_status === 'Must_See' || option.relevance_status === 'Highly_Recommended',
      is_active: true,
      reservation_required: option.reservations_required === 'Yes' || option.reservations_required === 'Recommended',
      reservation_url: null,
      tags: [],
      created_at: option.created_at || new Date().toISOString(),
      updated_at: option.updated_at || new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: diningPlaces,
      total: diningPlaces.length
    });
  } catch (error) {
    console.error('Error fetching featured dining for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured dining places'
    });
  }
});

// Guest Profile endpoints for tvOS
router.get('/guests/:guestId/profile', async (req, res) => {
  try {
    const { guestId } = req.params;
    const profile = await Guest.getProfile(guestId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Guest profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest profile'
    });
  }
});

router.get('/dining/cuisine/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const filters = {
      cuisine_type: cuisine,
      limit: limit
    };
    const diningOptions = await DiningOption.findAll(filters);
    
    // Convert to tvOS format
    const diningPlaces = diningOptions.map(option => ({
      id: option.id,
      name: option.name_en || option.name_de,
      description: `${option.cuisine_type} cuisine` + (option.awards ? ` - ${option.awards}` : ''),
      cuisine_type: option.cuisine_type || 'Traditional',
      price_range: option.price_range ? (typeof option.price_range === 'number' ? '$'.repeat(Math.min(option.price_range, 4)) : option.price_range) : '$$',
      location: {
        latitude: parseFloat(option.latitude) || 47.3928,
        longitude: parseFloat(option.longitude) || 13.6863,
        name: option.location_area || option.city || 'Schladming',
        walking_time_minutes: null,
        driving_time_minutes: null
      },
      address: `${option.street_address || ''}, ${option.postal_code || ''} ${option.city || ''}`.trim(),
      phone: option.phone,
      website: option.website,
      opening_hours: {
        monday: option.hours_winter || '11:00-22:00',
        tuesday: option.hours_winter || '11:00-22:00',
        wednesday: option.hours_winter || '11:00-22:00',
        thursday: option.hours_winter || '11:00-22:00',
        friday: option.hours_winter || '11:00-23:00',
        saturday: option.hours_winter || '11:00-23:00',
        sunday: option.hours_winter || '11:00-22:00'
      },
      rating: "4.5",
      image_url: option.image_url,
      is_featured: option.relevance_status === 'Must_See' || option.relevance_status === 'Highly_Recommended',
      is_active: true,
      reservation_required: option.reservations_required === 'Yes' || option.reservations_required === 'Recommended',
      reservation_url: null,
      tags: [],
      created_at: option.created_at || new Date().toISOString(),
      updated_at: option.updated_at || new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: diningPlaces,
      total: diningPlaces.length
    });
  } catch (error) {
    console.error('Error fetching dining by cuisine for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining places by cuisine'
    });
  }
});

router.get('/dining', async (req, res) => {
  try {
    const { cuisine_type, price_range, limit = 20 } = req.query;
    
    const filters = {
      cuisine_type,
      price_range: price_range ? parseInt(price_range) : undefined,
      limit: parseInt(limit)
    };

    const diningOptions = await DiningOption.findAll(filters);
    
    // Convert to tvOS format
    const diningPlaces = diningOptions.map(option => ({
      id: option.id,
      name: option.name_en || option.name_de,
      description: `${option.cuisine_type} cuisine` + (option.awards ? ` - ${option.awards}` : ''),
      cuisine_type: option.cuisine_type || 'Traditional',
      price_range: option.price_range ? (typeof option.price_range === 'number' ? '$'.repeat(Math.min(option.price_range, 4)) : option.price_range) : '$$',
      location: {
        latitude: parseFloat(option.latitude) || 47.3928,
        longitude: parseFloat(option.longitude) || 13.6863,
        name: option.location_area || option.city || 'Schladming',
        walking_time_minutes: null,
        driving_time_minutes: null
      },
      address: `${option.street_address || ''}, ${option.postal_code || ''} ${option.city || ''}`.trim(),
      phone: option.phone,
      website: option.website,
      opening_hours: {
        monday: option.hours_winter || '11:00-22:00',
        tuesday: option.hours_winter || '11:00-22:00',
        wednesday: option.hours_winter || '11:00-22:00',
        thursday: option.hours_winter || '11:00-22:00',
        friday: option.hours_winter || '11:00-23:00',
        saturday: option.hours_winter || '11:00-23:00',
        sunday: option.hours_winter || '11:00-22:00'
      },
      rating: "4.5",
      image_url: option.image_url,
      is_featured: option.relevance_status === 'Must_See' || option.relevance_status === 'Highly_Recommended',
      is_active: true,
      reservation_required: option.reservations_required === 'Yes' || option.reservations_required === 'Recommended',
      reservation_url: null,
      tags: [],
      created_at: option.created_at || new Date().toISOString(),
      updated_at: option.updated_at || new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: diningPlaces,
      total: diningPlaces.length,
      filters: {
        cuisine_type: cuisine_type || 'all',
        price_range: price_range || 'all'
      }
    });
  } catch (error) {
    console.error('Error fetching dining places for tvOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining places'
    });
  }
});

// Smart dining recommendations based on guest profile, weather, season, and date
router.get('/recommendations/dining', async (req, res) => {
  try {
    const { 
      property_id, 
      latitude, 
      longitude, 
      guest_labels, 
      guest_profile,
      date,
      season,
      limit = 10 
    } = req.query;
    
    console.log('Dining recommendations request:', {
      guest_labels,
      guest_profile, 
      date,
      season,
      limit
    });
    
    // Get current date and determine season if not provided
    const targetDate = date ? new Date(date) : new Date();
    let targetSeason = season;
    if (!targetSeason) {
      const month = targetDate.getMonth() + 1;
      if (month >= 12 || month <= 3) targetSeason = 'winter';
      else if (month >= 4 && month <= 5) targetSeason = 'spring';
      else if (month >= 6 && month <= 9) targetSeason = 'summer';
      else if (month >= 10 && month <= 11) targetSeason = 'autumn';
    }
    
    // Get current weather for additional context
    let weatherCondition = null;
    try {
      weatherCondition = await weatherKitService.getWeatherForRecommendations(
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null
      );
    } catch (error) {
      console.warn('Could not fetch weather for dining recommendations:', error.message);
    }
    
    // Get all dining options
    const diningOptions = await DiningOption.findAll({ limit: limit * 3 }); // Get more to filter better
    
    // Parse guest profile and labels
    const guestLabels = guest_labels ? guest_labels.split(',') : [];
    const parsedGuestProfile = guest_profile ? JSON.parse(guest_profile) : {};
    
    // Enhanced recommendation logic
    const recommendations = diningOptions
      .map(dining => {
        let score = 3; // Base score
        const reasons = [];
        let matchingTags = [];
        
        // Season matching
        if (dining.season_recommendation) {
          if (dining.season_recommendation === 'Year_Round' || 
              dining.season_recommendation.toLowerCase().includes(targetSeason)) {
            score += 1;
            reasons.push(`Perfect for ${targetSeason}`);
          } else if (dining.season_recommendation !== 'Year_Round') {
            score -= 0.5;
          }
        }
        
        // Guest profile matching - target_guest_types
        if (dining.target_guest_types) {
          try {
            const targetTypes = JSON.parse(dining.target_guest_types);
            const profileMatches = guestLabels.filter(label => 
              targetTypes.includes(label) || 
              targetTypes.some(type => type.includes(label) || label.includes(type))
            );
            
            if (profileMatches.length > 0) {
              score += profileMatches.length * 1.5; // High weight for guest profile match
              reasons.push(`Perfect for ${profileMatches.join(', ')}`);
              matchingTags.push(...profileMatches);
            }
          } catch (e) {
            // Handle non-JSON target_guest_types
            console.warn('Invalid JSON in target_guest_types for dining:', dining.id);
          }
        }
        
        // Event type and atmosphere matching
        if (dining.event_type) {
          // Match Austrian_Party with boys/girls weekend
          if (dining.event_type === 'Austrian_Party' && 
              (guestLabels.includes('boys_weekend') || guestLabels.includes('girls_weekend'))) {
            score += 2;
            reasons.push('Authentic Austrian party atmosphere');
            matchingTags.push('Austrian Party');
          }
          
          // Match party goers with party atmospheres
          if ((dining.event_type.includes('Party') || dining.atmosphere === 'party') && 
              guestLabels.includes('party_goers')) {
            score += 1.5;
            reasons.push('Great party atmosphere');
            matchingTags.push('Party Venue');
          }
        }
        
        // Weather-based recommendations
        if (weatherCondition) {
          if (weatherCondition.condition === 'rain' || weatherCondition.rainProbability > 60) {
            // Indoor dining is better during rain
            if (dining.accessibility && dining.accessibility.includes('Indoor')) {
              score += 0.5;
              reasons.push('Cozy indoor dining for rainy weather');
            }
          } else if (weatherCondition.isGoodForOutdoor) {
            // Favor places with outdoor seating
            if (dining.capacity_outdoor && dining.capacity_outdoor > 0) {
              score += 1;
              reasons.push('Great outdoor seating for nice weather');
            }
          }
          
          // Temperature-based suggestions
          if (weatherCondition.temperature < 5) {
            // Favor warm, hearty cuisine in cold weather
            if (dining.cuisine_type?.includes('Austrian') || 
                dining.cuisine_type?.includes('Traditional') ||
                dining.event_type === 'Austrian_Party') {
              score += 1;
              reasons.push('Warm, hearty cuisine perfect for cold weather');
            }
          }
        }
        
        // Time-based recommendations
        const currentHour = new Date().getHours();
        if (currentHour >= 17 || currentHour <= 2) { // Evening/night
          if (dining.event_type || dining.atmosphere === 'party' || dining.atmosphere === 'lively') {
            score += 1;
            reasons.push('Perfect for evening entertainment');
          }
        } else if (currentHour >= 11 && currentHour <= 16) { // Lunch time
          if (dining.atmosphere === 'casual' || dining.atmosphere === 'family') {
            score += 0.5;
            reasons.push('Great for lunch');
          }
        }
        
        // Relevance status boost
        if (dining.relevance_status === 'Must_See') {
          score += 1.5;
          reasons.push('Must-see dining experience');
        } else if (dining.relevance_status === 'Highly_Recommended') {
          score += 1;
          reasons.push('Highly recommended by guests');
        }
        
        // Award boost
        if (dining.awards) {
          score += 0.5;
          reasons.push(`Award-winning: ${dining.awards}`);
        }
        
        // Add variety with slight randomness
        score += Math.random() * 0.3;
        
        if (reasons.length === 0) {
          reasons.push('Popular dining choice');
        }
        
        return {
          id: dining.id,
          name: dining.name_en || dining.name_de,
          description: `${dining.cuisine_type || 'Regional'} cuisine${dining.awards ? ` - ${dining.awards}` : ''}`,
          cuisine_type: dining.cuisine_type || 'Traditional',
          price_range: '€'.repeat(dining.price_range || 2),
          location: {
            latitude: parseFloat(dining.latitude) || 47.3928,
            longitude: parseFloat(dining.longitude) || 13.6863,
            name: dining.location_area || dining.city,
            walking_time_minutes: dining.access_time_minutes,
            access_methods: [
              dining.access_by_car && 'car',
              dining.access_by_cable_car && 'cable_car', 
              dining.access_by_hiking && 'hiking',
              dining.access_by_bike && 'bike',
              dining.access_by_lift && 'ski_lift',
              dining.access_by_public_transport && 'public_transport'
            ].filter(Boolean)
          },
          address: `${dining.street_address || ''}, ${dining.postal_code || ''} ${dining.city || ''}`.trim(),
          phone: dining.phone,
          website: dining.website,
          opening_hours: {
            winter: dining.hours_winter,
            summer: dining.hours_summer
          },
          image_url: dining.image_url,
          event_type: dining.event_type,
          atmosphere: dining.atmosphere,
          target_guest_types: dining.target_guest_types,
          features: {
            family_friendly: dining.family_friendly,
            vegetarian: dining.vegetarian,
            vegan: dining.vegan,
            gluten_free: dining.gluten_free,
            parking: dining.parking,
            reservation_required: dining.reservations_required === 'Yes'
          },
          recommendation_score: Math.min(5, Math.max(1, score)),
          recommendation_reasons: reasons,
          matching_tags: matchingTags,
          season_suitable: !dining.season_recommendation || 
                          dining.season_recommendation === 'Year_Round' ||
                          dining.season_recommendation.toLowerCase().includes(targetSeason),
          relevance_status: dining.relevance_status
        };
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);
    
    res.json({
      success: true,
      data: recommendations,
      context: {
        target_season: targetSeason,
        target_date: targetDate.toISOString().split('T')[0],
        weather_condition: weatherCondition?.condition || 'unknown',
        weather_description: weatherCondition?.description || 'Unknown',
        temperature: weatherCondition?.temperature || null,
        guest_labels: guestLabels,
        guest_profile: parsedGuestProfile,
        total_dining_places: diningOptions.length,
        weather_source: weatherCondition ? 'live' : 'unavailable'
      }
    });
  } catch (error) {
    console.error('Error getting dining recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dining recommendations',
      error: error.message
    });
  }
});

// Smart event recommendations based on guest profile, weather, season, and specific date
router.get('/recommendations/events', async (req, res) => {
  try {
    const { 
      property_id,
      guest_id, 
      date,
      category,
      limit = 5
    } = req.query;

    // Calculate target date
    const targetDate = date ? new Date(date) : new Date();
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 7); // Look ahead 7 days
    
    // Determine season from target date
    const targetMonth = targetDate.getMonth() + 1;
    const targetSeason = {
      12: 'winter', 1: 'winter', 2: 'winter',
      3: 'spring', 4: 'spring', 5: 'spring', 
      6: 'summer', 7: 'summer', 8: 'summer',
      9: 'autumn', 10: 'autumn', 11: 'autumn'
    }[targetMonth] || 'summer';
    
    // Query database for events in the date range
    const query = `
      SELECT 
        id, name, description, category, location, 
        start_date, end_date, image_url, source_url,
        price_info, is_featured, created_at, updated_at,
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
        ${category ? 'AND LOWER(category) = LOWER($' + (category ? 3 : '') + ')' : ''}
      ORDER BY 
        recommendation_score DESC,
        start_date ASC
      LIMIT $${category ? 4 : 3}
    `;
    
    const queryParams = [targetDate, endDate];
    if (category) {
      queryParams.push(category);
    }
    queryParams.push(limit);
    
    const result = await pool.query(query, queryParams);
    
    // Build enhanced event recommendations
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
      
      if (eventDate.getTime() === targetDate.getTime()) {
        reasons.push('🗓️ Happening on your selected day');
      } else if (eventDate.getTime() === today.getTime()) {
        reasons.push('🕐 Happening today');
      } else if (eventDate.getTime() === today.getTime() + 86400000) {
        reasons.push('📅 Happening tomorrow');
      }
      
      // Season matching
      reasons.push(`🌟 Perfect for ${targetSeason}`);
      
      if (reasons.length === 0) {
        reasons.push('🎉 Popular local event');
      }
      
      return {
        id: event.id,
        name: event.name,
        description: event.description || 'Local event',
        category: event.category || 'general',
        location: event.location || 'Local venue',
        start_date: event.start_date,
        end_date: event.end_date,
        duration: event.end_date ? `${Math.ceil((new Date(event.end_date) - new Date(event.start_date)) / (1000 * 60 * 60))} hours` : '2-3 hours',
        images: event.image_url ? [event.image_url] : [],
        price: event.price_info ? parseFloat(event.price_info) : null,
        is_featured: event.is_featured,
        recommendation_score: parseFloat(event.recommendation_score),
        reasons: reasons,
        booking_url: event.source_url,
        created_at: event.created_at,
        updated_at: event.updated_at
      };
    });
    
    res.json({
      success: true,
      data: recommendations,
      metadata: {
        requested_date: targetDate.toISOString().split('T')[0],
        season: targetSeason,
        search_range: `${targetDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        total_events_found: result.rows.length,
        category_filter: category || 'all'
      }
    });
    
  } catch (error) {
    console.error('Error getting event recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event recommendations',
      error: error.message
    });
  }
});

// Auth endpoint for tvOS (device registration)
router.post('/auth/device', async (req, res) => {
  try {
    const { deviceId, propertyId } = req.body;
    
    if (!deviceId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId and propertyId are required'
      });
    }
    
    // For tvOS, we'll create a simple device session
    // In a real app, this would validate the device against registered devices
    const sessionId = `tvos_${deviceId}_${Date.now()}`;
    
    res.json({
      success: true,
      data: {
        sessionId,
        deviceId,
        propertyId,
        accessToken: sessionId, // Use session ID as access token for simplicity
        expiresIn: 86400, // 24 hours
        tokenType: 'Bearer'
      }
    });
  } catch (error) {
    console.error('Error in tvOS device auth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate device'
    });
  }
});

export default router;