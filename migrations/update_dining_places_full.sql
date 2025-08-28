-- Drop existing foreign key constraint first
ALTER TABLE dining_places DROP CONSTRAINT IF EXISTS dining_places_property_id_fkey;

-- Add new columns if they don't exist
ALTER TABLE dining_places 
ADD COLUMN IF NOT EXISTS name_de VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_area VARCHAR(100),
ADD COLUMN IF NOT EXISTS street_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS altitude_m INTEGER,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS hours_winter TEXT,
ADD COLUMN IF NOT EXISTS hours_summer TEXT,
ADD COLUMN IF NOT EXISTS capacity_indoor INTEGER,
ADD COLUMN IF NOT EXISTS capacity_outdoor INTEGER,
ADD COLUMN IF NOT EXISTS capacity_total INTEGER,
ADD COLUMN IF NOT EXISTS awards TEXT,
ADD COLUMN IF NOT EXISTS accessibility VARCHAR(100),
ADD COLUMN IF NOT EXISTS parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS family_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vegetarian BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vegan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gluten_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reservations_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS season_recommendation VARCHAR(50),
ADD COLUMN IF NOT EXISTS relevance_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS opening_hours JSONB,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS atmosphere VARCHAR(50),
ADD COLUMN IF NOT EXISTS event_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS target_guest_types TEXT[],
ADD COLUMN IF NOT EXISTS access_by_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_cable_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_hiking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_bike BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_lift BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_by_public_transport BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_difficulty VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS access_notes TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Migrate existing data to new columns
UPDATE dining_places 
SET name_en = name,
    street_address = address,
    location = address,
    price_range = CASE 
        WHEN price_range = 'budget' THEN '1'
        WHEN price_range = 'moderate' THEN '2'
        WHEN price_range = 'expensive' THEN '3'
        WHEN price_range = 'luxury' THEN '4'
        ELSE price_range
    END
WHERE name_en IS NULL;

-- Drop the old columns
ALTER TABLE dining_places
DROP COLUMN IF EXISTS operating_hours,
DROP COLUMN IF EXISTS address;

-- Make property_id nullable (for general dining places not tied to a specific property)
ALTER TABLE dining_places ALTER COLUMN property_id DROP NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dining_places_cuisine ON dining_places(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_dining_places_location ON dining_places(location_area);
CREATE INDEX IF NOT EXISTS idx_dining_places_relevance ON dining_places(relevance_status);
CREATE INDEX IF NOT EXISTS idx_dining_places_featured ON dining_places(is_featured);
CREATE INDEX IF NOT EXISTS idx_dining_places_active ON dining_places(is_active);