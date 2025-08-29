-- Increase image_url column size to support base64 data URLs
-- Base64 images can be quite large (up to 4.5MB as strings)
ALTER TABLE background_images 
ALTER COLUMN image_url TYPE TEXT;

-- Add comment explaining the change
COMMENT ON COLUMN background_images.image_url IS 'Image URL or base64 data URL. Changed to TEXT to support large base64 encoded images';