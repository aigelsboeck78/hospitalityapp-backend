import express from 'express';
import Activity from '../models/Activity.js';
import DiningOption from '../models/DiningOption.js';
import Event from '../models/Event.js';

const router = express.Router();

// Guest profile types matching the TV app
const GUEST_PROFILES = {
  FAMILY: 'family',
  COUPLE: 'couple',
  ADVENTURE: 'adventure',
  WELLNESS: 'wellness',
  BUSINESS: 'business',
  UNKNOWN: 'unknown'
};

// Weather conditions
const WEATHER_CONDITIONS = {
  SUNNY: { temperature: 22, precipitationChance: 10, condition: 'sunny', windSpeed: 5 },
  RAINY: { temperature: 15, precipitationChance: 75, condition: 'rainy', windSpeed: 10 },
  COLD: { temperature: 5, precipitationChance: 30, condition: 'cold', windSpeed: 15 },
  CLOUDY: { temperature: 18, precipitationChance: 40, condition: 'cloudy', windSpeed: 8 }
};

// Calculate activity score based on conditions
function calculateActivityScore(activity, weather, guestProfile, timeOfDay = 'afternoon') {
  let score = 50; // Base score
  
  // Weather impact (30 points)
  const weatherScore = getWeatherScore(activity, weather);
  score += weatherScore;
  
  // Guest profile impact (20 points)
  const profileScore = getProfileScore(activity, guestProfile);
  score += profileScore;
  
  // Time relevance (15 points)
  const timeScore = getTimeScore(activity, timeOfDay);
  score += timeScore;
  
  // Distance factor (10 points)
  const distance = activity.location?.distance_from_property || 10;
  score += distance < 5 ? 10 : distance < 10 ? 7 : distance < 20 ? 4 : 0;
  
  // Price consideration (10 points)
  const priceScore = getPriceScore(activity.price_range, guestProfile);
  score += priceScore;
  
  // Availability (5 points)
  score += 5;
  
  return {
    total: Math.max(0, Math.min(100, score)),
    breakdown: {
      base: 50,
      weather: weatherScore,
      profile: profileScore,
      time: timeScore,
      distance: distance < 5 ? 10 : distance < 10 ? 7 : distance < 20 ? 4 : 0,
      price: priceScore,
      availability: 5
    }
  };
}

function getWeatherScore(activity, weather) {
  // Determine if activity is outdoor
  const outdoorKeywords = ['playground', 'park', 'outdoor', 'hiking', 'biking', 'ski', 'golf', 'beach', 'garden', 'trail', 'mountain', 'lake'];
  const indoorKeywords = ['indoor', 'museum', 'spa', 'wellness', 'therme', 'cinema', 'theater', 'gallery'];
  
  const name = (activity.title || '').toLowerCase();
  const description = (activity.description || '').toLowerCase();
  
  const isOutdoor = outdoorKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  ) && !indoorKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
  
  if (isOutdoor) {
    if (weather.precipitationChance < 30 && weather.temperature >= 15 && weather.temperature <= 28) {
      return 30; // Good weather
    } else if (weather.precipitationChance > 60 || weather.temperature < 5) {
      return -30; // Bad weather
    } else if (weather.precipitationChance > 50) {
      return -20; // Rainy
    }
    return 10;
  } else {
    // Indoor activities
    if (weather.precipitationChance > 60 || weather.temperature < 5) {
      return 30; // Indoor is perfect for bad weather
    }
    return 15;
  }
}

function getProfileScore(activity, guestProfile) {
  const categoryProfiles = {
    'family': ['Family Activities', 'Entertainment', 'Nature', 'Tours'],
    'couple': ['Wellness', 'Dining', 'Culture', 'Nature'],
    'adventure': ['Adventure', 'Sports', 'Nature', 'Tours'],
    'wellness': ['Wellness', 'Nature', 'Culture'],
    'business': ['Dining', 'Wellness', 'Culture']
  };
  
  const preferredCategories = categoryProfiles[guestProfile] || [];
  const activityCategory = activity.activity_type || '';
  
  if (preferredCategories.some(cat => activityCategory.toLowerCase().includes(cat.toLowerCase()))) {
    return 20;
  }
  
  // Check for mismatches
  if (guestProfile === 'family' && activityCategory.toLowerCase().includes('adventure')) {
    return -10; // Too dangerous for kids
  }
  if (guestProfile === 'wellness' && (activityCategory.toLowerCase().includes('adventure') || activityCategory.toLowerCase().includes('sports'))) {
    return -10; // Too intense
  }
  
  return 5;
}

