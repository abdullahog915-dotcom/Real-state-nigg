-- Blog Categories Table
-- Migration: 013_blog_categories.sql
-- Stores blog post categories

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_categories_display_order ON blog_categories(display_order);

-- Comments
COMMENT ON TABLE blog_categories IS 'Blog post categories for content organization';
