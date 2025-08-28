-- Create background_images table with seasonal support
CREATE TABLE IF NOT EXISTS background_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    season VARCHAR(50) DEFAULT 'all',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    upload_type VARCHAR(50) DEFAULT 'upload', -- 'upload' or 'url'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_background_images_property ON background_images(property_id);
CREATE INDEX IF NOT EXISTS idx_background_images_season ON background_images(season);
CREATE INDEX IF NOT EXISTS idx_background_images_active ON background_images(is_active);

-- Add comments
COMMENT ON TABLE background_images IS 'Seasonal background images for properties in tvOS app';
COMMENT ON COLUMN background_images.season IS 'Season for the image: winter, summer, spring, autumn, all';
COMMENT ON COLUMN background_images.upload_type IS 'How the image was added: upload or url';

-- Insert some sample data for testing (optional)
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