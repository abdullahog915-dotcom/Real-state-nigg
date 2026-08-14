-- Agents Table
-- Migration: 004_agents.sql
-- Stores real estate agent information

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  bio TEXT,
  photo_url TEXT,
  specialization TEXT[],
  locations TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_display_order ON agents(display_order);

-- Updated at trigger
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE agents IS 'Real estate agents who manage property listings';
COMMENT ON COLUMN agents.specialization IS 'Array of property specializations (e.g., residential, commercial)';
COMMENT ON COLUMN agents.locations IS 'Array of location names the agent covers';
