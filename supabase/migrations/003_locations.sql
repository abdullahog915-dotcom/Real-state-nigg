-- Locations Table
-- Migration: 003_locations.sql
-- Stores Nigerian cities and neighborhoods

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria',
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_state ON locations(state);
CREATE INDEX idx_locations_is_featured ON locations(is_featured);
CREATE INDEX idx_locations_display_order ON locations(display_order);

-- Updated at trigger
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE locations IS 'Nigerian cities and neighborhoods for property listings';
COMMENT ON COLUMN locations.slug IS 'URL-friendly location identifier';
COMMENT ON COLUMN locations.is_featured IS 'Featured locations shown prominently on homepage';
