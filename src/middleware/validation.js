import Joi from 'joi';

const guestTypes = ['family', 'all_male', 'all_female', 'couple', 'business', 'solo'];
const serviceTypes = ['streaming', 'music'];

// Property validation schema
const propertySchema = Joi.object({
  name: Joi.string().max(255).required(),
  type: Joi.string().valid('apartment', 'house', 'villa', 'condo', 'cabin', 'chalet', 'hotel', 'resort').default('apartment'),
  address: Joi.string().allow(null, ''),
  wifi_ssid: Joi.string().max(100).allow(null, ''),
  wifi_password: Joi.string().max(100).allow(null, ''),
  welcome_message: Joi.string().allow(null, ''),
  house_rules: Joi.string().allow(null, ''),
  emergency_contact: Joi.string().allow(null, ''),
  checkout_instructions: Joi.string().allow(null, ''),
  shop_enabled: Joi.boolean().default(false)
});

// Guest validation schema
const guestSchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  name: Joi.string().max(255).required(),
  first_name: Joi.string().max(255).allow(null, ''),
  last_name: Joi.string().max(255).allow(null, ''),
  email: Joi.string().email().max(255).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  guest_type: Joi.string().valid(...guestTypes).required(),
  party_size: Joi.number().integer().min(1).max(20).default(1),
  check_in_date: Joi.date().iso().required(),
  check_out_date: Joi.date().iso().min(Joi.ref('check_in_date')).required(),
  room_number: Joi.string().max(50).allow(null, ''),
  guest_labels: Joi.array().items(Joi.string()).default([]),
  special_requests: Joi.string().allow(null, ''),
  status: Joi.string().valid('reserved', 'checked_in', 'checkout_due', 'checked_out', 'cancelled').default('reserved'),
  notes: Joi.string().allow(null, ''),
  language: Joi.string().valid('en', 'de', 'fr', 'it', 'es').default('en'),
  // Enhanced profile fields
  profile_type: Joi.string().valid('family', 'couple', 'adventure', 'wellness', 'business').allow(null, ''),
  number_of_adults: Joi.number().integer().min(0).max(10).allow(null),
  number_of_children: Joi.number().integer().min(0).max(10).allow(null),
  preferred_activities: Joi.array().items(Joi.string()).allow(null),
  dietary_restrictions: Joi.array().items(Joi.string()).allow(null),
  accessibility_needs: Joi.array().items(Joi.string()).allow(null),
  budget_preference: Joi.string().valid('budget', 'moderate', 'premium', 'luxury').allow(null, ''),
  special_occasions: Joi.string().allow(null, ''),
  preferred_language: Joi.string().allow(null, ''),
  profile_completion_percentage: Joi.number().min(0).max(100).allow(null)
});

// Activity validation schema
const activitySchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  description: Joi.string().allow(null, ''),
  image_url: Joi.string().uri().max(500).allow(null, ''),
  activity_type: Joi.string().max(100).allow(null, ''),
  target_guest_types: Joi.array().items(Joi.string().valid(...guestTypes)).default(guestTypes),
  location: Joi.string().max(255).allow(null, ''),
  contact_info: Joi.string().max(255).allow(null, ''),
  operating_hours: Joi.string().max(255).allow(null, ''),
  price_range: Joi.string().max(50).allow(null, ''),
  booking_required: Joi.boolean().default(false),
  booking_url: Joi.string().uri().max(500).allow(null, ''),
  booking_phone: Joi.string().max(20).allow(null, ''),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().min(0).default(0),
  activity_labels: Joi.array().items(Joi.string()).allow(null),
  weather_suitability: Joi.array().items(Joi.string()).allow(null),
  title_de: Joi.string().max(255).allow(null, ''),
  description_de: Joi.string().allow(null, ''),
  multilingual_content: Joi.object().allow(null),
  season: Joi.string().valid('all', 'winter', 'summer', 'spring', 'autumn', 'winter_summer').default('all'),
  season_start_month: Joi.number().integer().min(1).max(12).default(1),
  season_end_month: Joi.number().integer().min(1).max(12).default(12),
  weather_dependent: Joi.boolean().default(false),
  min_temperature: Joi.number().integer().min(-50).max(50).allow(null),
  max_temperature: Joi.number().integer().min(-50).max(50).allow(null)
});

