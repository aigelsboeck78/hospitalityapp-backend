-- Add new columns to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS activity_labels TEXT[];
ALTER TABLE activities ADD COLUMN IF NOT EXISTS weather_suitability TEXT[];

-- Add new columns to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS guest_labels TEXT[];
ALTER TABLE guests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing activities with sample labels and weather suitability
UPDATE activities SET 
  activity_labels = ARRAY['family', 'chill'] 
WHERE activity_type = 'outdoor' AND title LIKE '%National Park%';

UPDATE activities SET 
  activity_labels = ARRAY['chill', 'girls_weekend'],
  weather_suitability = ARRAY['indoor', 'all_weather']
WHERE activity_type = 'wellness';

UPDATE activities SET 
  activity_labels = ARRAY['family', 'boys_weekend'],
  weather_suitability = ARRAY['indoor', 'rainy', 'all_weather']
WHERE activity_type = 'restaurant';

UPDATE activities SET 
  activity_labels = ARRAY['intense', 'boys_weekend'],
  weather_suitability = ARRAY['sunny', 'cloudy']
WHERE activity_type = 'outdoor' AND title LIKE '%Adventure%';

UPDATE activities SET 
  activity_labels = ARRAY['boys_weekend'],
  weather_suitability = ARRAY['sunny', 'cloudy']
WHERE activity_type = 'recreation';

UPDATE activities SET 
  activity_labels = ARRAY['family', 'girls_weekend', 'chill'],
  weather_suitability = ARRAY['indoor', 'all_weather']
WHERE activity_type = 'shopping';