function getTimeScore(activity, timeOfDay) {
  const category = (activity.activity_type || '').toLowerCase();
  
  switch(timeOfDay) {
    case 'morning':
      if (category.includes('wellness') || category.includes('sports')) {
        return 15;
      }
      return 10;
    case 'afternoon':
      return 12; // Most activities good for afternoon
    case 'evening':
      if (category.includes('dining') || category.includes('entertainment')) {
        return 15;
      }
      return 5;
    default:
      return 10;
  }
}

function getPriceScore(priceRange, guestProfile) {
  const expensiveProfiles = ['couple', 'business'];
  
  switch(priceRange) {
    case 'free':
      return 10;
    case 'budget':
    case '€':
      return 8;
    case 'moderate':
    case '€€':
      return 6;
    case 'expensive':
    case '€€€':
      return expensiveProfiles.includes(guestProfile) ? 8 : 4;
    case 'luxury':
    case '€€€€':
      return expensiveProfiles.includes(guestProfile) ? 10 : 2;
    default:
      return 5;
  }
}

// Calculate dining score
function calculateDiningScore(dining, weather, guestProfile, timeOfDay = 'afternoon') {
  let score = 50; // Base score
  
  // Time-based meal matching (30 points)
  const mealScore = getMealTimeScore(timeOfDay);
  score += mealScore;
  
  // Weather consideration (20 points)
  if (weather.precipitationChance > 60 || weather.temperature < 5) {
    score += 20; // Indoor dining good for bad weather
  } else if (weather.precipitationChance < 30 && weather.temperature >= 15 && weather.temperature <= 28) {
    score += 15; // Any restaurant fine in good weather
  } else {
    score += 10;
  }
  
  // Guest profile matching (20 points)
  const profileScore = getDiningProfileScore(dining, guestProfile);
  score += profileScore;
  
  // Distance factor (15 points)
  const walkingTime = dining.location?.walkingTimeMinutes || 15;
  score += walkingTime <= 10 ? 15 : walkingTime <= 20 ? 10 : 5;
  
  // Price range (10 points)
  const priceScore = getPriceScore(dining.priceRange, guestProfile);
  score += priceScore;
  
  // Cuisine variety (5 points)
  score += 5;
  
  return {
    total: Math.max(0, Math.min(100, score)),
    breakdown: {
      base: 50,
      mealTime: mealScore,
      weather: weather.precipitationChance > 60 ? 20 : 10,
      profile: profileScore,
      distance: walkingTime <= 10 ? 15 : walkingTime <= 20 ? 10 : 5,
      price: priceScore,
      variety: 5
    }
  };
}

function getMealTimeScore(timeOfDay) {
  switch(timeOfDay) {
    case 'morning':
      return 30; // Breakfast
    case 'afternoon':
      return 25; // Lunch
    case 'evening':
      return 30; // Dinner
    case 'night':
      return 10; // Late night
    default:
      return 15;
  }
}

function getDiningProfileScore(dining, guestProfile) {
  const name = (dining.name || '').toLowerCase();
  const cuisine = (dining.cuisineType || '').toLowerCase();
  
  // Check for party/bar atmosphere
  const partyKeywords = ['bar', 'pub', 'club', 'lounge', 'cocktail', 'nightclub'];
  const isPartyVenue = partyKeywords.some(keyword => name.includes(keyword) || cuisine.includes(keyword));
  
  switch(guestProfile) {
    case 'family':
      if (isPartyVenue) return -5;
      const familyKeywords = ['family', 'kids', 'pizza', 'burger', 'casual'];
      if (familyKeywords.some(k => name.includes(k) || cuisine.includes(k))) return 20;
      return 10;
      
    case 'couple':
      const romanticKeywords = ['fine', 'gourmet', 'romantic', 'wine', 'intimate'];
      if (romanticKeywords.some(k => name.includes(k) || cuisine.includes(k))) return 20;
      if (isPartyVenue && name.includes('lounge')) return 15;
      return 10;
      
    case 'wellness':
      if (isPartyVenue) return -5;
      const healthyKeywords = ['vegan', 'vegetarian', 'healthy', 'organic', 'fresh'];
      if (healthyKeywords.some(k => name.includes(k) || cuisine.includes(k))) return 20;
      return 10;
      
    default:
      return 10;
  }
}

// API Routes

