-- Create comprehensive dining options table
CREATE TABLE IF NOT EXISTS dining_options (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE NOT NULL,
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location_area VARCHAR(100),
    street_address VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    altitude_m INTEGER,
    phone VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    hours_winter TEXT,
    hours_summer TEXT,
    cuisine_type VARCHAR(100),
    price_range INTEGER CHECK (price_range BETWEEN 1 AND 5),
    capacity_indoor INTEGER,
    capacity_outdoor INTEGER,
    capacity_total INTEGER,
    awards TEXT,
    accessibility VARCHAR(100),
    parking BOOLEAN DEFAULT false,
    family_friendly BOOLEAN DEFAULT false,
    vegetarian BOOLEAN DEFAULT false,
    vegan BOOLEAN DEFAULT false,
    gluten_free BOOLEAN DEFAULT false,
    reservations_required VARCHAR(50),
    season_recommendation VARCHAR(50),
    relevance_status VARCHAR(50),
    image_url TEXT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_imported DATE
);

-- Create indexes for efficient querying
CREATE INDEX idx_dining_category ON dining_options(category);
CREATE INDEX idx_dining_location ON dining_options(location_area);
CREATE INDEX idx_dining_cuisine ON dining_options(cuisine_type);
CREATE INDEX idx_dining_price ON dining_options(price_range);
CREATE INDEX idx_dining_season ON dining_options(season_recommendation);
CREATE INDEX idx_dining_relevance ON dining_options(relevance_status);
CREATE INDEX idx_dining_active ON dining_options(is_active);
CREATE INDEX idx_dining_geo ON dining_options(latitude, longitude);

-- Create dining features junction table for better filtering
CREATE TABLE IF NOT EXISTS dining_features (
    id SERIAL PRIMARY KEY,
    dining_id INTEGER REFERENCES dining_options(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL,
    feature_value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dining_features_dining ON dining_features(dining_id);
CREATE INDEX idx_dining_features_type ON dining_features(feature_type);
CREATE INDEX idx_dining_features_value ON dining_features(feature_value);

-- Create dining hours table for structured hours
CREATE TABLE IF NOT EXISTS dining_hours (
    id SERIAL PRIMARY KEY,
    dining_id INTEGER REFERENCES dining_options(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL, -- 'winter' or 'summer'
    day_of_week VARCHAR(20), -- 'monday', 'tuesday', etc., or 'daily'
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dining_hours_dining ON dining_hours(dining_id);
CREATE INDEX idx_dining_hours_season ON dining_hours(season);

-- Create dining ratings/reviews table
CREATE TABLE IF NOT EXISTS dining_reviews (
    id SERIAL PRIMARY KEY,
    dining_id INTEGER REFERENCES dining_options(id) ON DELETE CASCADE,
    guest_name VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dining_reviews_dining ON dining_reviews(dining_id);
CREATE INDEX idx_dining_reviews_rating ON dining_reviews(rating);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_dining_options_updated_at
BEFORE UPDATE ON dining_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();