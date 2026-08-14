-- Site Settings Table
-- Migration: 015_site_settings.sql
-- Stores configurable site settings

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json')),
  group_name TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_group ON site_settings(group_name);

-- Updated at trigger
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Social Links Table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN (
    'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'whatsapp'
  )),
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_social_links_platform ON social_links(platform);
CREATE INDEX idx_social_links_is_active ON social_links(is_active);
CREATE INDEX idx_social_links_display_order ON social_links(display_order);

-- Comments
COMMENT ON TABLE site_settings IS 'Configurable site settings (company name, logo, contact info, etc.)';
COMMENT ON TABLE social_links IS 'Social media links for website footer and contact pages';
