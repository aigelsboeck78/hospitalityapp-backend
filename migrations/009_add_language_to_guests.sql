-- Add language column to guests table for tvOS locale support
ALTER TABLE guests ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en';

-- Add a check constraint to ensure valid language codes
ALTER TABLE guests ADD CONSTRAINT guests_language_check 
  CHECK (language IN ('en', 'de', 'fr', 'it', 'es'));

-- Update existing guests to have default language
UPDATE guests SET language = 'en' WHERE language IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE guests ALTER COLUMN language SET NOT NULL;