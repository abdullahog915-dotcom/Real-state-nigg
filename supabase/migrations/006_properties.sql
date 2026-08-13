-- Properties Table
-- Migration: 006_properties.sql
-- Main property listings table

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  property_id TEXT UNIQUE,

  -- Type and Status
  property_type TEXT NOT NULL CHECK (property_type IN (
    'apartment', 'duplex', 'detached', 'semi-detached', 'terrace',
    'penthouse', 'villa', 'land', 'commercial', 'office',
    'warehouse', 'shop', 'hotel', 'estate'
  )),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent', 'short-let')),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'published', 'featured', 'sold', 'rented', 'archived'
  )),

  -- Pricing
  price DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',

  -- Location
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  toilets INTEGER,
  area DECIMAL(10, 2),
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  parking_spaces INTEGER,
  floors INTEGER,
  is_furnished BOOLEAN DEFAULT false,

  -- Media
  featured_image TEXT,
  gallery_images TEXT[],
  floor_plan_url TEXT,
  video_url TEXT,

  -- Assignment
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,

  -- Tracking
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_location_id ON properties(location_id);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_published_at ON properties(published_at DESC);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Full text search index on title and description
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Updated at trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('published', 'featured') AND OLD.status NOT IN ('published', 'featured') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_published_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Comments
COMMENT ON TABLE properties IS 'Main property listings table';
COMMENT ON COLUMN properties.property_id IS 'Public-facing property reference ID';
COMMENT ON COLUMN properties.gallery_images IS 'Array of image URLs for property gallery';
COMMENT ON COLUMN properties.views_count IS 'Number of times property detail page was viewed';
