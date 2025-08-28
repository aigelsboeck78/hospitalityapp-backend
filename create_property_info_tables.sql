-- Create property information/amenities table
CREATE TABLE IF NOT EXISTS property_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'amenity', 'guide', 'service'
    type VARCHAR(50) NOT NULL, -- 'wifi', 'heating', 'fireplace', 'pool', 'summercard', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT, -- How-to information
    icon VARCHAR(100), -- Icon identifier for tvOS
    url VARCHAR(500), -- Optional URL for more info (e.g., summer card link)
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Additional data like wifi password, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, type)
);

-- Create index for faster queries
CREATE INDEX idx_property_info_property_active ON property_information(property_id, is_active);
CREATE INDEX idx_property_info_type ON property_information(type);

-- Insert default information templates for property 1
INSERT INTO property_information (property_id, category, type, title, description, instructions, icon, url, display_order, metadata) VALUES
-- WiFi
((SELECT id FROM properties LIMIT 1), 'amenity', 'wifi', 'WiFi', 'High-speed internet throughout the property', 
'Network Name: ChaletMoments_Guest
Password: Available at check-in
Speed: 100+ Mbps fiber connection', 
'wifi', NULL, 1, '{"network": "ChaletMoments_Guest", "speed": "100 Mbps"}'),

-- Heating
((SELECT id FROM properties LIMIT 1), 'amenity', 'heating', 'Heating', 'Modern underfloor heating system', 
'The heating is controlled via the wall panel in the living room.
- Press the power button to turn on/off
- Use +/- buttons to adjust temperature (recommended: 21°C)
- Night mode: Automatically reduces to 18°C from 10 PM to 6 AM', 
'thermometer', NULL, 2, '{"type": "underfloor", "control": "digital"}'),

-- Fireplace
((SELECT id FROM properties LIMIT 1), 'amenity', 'fireplace', 'Fireplace', 'Traditional wood-burning fireplace', 
'1. Open the damper using the lever on the right
2. Place kindling and firewood (stored outside)
3. Light with matches (in drawer below)
4. Keep glass doors closed while burning
5. Ensure damper is closed when not in use', 
'flame', NULL, 3, '{"type": "wood-burning"}'),

-- Pool/Whirlpool
((SELECT id FROM properties LIMIT 1), 'amenity', 'pool', 'Pool & Whirlpool', 'Outdoor heated pool and whirlpool', 
'Pool Hours: 7 AM - 10 PM
Temperature: 28°C (pool), 36°C (whirlpool)
- Press green button to activate jets
- Shower before entering
- Cover after use', 
'drop', NULL, 4, '{"pool_temp": "28°C", "whirlpool_temp": "36°C", "hours": "7:00-22:00"}'),

-- Summer Card
((SELECT id FROM properties LIMIT 1), 'service', 'summercard', 'Schladming-Dachstein Summer Card', 'Your key to over 100 attractions and activities', 
'Your Summer Card is included with your stay!
- Pick up at check-in
- Free access to cable cars, swimming pools, and museums
- Discounts on many activities
- Valid for your entire stay', 
'ticket', 'https://www.schladming-dachstein.at/de/Sommer/Sommercard', 5, 
'{"included": true, "benefits": ["Free cable cars", "Free swimming pools", "Free museums", "Activity discounts"]}'),

-- TV & Entertainment
((SELECT id FROM properties LIMIT 1), 'amenity', 'tv', 'TV & Entertainment', 'Smart TV with streaming services', 
'- Use the silver remote for TV control
- Netflix, Amazon Prime, and Disney+ are logged in
- For Apple TV: Use the black remote
- Sound system: Press AUX on the Sonos app', 
'tv', NULL, 6, '{"services": ["Netflix", "Amazon Prime", "Disney+", "Apple TV+"]}'),

-- Kitchen
((SELECT id FROM properties LIMIT 1), 'guide', 'kitchen', 'Kitchen Appliances', 'Fully equipped modern kitchen', 
'Coffee Machine: Nespresso (capsules in drawer)
Dishwasher: Tablets under sink, Eco mode recommended
Induction Hob: Use compatible pans only
Oven: Turn dial to desired mode and temperature', 
'fork-knife', NULL, 7, '{"appliances": ["Nespresso", "Dishwasher", "Induction hob", "Steam oven"]}'),

-- Waste & Recycling
((SELECT id FROM properties LIMIT 1), 'guide', 'recycling', 'Waste & Recycling', 'Please help us recycle', 
'- Black bin: General waste
- Yellow bag: Plastic and metal
- Blue bin: Paper
- Brown bin: Organic waste
- Glass: Container at parking area
Collection: Tuesday mornings', 
'leaf', NULL, 8, '{"collection_day": "Tuesday"}'),

-- Emergency
((SELECT id FROM properties LIMIT 1), 'guide', 'emergency', 'Emergency Information', 'Important contacts and procedures', 
'Emergency: 112
Fire extinguisher: Kitchen and garage
First aid kit: Bathroom cabinet
Power fuse box: Utility room
Water shut-off: Basement
Property Manager: +43 XXX XXXX', 
'phone', NULL, 9, '{"emergency_number": "112"}'),

-- Check-out
((SELECT id FROM properties LIMIT 1), 'guide', 'checkout', 'Check-out Procedure', 'Before you leave', 
'Check-out time: 10:00 AM
- Strip beds (leave linens in laundry room)
- Load and start dishwasher
- Take out trash
- Turn off all lights and heating
- Lock all doors and windows
- Leave keys in the key box', 
'clock', NULL, 10, '{"time": "10:00"}'
);
