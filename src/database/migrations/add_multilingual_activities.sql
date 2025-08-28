-- Add multilingual support for activities
-- This migration adds German (and other language) columns to activities table

-- Add German title and description columns
ALTER TABLE activities ADD COLUMN IF NOT EXISTS title_de VARCHAR(255);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add generic language support (for future languages)
-- Using JSONB for flexible language support
ALTER TABLE activities ADD COLUMN IF NOT EXISTS multilingual_content JSONB DEFAULT '{}';

-- Create an index on the multilingual content for better performance
CREATE INDEX IF NOT EXISTS idx_activities_multilingual_content ON activities USING GIN(multilingual_content);

-- Comments for documentation
COMMENT ON COLUMN activities.title_de IS 'German translation of activity title';
COMMENT ON COLUMN activities.description_de IS 'German translation of activity description';
COMMENT ON COLUMN activities.multilingual_content IS 'JSONB field for flexible multilingual content support';