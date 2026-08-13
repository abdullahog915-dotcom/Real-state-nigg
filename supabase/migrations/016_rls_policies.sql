-- Row Level Security Policies
-- Migration: 016_rls_policies.sql
-- Implements security at the database level

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is agent
CREATE OR REPLACE FUNCTION is_agent()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('agent', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- =====================
-- AGENTS POLICIES
-- =====================

-- Anyone can view active agents
CREATE POLICY "Anyone can view active agents"
  ON agents FOR SELECT
  TO public
  USING (is_active = true);

-- Admins have full access to agents
CREATE POLICY "Admins have full access to agents"
  ON agents FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- LOCATIONS POLICIES
-- =====================

-- Anyone can view locations
CREATE POLICY "Anyone can view locations"
  ON locations FOR SELECT
  TO public
  USING (true);

-- Admins can manage locations
CREATE POLICY "Admins can manage locations"
  ON locations FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- PROPERTIES POLICIES
-- =====================

-- Anyone can view published properties
CREATE POLICY "Anyone can view published properties"
  ON properties FOR SELECT
  TO public
  USING (status IN ('published', 'featured'));

-- Admins have full access to properties
CREATE POLICY "Admins have full access to properties"
  ON properties FOR ALL
  TO authenticated
  USING (is_admin());

-- Agents can view their assigned properties
CREATE POLICY "Agents can view assigned properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- =====================
-- PROPERTY IMAGES POLICIES
-- =====================

-- Anyone can view images of published properties
CREATE POLICY "Anyone can view published property images"
  ON property_images FOR SELECT
  TO public
  USING (
    property_id IN (
      SELECT id FROM properties WHERE status IN ('published', 'featured')
    )
  );

-- Admins can manage property images
CREATE POLICY "Admins can manage property images"
  ON property_images FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- AMENITIES POLICIES
-- =====================

-- Anyone can view amenities
CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  TO public
  USING (true);

-- Admins can manage amenities
CREATE POLICY "Admins can manage amenities"
  ON amenities FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- PROPERTY AMENITIES POLICIES
-- =====================

-- Anyone can view property amenities for published properties
CREATE POLICY "Anyone can view published property amenities"
  ON property_amenities FOR SELECT
  TO public
  USING (
    property_id IN (
      SELECT id FROM properties WHERE status IN ('published', 'featured')
    )
  );

-- Admins can manage property amenities
CREATE POLICY "Admins can manage property amenities"
  ON property_amenities FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- FAVORITES POLICIES
-- =====================

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- =====================
-- INQUIRIES POLICIES
-- =====================

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins and agents can view inquiries
CREATE POLICY "Admins and agents can view inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (is_agent());

-- Admins can manage inquiries
CREATE POLICY "Admins can manage inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Agents can view and update their assigned inquiries
CREATE POLICY "Agents can update assigned inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (
    assigned_agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- =====================
-- VIEWING REQUESTS POLICIES
-- =====================

-- Anyone can submit viewing requests
CREATE POLICY "Anyone can submit viewing requests"
  ON viewing_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins and agents can view viewing requests
CREATE POLICY "Admins and agents can view viewing requests"
  ON viewing_requests FOR SELECT
  TO authenticated
  USING (is_agent());

-- Admins can manage viewing requests
CREATE POLICY "Admins can manage viewing requests"
  ON viewing_requests FOR ALL
  TO authenticated
  USING (is_admin());

-- Agents can update their assigned viewing requests
CREATE POLICY "Agents can update assigned viewing requests"
  ON viewing_requests FOR UPDATE
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- =====================
-- CONTACT SUBMISSIONS POLICIES
-- =====================

-- Anyone can submit contact forms
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view and manage contact submissions
CREATE POLICY "Admins can manage contact submissions"
  ON contact_submissions FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- BLOG CATEGORIES POLICIES
-- =====================

-- Anyone can view blog categories
CREATE POLICY "Anyone can view blog categories"
  ON blog_categories FOR SELECT
  TO public
  USING (true);

-- Admins can manage blog categories
CREATE POLICY "Admins can manage blog categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- BLOG POSTS POLICIES
-- =====================

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (status = 'published');

-- Admins can manage blog posts
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (is_admin());

-- Authors can view their own drafts
CREATE POLICY "Authors can view own blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- =====================
-- SITE SETTINGS POLICIES
-- =====================

-- Anyone can view site settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

-- Admins can manage site settings
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================
-- SOCIAL LINKS POLICIES
-- =====================

-- Anyone can view active social links
CREATE POLICY "Anyone can view active social links"
  ON social_links FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage social links
CREATE POLICY "Admins can manage social links"
  ON social_links FOR ALL
  TO authenticated
  USING (is_admin());
