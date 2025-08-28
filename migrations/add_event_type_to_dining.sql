-- Add event type and guest profile matching fields to dining_options table
ALTER TABLE dining_options 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(100), -- e.g., 'Austrian_Party', 'Traditional_Party', 'Live_Music', 'DJ_Night'
ADD COLUMN IF NOT EXISTS atmosphere VARCHAR(50), -- e.g., 'party', 'romantic', 'family', 'business', 'casual'
ADD COLUMN IF NOT EXISTS target_guest_types TEXT; -- JSON array of guest types like activities have

-- Create indexes for guest profile matching
CREATE INDEX IF NOT EXISTS idx_dining_event_type ON dining_options(event_type);
CREATE INDEX IF NOT EXISTS idx_dining_atmosphere ON dining_options(atmosphere);

COMMENT ON COLUMN dining_options.event_type IS 'Type of events/entertainment (Austrian_Party, Traditional_Party, Live_Music, DJ_Night, etc.)';
COMMENT ON COLUMN dining_options.atmosphere IS 'General atmosphere/vibe (party, romantic, family, business, casual, lively, quiet)';
COMMENT ON COLUMN dining_options.target_guest_types IS 'JSON array of target guest types (boys_weekend, girls_weekend, couples, families, etc.)';