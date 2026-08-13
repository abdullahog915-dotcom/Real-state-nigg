-- Inquiries Table
-- Migration: 010_inquiries.sql
-- Stores customer inquiries and leads

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'phone', 'email')),
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'
  )),
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_assigned_agent_id ON inquiries(assigned_agent_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_email ON inquiries(email);

-- Updated at trigger
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE inquiries IS 'Customer inquiries and lead tracking';
COMMENT ON COLUMN inquiries.source IS 'How the inquiry was received';
COMMENT ON COLUMN inquiries.status IS 'Lead pipeline status';
