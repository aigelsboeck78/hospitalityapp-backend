-- Vacation Rental Hospitality System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table - Basic property information
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    welcome_message TEXT,
    house_rules TEXT,
    emergency_contact TEXT,
    checkout_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest types enum
CREATE TYPE guest_type AS ENUM ('family', 'all_male', 'all_female', 'couple', 'business', 'solo');

-- Guests table - Guest information with check-in/out times
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    guest_type guest_type NOT NULL DEFAULT 'family',
    party_size INTEGER DEFAULT 1,
    check_in_date TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_check_in TIMESTAMP WITH TIME ZONE,
    actual_check_out TIMESTAMP WITH TIME ZONE,
    special_requests TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table - Activity content with targeting
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    activity_type VARCHAR(100), -- e.g., 'restaurant', 'outdoor', 'entertainment', 'shopping'
    target_guest_types guest_type[] DEFAULT ARRAY['family', 'all_male', 'all_female', 'couple', 'business', 'solo']::guest_type[],
    location VARCHAR(255),
    contact_info VARCHAR(255),
    operating_hours VARCHAR(255),
    price_range VARCHAR(50),
    booking_required BOOLEAN DEFAULT FALSE,
    booking_url VARCHAR(500),
    booking_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaming services table - Available services per property
CREATE TABLE streaming_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- 'Netflix', 'Disney+', 'Hulu', etc.
    service_type VARCHAR(50) NOT NULL, -- 'streaming', 'music'
    app_url_scheme VARCHAR(255), -- for deep linking on tvOS
    logo_url VARCHAR(500),
    instructions TEXT,
    requires_login BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest sessions table - Session tracking for streaming logins
CREATE TABLE guest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    streaming_service_id UUID NOT NULL REFERENCES streaming_services(id) ON DELETE CASCADE,
    device_id UUID,
    session_token VARCHAR(500),
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_timestamp TIMESTAMP WITH TIME ZONE,
    auto_logout_scheduled TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table - Apple TV device management
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'apple_tv',
    mac_address VARCHAR(17),
    ip_address INET,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    software_version VARCHAR(50),
    is_online BOOLEAN DEFAULT FALSE,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_guests_property_id ON guests(property_id);
CREATE INDEX idx_guests_check_in_out ON guests(check_in_date, check_out_date);
CREATE INDEX idx_guests_is_active ON guests(is_active);
CREATE INDEX idx_guests_current_stay ON guests(property_id, check_in_date, check_out_date) WHERE is_active = TRUE;

CREATE INDEX idx_activities_property_id ON activities(property_id);
CREATE INDEX idx_activities_guest_types ON activities USING GIN(target_guest_types);
CREATE INDEX idx_activities_is_active ON activities(is_active);
CREATE INDEX idx_activities_display_order ON activities(property_id, display_order) WHERE is_active = TRUE;

CREATE INDEX idx_streaming_services_property_id ON streaming_services(property_id);
CREATE INDEX idx_streaming_services_is_active ON streaming_services(is_active);
CREATE INDEX idx_streaming_services_display_order ON streaming_services(property_id, display_order) WHERE is_active = TRUE;

CREATE INDEX idx_guest_sessions_guest_id ON guest_sessions(guest_id);
CREATE INDEX idx_guest_sessions_is_active ON guest_sessions(is_active);
CREATE INDEX idx_guest_sessions_auto_logout ON guest_sessions(auto_logout_scheduled) WHERE is_active = TRUE;

CREATE INDEX idx_devices_property_id ON devices(property_id);
CREATE INDEX idx_devices_is_online ON devices(is_online);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at timestamp
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_streaming_services_updated_at BEFORE UPDATE ON streaming_services
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_guest_sessions_updated_at BEFORE UPDATE ON guest_sessions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();