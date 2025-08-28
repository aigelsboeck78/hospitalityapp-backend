-- Add guest profile configuration to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS guest_profile_config JSONB DEFAULT '{
  "enabled": true,
  "profile_types": {
    "family": { "enabled": true, "label": "Family", "icon": "person.3.fill", "description": "Perfect for families with children" },
    "couple": { "enabled": true, "label": "Couple", "icon": "heart.fill", "description": "Romantic experiences for two" },
    "adventure": { "enabled": true, "label": "Adventure", "icon": "figure.hiking", "description": "Thrill-seekers welcome!" },
    "wellness": { "enabled": true, "label": "Wellness", "icon": "leaf.fill", "description": "Focus on relaxation and health" },
    "business": { "enabled": true, "label": "Business", "icon": "briefcase.fill", "description": "Professional stays with amenities" }
  },
  "preferences": {
    "activities": {
      "enabled": true,
      "label": "Preferred Activities",
      "options": ["Skiing", "Hiking", "Swimming", "Dining", "Shopping", "Spa", "Tours", "Museums", "Playgrounds", "Family Restaurants", "Kid Activities"]
    },
    "dietary": {
      "enabled": true,
      "label": "Dietary Restrictions",
      "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "Kosher", "Nut-Free"]
    },
    "accessibility": {
      "enabled": true,
      "label": "Accessibility Needs",
      "options": ["Wheelchair Access", "Elevator Required", "Ground Floor", "Hearing Assistance", "Visual Assistance"]
    },
    "budget": {
      "enabled": true,
      "label": "Budget Preference",
      "options": ["Budget", "Moderate", "Premium", "Luxury"]
    },
    "languages": {
      "enabled": true,
      "label": "Languages",
      "options": ["EN", "DE", "FR", "IT", "ES", "NL", "PL", "RU", "ZH", "JA"]
    }
  },
  "party_details": {
    "adults": { "enabled": true, "min": 1, "max": 10, "default": 2 },
    "children": { "enabled": true, "min": 0, "max": 10, "default": 0 },
    "pets": { "enabled": false, "min": 0, "max": 3, "default": 0 }
  },
  "additional_fields": {
    "special_occasions": { "enabled": true, "label": "Special Occasions", "type": "text" },
    "arrival_time": { "enabled": false, "label": "Arrival Time", "type": "time" },
    "transportation": { "enabled": false, "label": "Transportation Method", "type": "select", "options": ["Car", "Train", "Plane", "Bus"] }
  }
}'::jsonb;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_guest_profile_config ON properties USING GIN (guest_profile_config);

COMMENT ON COLUMN properties.guest_profile_config IS 'Configuration for guest profile options shown in tvOS app';