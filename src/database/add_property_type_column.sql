-- Add property type column to properties table
-- This migration adds the missing property type field

ALTER TABLE properties 
ADD COLUMN type VARCHAR(50) DEFAULT 'apartment';

-- Update existing properties to have a default type
UPDATE properties SET type = 'apartment' WHERE type IS NULL;

-- Add a check constraint for valid property types
ALTER TABLE properties 
ADD CONSTRAINT check_property_type 
CHECK (type IN ('apartment', 'house', 'villa', 'condo', 'cabin', 'chalet', 'hotel', 'resort'));