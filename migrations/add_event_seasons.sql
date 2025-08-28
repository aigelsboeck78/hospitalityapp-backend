-- Add seasonal fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS season VARCHAR(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS season_start_month INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS season_end_month INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS weather_dependent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_temperature INTEGER,
ADD COLUMN IF NOT EXISTS max_temperature INTEGER;

-- Add index for season queries
CREATE INDEX IF NOT EXISTS idx_events_season ON events(season);
CREATE INDEX IF NOT EXISTS idx_events_season_months ON events(season_start_month, season_end_month);

-- Update existing events with appropriate seasons
UPDATE events SET 
    season = 'winter',
    season_start_month = 12,
    season_end_month = 3,
    weather_dependent = true,
    min_temperature = -20,
    max_temperature = 5
WHERE LOWER(name) LIKE '%ski%' 
   OR LOWER(name) LIKE '%snowboard%' 
   OR LOWER(name) LIKE '%winter%'
   OR LOWER(category) = 'winter_sports';

UPDATE events SET 
    season = 'summer',
    season_start_month = 6,
    season_end_month = 9,
    weather_dependent = true,
    min_temperature = 15,
    max_temperature = 35
WHERE LOWER(name) LIKE '%hiking%' 
   OR LOWER(name) LIKE '%swimming%' 
   OR LOWER(name) LIKE '%summer%'
   OR LOWER(name) LIKE '%beach%'
   OR LOWER(category) = 'summer_sports';

-- Set indoor events to all seasons
UPDATE events SET 
    season = 'all',
    weather_dependent = false
WHERE LOWER(name) LIKE '%indoor%' 
   OR LOWER(name) LIKE '%museum%' 
   OR LOWER(name) LIKE '%spa%'
   OR LOWER(name) LIKE '%wellness%';

-- Season enum values for reference:
-- 'winter' - December to March (ski season)
-- 'summer' - June to September 
-- 'spring' - April to May
-- 'autumn' - October to November
-- 'all' - Year-round activities
-- 'winter_summer' - Available in both peak seasons (e.g., mountain activities)

COMMENT ON COLUMN events.season IS 'Primary season for the event: winter, summer, spring, autumn, all, winter_summer';
COMMENT ON COLUMN events.season_start_month IS 'Month when season starts (1-12)';
COMMENT ON COLUMN events.season_end_month IS 'Month when season ends (1-12)';
COMMENT ON COLUMN events.weather_dependent IS 'Whether event depends on weather conditions';
COMMENT ON COLUMN events.min_temperature IS 'Minimum temperature in Celsius for outdoor events';
COMMENT ON COLUMN events.max_temperature IS 'Maximum temperature in Celsius for outdoor events';