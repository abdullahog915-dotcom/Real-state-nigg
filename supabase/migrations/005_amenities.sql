-- Amenities Table
-- Migration: 005_amenities.sql
-- Stores available property amenities

CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  category TEXT CHECK (category IN ('general', 'security', 'facilities', 'services')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_amenities_category ON amenities(category);
CREATE INDEX idx_amenities_slug ON amenities(slug);
CREATE INDEX idx_amenities_display_order ON amenities(display_order);

-- Comments
COMMENT ON TABLE amenities IS 'Available property amenities (pool, gym, security, etc.)';
COMMENT ON COLUMN amenities.icon IS 'Lucide icon name for UI display';
COMMENT ON COLUMN amenities.category IS 'Amenity category for grouping in UI';
