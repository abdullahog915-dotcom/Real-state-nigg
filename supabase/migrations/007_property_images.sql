-- Property Images Table
-- Migration: 007_property_images.sql
-- Stores property gallery images with order

CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_display_order ON property_images(property_id, display_order);

-- Ensure only one featured image per property
CREATE UNIQUE INDEX idx_property_images_one_featured
  ON property_images(property_id)
  WHERE is_featured = true;

-- Comments
COMMENT ON TABLE property_images IS 'Property gallery images with ordering';
COMMENT ON COLUMN property_images.display_order IS 'Order to display images in gallery (lower first)';
COMMENT ON COLUMN property_images.is_featured IS 'Main property image (only one per property)';