// Streaming service validation schema
const streamingServiceSchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  service_name: Joi.string().max(100).required(),
  service_type: Joi.string().valid(...serviceTypes).required(),
  app_url_scheme: Joi.string().max(255).allow(null, ''),
  logo_url: Joi.string().uri().max(500).allow(null, ''),
  instructions: Joi.string().allow(null, ''),
  requires_login: Joi.boolean().default(true),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().min(0).default(0)
});

// Guest session validation schema
const guestSessionSchema = Joi.object({
  streaming_service_id: Joi.string().uuid().required(),
  device_id: Joi.string().uuid().allow(null),
  session_token: Joi.string().max(500).allow(null, '')
});

// Validation middleware generator
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    req.body = value;
    next();
  };
};

// Export validation middleware functions
export const validateProperty = validate(propertySchema);
export const validateGuest = validate(guestSchema);
export const validateActivity = validate(activitySchema);
export const validateStreamingService = validate(streamingServiceSchema);
export const validateGuestSession = validate(guestSessionSchema);

// Guest update schema - all fields optional except property_id
const guestUpdateSchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  name: Joi.string().max(255),
  first_name: Joi.string().max(255).allow(null, ''),
  last_name: Joi.string().max(255).allow(null, ''),
  email: Joi.string().email().max(255).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  guest_type: Joi.string().valid(...guestTypes),
  party_size: Joi.number().integer().min(1).max(20),
  check_in_date: Joi.date().iso(),
  check_out_date: Joi.date().iso().when('check_in_date', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('check_in_date')),
    otherwise: Joi.date()
  }),
  room_number: Joi.string().max(50).allow(null, ''),
  guest_labels: Joi.array().items(Joi.string()),
  special_requests: Joi.string().allow(null, ''),
  status: Joi.string().valid('reserved', 'checked_in', 'checkout_due', 'checked_out', 'cancelled'),
  notes: Joi.string().allow(null, ''),
  language: Joi.string().valid('en', 'de', 'fr', 'it', 'es'),
  // Enhanced profile fields - support both field name conventions
  profile_type: Joi.string().valid('family', 'couple', 'adventure', 'wellness', 'business').allow(null, ''),
  adults: Joi.number().integer().min(0).max(10).allow(null),
  children: Joi.number().integer().min(0).max(10).allow(null),
  children_ages: Joi.array().items(Joi.number().integer()).allow(null),
  number_of_adults: Joi.number().integer().min(0).max(10).allow(null),
  number_of_children: Joi.number().integer().min(0).max(10).allow(null),
  preferences: Joi.alternatives().try(
    Joi.object().allow(null),
    Joi.array().items(Joi.string()).allow(null)
  ),
  preferred_activities: Joi.array().items(Joi.string()).allow(null),
  dietary_restrictions: Joi.array().items(Joi.string()).allow(null),
  accessibility_needs: Joi.array().items(Joi.string()).allow(null),
  allergies: Joi.array().items(Joi.string()).allow(null),
  budget_preference: Joi.string().valid('budget', 'moderate', 'premium', 'luxury').allow(null, ''),
  special_occasions: Joi.string().allow(null, ''),
  preferred_language: Joi.string().allow(null, ''),
  profile_completion_percentage: Joi.number().min(0).max(100).allow(null)
});

// Update schemas for partial updates
export const validatePropertyUpdate = validate(propertySchema.fork(Object.keys(propertySchema.describe().keys), (schema) => schema.optional()));
export const validateGuestUpdate = validate(guestUpdateSchema);
export const validateActivityUpdate = validate(activitySchema.fork(Object.keys(activitySchema.describe().keys), (schema) => schema.optional()));
export const validateStreamingServiceUpdate = validate(streamingServiceSchema.fork(Object.keys(streamingServiceSchema.describe().keys), (schema) => schema.optional()));