-- Add seasonal support to existing background_images table
ALTER TABLE background_images 
ADD COLUMN IF NOT EXISTS season VARCHAR(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS upload_type VARCHAR(50) DEFAULT 'upload';

-- Add indexes for season queries
CREATE INDEX IF NOT EXISTS idx_background_images_season ON background_images(season);

-- Add comments
COMMENT ON COLUMN background_images.season IS 'Season for the image: winter, summer, spring, autumn, all';
COMMENT ON COLUMN background_images.upload_type IS 'How the image was added: upload or url';

-- Update any existing background images to have a season
UPDATE background_images SET season = 'all' WHERE season IS NULL;

-- Insert some sample seasonal data
INSERT INTO background_images (property_id, image_url, title, season, display_order) 
VALUES 
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 
     'Winter Mountain View', 'winter', 1),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1920&h=1080&fit=crop', 
     'Snowy Peaks', 'winter', 2),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=1080&fit=crop', 
     'Summer Mountain Lake', 'summer', 1),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 
     'Alpine Meadow', 'summer', 2),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop', 
     'Indoor Spa', 'all', 1)
ON CONFLICT DO NOTHING;