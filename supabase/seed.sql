-- Demo Seed Data
-- File: seed.sql
-- Populates database with realistic Nigerian real estate demo data

-- Insert Locations
INSERT INTO locations (name, slug, city, state, country, description, is_featured, display_order) VALUES
-- Lagos
('Lekki Phase 1', 'lekki-phase-1', 'Lagos', 'Lagos', 'Nigeria', 'Prime residential area on the Lekki Peninsula', true, 1),
('Ikoyi', 'ikoyi', 'Lagos', 'Lagos', 'Nigeria', 'Upscale neighborhood in Lagos Island', true, 2),
('Victoria Island', 'victoria-island', 'Lagos', 'Lagos', 'Nigeria', 'Business and residential district', true, 3),
('Banana Island', 'banana-island', 'Lagos', 'Lagos', 'Nigeria', 'Exclusive luxury residential area', true, 4),
('Ikeja', 'ikeja', 'Lagos', 'Lagos', 'Nigeria', 'Capital of Lagos State with commercial and residential areas', false, 5),
('Ajah', 'ajah', 'Lagos', 'Lagos', 'Nigeria', 'Rapidly developing area along Lekki-Epe Expressway', false, 6),
('Yaba', 'yaba', 'Lagos', 'Lagos', 'Nigeria', 'Tech hub and residential area', false, 7),
('Surulere', 'surulere', 'Lagos', 'Lagos', 'Nigeria', 'Established residential neighborhood', false, 8),
('Chevron', 'chevron', 'Lagos', 'Lagos', 'Nigeria', 'Lekki area near Chevron Drive', false, 9),
('Sangotedo', 'sangotedo', 'Lagos', 'Lagos', 'Nigeria', 'Growing residential area in Lekki', false, 10),

-- Abuja
('Maitama', 'maitama', 'Abuja', 'FCT', 'Nigeria', 'Prestigious district in Abuja', true, 11),
('Asokoro', 'asokoro', 'Abuja', 'FCT', 'Nigeria', 'Elite residential area', true, 12),
('Wuse 2', 'wuse-2', 'Abuja', 'FCT', 'Nigeria', 'Commercial and residential district', false, 13),
('Gwarinpa', 'gwarinpa', 'Abuja', 'FCT', 'Nigeria', 'Largest single housing estate in West Africa', false, 14),
('Jabi', 'jabi', 'Abuja', 'FCT', 'Nigeria', 'Mixed-use area with shopping and residences', false, 15),
('Guzape', 'guzape', 'Abuja', 'FCT', 'Nigeria', 'Upscale residential district', false, 16),

-- Port Harcourt
('GRA Phase 1', 'gra-phase-1-ph', 'Port Harcourt', 'Rivers', 'Nigeria', 'Government Reserved Area - Prime location', false, 17),
('Trans Amadi', 'trans-amadi', 'Port Harcourt', 'Rivers', 'Nigeria', 'Industrial and commercial area', false, 18);

-- Insert Amenities
INSERT INTO amenities (name, slug, icon, category, display_order) VALUES
-- General
('Swimming Pool', 'swimming-pool', 'Waves', 'facilities', 1),
('Gym', 'gym', 'Dumbbell', 'facilities', 2),
('Parking', 'parking', 'Car', 'general', 3),
('Garden', 'garden', 'Trees', 'facilities', 4),
('Balcony', 'balcony', 'Home', 'general', 5),
('Air Conditioning', 'air-conditioning', 'Wind', 'general', 6),
('Fitted Kitchen', 'fitted-kitchen', 'ChefHat', 'general', 7),
('BQ (Boys Quarters)', 'bq', 'Home', 'general', 8),
('Elevator', 'elevator', 'MoveVertical', 'facilities', 9),

-- Security
('24/7 Security', '247-security', 'Shield', 'security', 10),
('CCTV', 'cctv', 'Camera', 'security', 11),
('Gated Estate', 'gated-estate', 'DoorClosed', 'security', 12),
('Security Gate', 'security-gate', 'ShieldCheck', 'security', 13),

-- Services
('Generator', 'generator', 'Zap', 'services', 14),
('Borehole', 'borehole', 'Droplet', 'services', 15),
('Serviced', 'serviced', 'Wrench', 'services', 16),
('Wi-Fi', 'wifi', 'Wifi', 'services', 17),

-- Facilities
('Playground', 'playground', 'Baby', 'facilities', 18),
('Club House', 'club-house', 'Building2', 'facilities', 19),
('Sports Facilities', 'sports-facilities', 'Trophy', 'facilities', 20);

-- Insert Agents
INSERT INTO agents (name, slug, email, phone, whatsapp, bio, specialization, locations, is_active, display_order) VALUES
('Chioma Okafor', 'chioma-okafor', 'chioma.okafor@realestate.com', '+234-803-123-4567', '2348031234567',
'Experienced real estate agent specializing in luxury properties in Lagos. With over 8 years in the industry, I help clients find their dream homes in prime locations.',
ARRAY['residential', 'luxury'], ARRAY['Lekki', 'Ikoyi', 'Victoria Island'], true, 1),

