-- Add seasonal fields to activities table (same as events)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS season VARCHAR(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS season_start_month INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS season_end_month INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS weather_dependent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_temperature INTEGER,
ADD COLUMN IF NOT EXISTS max_temperature INTEGER;

-- Add index for season queries
CREATE INDEX IF NOT EXISTS idx_activities_season ON activities(season);
CREATE INDEX IF NOT EXISTS idx_activities_season_months ON activities(season_start_month, season_end_month);

-- Update existing activities with appropriate seasons based on their type and labels
UPDATE activities SET 
    season = 'winter',
    season_start_month = 12,
    season_end_month = 3,
    weather_dependent = true,
    min_temperature = -20,
    max_temperature = 5
WHERE LOWER(title) LIKE '%ski%' 
   OR LOWER(title) LIKE '%snowboard%' 
   OR LOWER(title) LIKE '%winter%'
   OR LOWER(description) LIKE '%ski%'
   OR activity_type = 'winter_sports'
   OR 'winter' = ANY(activity_labels);

UPDATE activities SET 
    season = 'summer',
    season_start_month = 6,
    season_end_month = 9,
    weather_dependent = true,
    min_temperature = 15,
    max_temperature = 35
WHERE LOWER(title) LIKE '%hik%' 
   OR LOWER(title) LIKE '%bike%' 
   OR LOWER(title) LIKE '%swim%'
   OR LOWER(title) LIKE '%summer%'
   OR activity_type = 'outdoor'
   OR 'summer' = ANY(activity_labels);

-- Set indoor/wellness activities to all seasons
UPDATE activities SET 
    season = 'all',
    weather_dependent = false
WHERE activity_type IN ('wellness', 'shopping', 'cultural', 'entertainment')
   OR 'indoor' = ANY(weather_suitability)
   OR 'all_weather' = ANY(weather_suitability);

COMMENT ON COLUMN activities.season IS 'Primary season for the activity: winter, summer, spring, autumn, all, winter_summer';
COMMENT ON COLUMN activities.season_start_month IS 'Month when season starts (1-12)';
COMMENT ON COLUMN activities.season_end_month IS 'Month when season ends (1-12)';
COMMENT ON COLUMN activities.weather_dependent IS 'Whether activity depends on weather conditions';
COMMENT ON COLUMN activities.min_temperature IS 'Minimum temperature in Celsius for outdoor activities';
COMMENT ON COLUMN activities.max_temperature IS 'Maximum temperature in Celsius for outdoor activities';