-- Add title and description columns for better management
ALTER TABLE background_images 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Update existing records to use file_path as image_url if it's a full URL
UPDATE background_images 
SET image_url = file_path 
WHERE file_path LIKE 'http%' AND image_url IS NULL;

-- Insert some sample seasonal data
INSERT INTO background_images (property_id, filename, file_path, image_url, title, season, display_order) 
VALUES 
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'winter-mountain.jpg',
     '/uploads/winter-mountain.jpg',
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 
     'Winter Mountain View', 'winter', 1),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'snowy-peaks.jpg',
     '/uploads/snowy-peaks.jpg',
     'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1920&h=1080&fit=crop', 
     'Snowy Peaks', 'winter', 2),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'summer-lake.jpg',
     '/uploads/summer-lake.jpg',
     'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=1080&fit=crop', 
     'Summer Mountain Lake', 'summer', 1),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'alpine-meadow.jpg',
     '/uploads/alpine-meadow.jpg',
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 
     'Alpine Meadow', 'summer', 2),
    ('24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b', 
     'indoor-spa.jpg',
     '/uploads/indoor-spa.jpg',
     'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop', 
     'Indoor Spa', 'all', 1)
ON CONFLICT DO NOTHING;