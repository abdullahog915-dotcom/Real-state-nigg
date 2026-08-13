-- Property Amenities Junction Table
-- Migration: 008_property_amenities.sql
-- Links properties to their amenities

CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(property_id, amenity_id)
);

-- Indexes
CREATE INDEX idx_property_amenities_property_id ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity_id ON property_amenities(amenity_id);

-- Comments
COMMENT ON TABLE property_amenities IS 'Junction table linking properties to amenities';
