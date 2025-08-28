-- Create property_information table for storing property amenities and information
CREATE TABLE IF NOT EXISTS property_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    icon VARCHAR(50),
    url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_property_information_property_id ON property_information(property_id);
CREATE INDEX IF NOT EXISTS idx_property_information_category ON property_information(category);
CREATE INDEX IF NOT EXISTS idx_property_information_type ON property_information(type);
CREATE INDEX IF NOT EXISTS idx_property_information_active ON property_information(is_active);
CREATE INDEX IF NOT EXISTS idx_property_information_order ON property_information(display_order);

-- Create unique constraint to prevent duplicate types per property
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_information_unique_type 
ON property_information(property_id, type) 
WHERE type IN ('wifi', 'check_in', 'check_out', 'parking', 'emergency');

-- Add comment to table
COMMENT ON TABLE property_information IS 'Stores property amenities, rules, and general information';