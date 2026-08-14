-- Viewing Requests Table
-- Migration: 011_viewing_requests.sql
-- Stores property viewing appointments

CREATE TABLE IF NOT EXISTS viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested', 'confirmed', 'completed', 'cancelled'
  )),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_viewing_requests_property_id ON viewing_requests(property_id);
CREATE INDEX idx_viewing_requests_status ON viewing_requests(status);
CREATE INDEX idx_viewing_requests_agent_id ON viewing_requests(agent_id);
CREATE INDEX idx_viewing_requests_preferred_date ON viewing_requests(preferred_date);
CREATE INDEX idx_viewing_requests_created_at ON viewing_requests(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_viewing_requests_updated_at
  BEFORE UPDATE ON viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE viewing_requests IS 'Property viewing appointment requests';
COMMENT ON COLUMN viewing_requests.preferred_date IS 'Customer preferred viewing date';
COMMENT ON COLUMN viewing_requests.preferred_time IS 'Customer preferred viewing time';
