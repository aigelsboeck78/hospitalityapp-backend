-- Migration: Create shop_products table
-- Description: Table for storing alpine living goods and products for the Shop Moments feature
-- Date: 2025-08-14

-- Create shop_products table
CREATE TABLE IF NOT EXISTS shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Basic product information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) CHECK (original_price >= 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Images
    image_url TEXT,
    additional_images JSONB DEFAULT '[]'::jsonb,
    
    -- Category and availability
    category VARCHAR(50) NOT NULL,
    availability VARCHAR(20) DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
    stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
    
    -- Features
    is_featured BOOLEAN DEFAULT false,
    is_locally_made BOOLEAN DEFAULT true,
    is_sustainable BOOLEAN DEFAULT false,
    
    -- Craftsperson/Vendor details
    craftsperson_name VARCHAR(255),
    craftsperson_bio TEXT,
    vendor_id UUID,
    
    -- Product details
    materials JSONB DEFAULT '[]'::jsonb,
    dimensions VARCHAR(255),
    weight VARCHAR(50),
    care_instructions TEXT,
    
    -- Additional metadata
    tags JSONB DEFAULT '[]'::jsonb,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255),
    
    -- Ratings and reviews
    rating_average DECIMAL(3, 2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT unique_sku_per_property UNIQUE(property_id, sku),
    CONSTRAINT unique_slug_per_property UNIQUE(property_id, slug)
);

-- Create indexes for better query performance
CREATE INDEX idx_shop_products_property_id ON shop_products(property_id);
CREATE INDEX idx_shop_products_category ON shop_products(category);
CREATE INDEX idx_shop_products_availability ON shop_products(availability);
CREATE INDEX idx_shop_products_is_featured ON shop_products(is_featured);
CREATE INDEX idx_shop_products_is_active ON shop_products(is_active);
CREATE INDEX idx_shop_products_created_at ON shop_products(created_at DESC);
CREATE INDEX idx_shop_products_price ON shop_products(price);
CREATE INDEX idx_shop_products_rating ON shop_products(rating_average DESC);

-- Create full-text search index for product search
CREATE INDEX idx_shop_products_search ON shop_products 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(craftsperson_name, '')));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_shop_products_updated_at_trigger
    BEFORE UPDATE ON shop_products
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_products_updated_at();

-- Create shopping cart table for future use
CREATE TABLE IF NOT EXISTS shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    
    -- Cart status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted', 'expired')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    -- Create unique constraint for guest or session
    CONSTRAINT unique_cart_per_guest_or_session CHECK (
        (guest_id IS NOT NULL AND session_id IS NULL) OR 
        (guest_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL,
    
    -- Custom options (size, color, etc.)
    options JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate products in same cart (unless different options)
    CONSTRAINT unique_product_per_cart UNIQUE(cart_id, product_id, options)
);

-- Create indexes for cart tables
CREATE INDEX idx_shopping_carts_guest_id ON shopping_carts(guest_id);
CREATE INDEX idx_shopping_carts_session_id ON shopping_carts(session_id);
CREATE INDEX idx_shopping_carts_property_id ON shopping_carts(property_id);
CREATE INDEX idx_shopping_carts_status ON shopping_carts(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_wishlist_item UNIQUE(guest_id, product_id)
);

-- Create indexes for wishlist
CREATE INDEX idx_wishlists_guest_id ON wishlists(guest_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX idx_wishlists_property_id ON wishlists(property_id);

-- Add comment to the table
COMMENT ON TABLE shop_products IS 'Stores alpine living goods and products for the Shop Moments feature';
COMMENT ON TABLE shopping_carts IS 'Shopping carts for guests to collect products';
COMMENT ON TABLE cart_items IS 'Individual items in shopping carts';
COMMENT ON TABLE wishlists IS 'Guest wishlists for saving favorite products';

-- Grant permissions
GRANT ALL ON shop_products TO vacation_rental_user;
GRANT ALL ON shopping_carts TO vacation_rental_user;
GRANT ALL ON cart_items TO vacation_rental_user;
GRANT ALL ON wishlists TO vacation_rental_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vacation_rental_user;