('Emeka Adeyemi', 'emeka-adeyemi', 'emeka.adeyemi@realestate.com', '+234-806-234-5678', '2348062345678',
'Commercial real estate specialist with a focus on office spaces and retail properties. I provide expert guidance on investment properties in Lagos.',
ARRAY['commercial', 'investment'], ARRAY['Victoria Island', 'Ikeja', 'Yaba'], true, 2),

('Aisha Bello', 'aisha-bello', 'aisha.bello@realestate.com', '+234-809-345-6789', '2348093456789',
'Abuja real estate expert helping families find comfortable homes in safe neighborhoods. Passionate about matching clients with properties that fit their lifestyle.',
ARRAY['residential', 'family homes'], ARRAY['Maitama', 'Asokoro', 'Gwarinpa'], true, 3),

('Tunde Williams', 'tunde-williams', 'tunde.williams@realestate.com', '+234-805-456-7890', '2348054567890',
'Property investment consultant specializing in high-yield rental properties and land acquisitions across Lagos.',
ARRAY['investment', 'land'], ARRAY['Lekki', 'Ajah', 'Ikoyi'], true, 4),

('Ngozi Okorie', 'ngozi-okorie', 'ngozi.okorie@realestate.com', '+234-807-567-8901', '2348075678901',
'Dedicated to helping first-time home buyers navigate the property market. Specializing in affordable housing and mortgage guidance.',
ARRAY['residential', 'first-time buyers'], ARRAY['Surulere', 'Ikeja', 'Yaba'], true, 5),

('Ibrahim Musa', 'ibrahim-musa', 'ibrahim.musa@realestate.com', '+234-808-678-9012', '2348086789012',
'Luxury property specialist for Port Harcourt and Abuja. Expert in high-end estates and expatriate relocations.',
ARRAY['luxury', 'expatriate services'], ARRAY['Asokoro', 'GRA Phase 1', 'Trans Amadi'], true, 6);

-- Insert Blog Categories
INSERT INTO blog_categories (name, slug, description, display_order) VALUES
('Property Guides', 'property-guides', 'Guides to buying, renting, and selling property in Nigeria', 1),
('Market Insights', 'market-insights', 'Real estate market trends and analysis', 2),
('Location Reviews', 'location-reviews', 'In-depth reviews of Nigerian neighborhoods', 3),
('Investment Tips', 'investment-tips', 'Property investment strategies and advice', 4),
('Legal & Finance', 'legal-finance', 'Legal and financial aspects of property transactions', 5);

-- Insert Site Settings
INSERT INTO site_settings (key, value, type, group_name, description) VALUES
('site_name', 'Premium Real Estate Nigeria', 'text', 'general', 'Website name'),
('site_tagline', 'Find Your Dream Property in Nigeria', 'text', 'general', 'Site tagline'),
('company_phone', '+234-803-123-4567', 'text', 'contact', 'Primary contact phone'),
('company_email', 'info@premiumrealestate.ng', 'text', 'contact', 'Primary contact email'),
('company_address', '123 Victoria Island, Lagos, Nigeria', 'text', 'contact', 'Physical address'),
('whatsapp_number', '2348031234567', 'text', 'contact', 'WhatsApp business number'),
('default_currency', 'NGN', 'text', 'general', 'Default currency'),
('enable_favorites', 'true', 'boolean', 'features', 'Enable favorites feature'),
('enable_comparison', 'true', 'boolean', 'features', 'Enable property comparison'),
('properties_per_page', '12', 'number', 'display', 'Properties to show per page'),
('blog_posts_per_page', '10', 'number', 'display', 'Blog posts per page'),
('featured_properties_count', '6', 'number', 'display', 'Featured properties on homepage'),
('google_analytics_id', '', 'text', 'analytics', 'Google Analytics tracking ID'),
('meta_description', 'Find your dream property in Nigeria. Browse luxury homes, apartments, and commercial properties in Lagos, Abuja, and Port Harcourt.', 'text', 'seo', 'Default meta description');

-- Insert Social Links
INSERT INTO social_links (platform, url, display_order, is_active) VALUES
('facebook', 'https://facebook.com/premiumrealestate', 1, true),
('instagram', 'https://instagram.com/premiumrealestate', 2, true),
('twitter', 'https://twitter.com/premiumrealestate', 3, true),
('linkedin', 'https://linkedin.com/company/premiumrealestate', 4, true),
('youtube', 'https://youtube.com/@premiumrealestate', 5, true);

-- Note: Properties will need to be added through the admin panel or a separate detailed seed file
-- The above provides the foundational data structure with realistic Nigerian market context
