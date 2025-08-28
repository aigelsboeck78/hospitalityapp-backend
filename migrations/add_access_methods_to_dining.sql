-- Add access method fields to dining_options table
ALTER TABLE dining_options 
ADD COLUMN IF NOT EXISTS access_by_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_cable_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_hiking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_bike BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_lift BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_public_transport BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_difficulty VARCHAR(50), -- easy, moderate, difficult
ADD COLUMN IF NOT EXISTS access_time_minutes INTEGER, -- estimated time to reach
ADD COLUMN IF NOT EXISTS access_notes TEXT;

-- Create indexes for access method filtering
CREATE INDEX IF NOT EXISTS idx_dining_access_car ON dining_options(access_by_car);
CREATE INDEX IF NOT EXISTS idx_dining_access_hiking ON dining_options(access_by_hiking);
CREATE INDEX IF NOT EXISTS idx_dining_access_difficulty ON dining_options(access_difficulty);

COMMENT ON COLUMN dining_options.access_by_car IS 'Accessible by car/vehicle';
COMMENT ON COLUMN dining_options.access_by_cable_car IS 'Accessible by cable car/gondola';
COMMENT ON COLUMN dining_options.access_by_hiking IS 'Accessible by hiking/walking';
COMMENT ON COLUMN dining_options.access_by_bike IS 'Accessible by bicycle/mountain bike';
COMMENT ON COLUMN dining_options.access_by_lift IS 'Accessible by ski lift';
COMMENT ON COLUMN dining_options.access_by_public_transport IS 'Accessible by bus/train';
COMMENT ON COLUMN dining_options.access_difficulty IS 'Difficulty level for accessing (easy, moderate, difficult)';
COMMENT ON COLUMN dining_options.access_time_minutes IS 'Estimated time to reach in minutes';
COMMENT ON COLUMN dining_options.access_notes IS 'Additional access information and directions';