// Calculate score for a single activity
router.post('/activities/:id/score', async (req, res) => {
  try {
    const { weather = 'sunny', guestProfile = 'family', timeOfDay = 'afternoon' } = req.body;
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    const weatherCondition = WEATHER_CONDITIONS[weather.toUpperCase()] || WEATHER_CONDITIONS.SUNNY;
    const score = calculateActivityScore(activity, weatherCondition, guestProfile, timeOfDay);
    
    res.json({
      activity: {
        id: activity.id,
        name: activity.title,
        category: activity.activity_type
      },
      conditions: {
        weather: weather,
        guestProfile: guestProfile,
        timeOfDay: timeOfDay
      },
      score: score
    });
  } catch (error) {
    console.error('Error calculating activity score:', error);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

// Calculate scores for all activities
router.post('/activities/calculate-scores', async (req, res) => {
  try {
    const { propertyId, weather = 'sunny', guestProfile = 'family', timeOfDay = 'afternoon' } = req.body;
    
    const activities = await Activity.findByProperty(propertyId);
    const weatherCondition = WEATHER_CONDITIONS[weather.toUpperCase()] || WEATHER_CONDITIONS.SUNNY;
    
    const scoredActivities = activities.map(activity => {
      const score = calculateActivityScore(activity, weatherCondition, guestProfile, timeOfDay);
      return {
        id: activity.id,
        name: activity.title,
        category: activity.activity_type,
        description: activity.description,
        image_url: activity.image_url,
        location: activity.location,
        priceRange: activity.price_range,
        duration: activity.duration,
        score: score.total,
        breakdown: score.breakdown
      };
    });
    
    // Sort by score
    scoredActivities.sort((a, b) => b.score - a.score);
    
    res.json({
      conditions: {
        weather: weather,
        guestProfile: guestProfile,
        timeOfDay: timeOfDay
      },
      activities: scoredActivities,
      topRecommendations: scoredActivities.slice(0, 5)
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

// Calculate scores for dining options
router.post('/dining/calculate-scores', async (req, res) => {
  try {
    const { propertyId, weather = 'sunny', guestProfile = 'family', timeOfDay = 'evening' } = req.body;
    
    const diningOptions = await DiningOption.find({ property: propertyId, isActive: true });
    const weatherCondition = WEATHER_CONDITIONS[weather.toUpperCase()] || WEATHER_CONDITIONS.SUNNY;
    
    const scoredDining = diningOptions.map(dining => {
      const score = calculateDiningScore(dining, weatherCondition, guestProfile, timeOfDay);
      return {
        id: dining._id,
        name: dining.name,
        cuisineType: dining.cuisineType,
        description: dining.description,
        imageUrl: dining.imageUrl,
        location: dining.location,
        priceRange: dining.priceRange,
        score: score.total,
        breakdown: score.breakdown
      };
    });
    
    // Sort by score
    scoredDining.sort((a, b) => b.score - a.score);
    
    res.json({
      conditions: {
        weather: weather,
        guestProfile: guestProfile,
        timeOfDay: timeOfDay
      },
      dining: scoredDining,
      topRecommendations: scoredDining.slice(0, 5)
    });
  } catch (error) {
    console.error('Error calculating dining scores:', error);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

// Get preview of what will show in TV app
router.post('/preview-recommendations', async (req, res) => {
  try {
    const { propertyId, weather = 'sunny', guestProfile = 'family', timeOfDay = 'afternoon' } = req.body;
    
    const [activities, diningOptions, events] = await Promise.all([
      Activity.findByProperty(propertyId),
      DiningOption.find({ property: propertyId, isActive: true }),
      Event.find({ property: propertyId, isActive: true })
    ]);
    
    const weatherCondition = WEATHER_CONDITIONS[weather.toUpperCase()] || WEATHER_CONDITIONS.SUNNY;
    
    // Score all content
    const scoredActivities = activities.map(a => ({
      ...a,
      score: calculateActivityScore(a, weatherCondition, guestProfile, timeOfDay).total,
      type: 'activity'
    }));
    
    const scoredDining = diningOptions.map(d => ({
      ...d.toObject ? d.toObject() : d,
      score: calculateDiningScore(d, weatherCondition, guestProfile, timeOfDay).total,
      type: 'dining'
    }));
    
    // Combine and sort
    let allRecommendations = [...scoredActivities, ...scoredDining];
    allRecommendations.sort((a, b) => b.score - a.score);
    
    // Apply diversity rules (max 2 of same type)
    const finalRecommendations = [];
    const typeCount = { activity: 0, dining: 0, event: 0 };
    
    for (const item of allRecommendations) {
      if (typeCount[item.type] < 2 && finalRecommendations.length < 5) {
        finalRecommendations.push(item);
        typeCount[item.type]++;
      }
    }
    
    res.json({
      conditions: {
        weather: weather,
        guestProfile: guestProfile,
        timeOfDay: timeOfDay,
        weatherDetails: weatherCondition
      },
      recommendations: finalRecommendations,
      summary: {
        totalActivities: activities.length,
        totalDining: diningOptions.length,
        selectedCount: finalRecommendations.length,
        typeBreakdown: typeCount
      }
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

export default router;