# ARCHITECTURE DOCUMENTATION

**Project:** Nigerian Real Estate Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-08-19

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Architecture](#database-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Storage Architecture](#storage-architecture)
7. [Application Structure](#application-structure)
8. [Routing Architecture](#routing-architecture)
9. [Component Architecture](#component-architecture)
10. [SEO Architecture](#seo-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Security Architecture](#security-architecture)

---

## OVERVIEW

This is a premium, reusable real estate platform designed specifically for the Nigerian market. The platform enables real estate agencies to:

- Showcase properties professionally
- Generate and manage leads
- Handle viewing appointments
- Manage agents and teams
- Publish SEO-optimized content
- Receive inquiries via WhatsApp, email, and forms
- Operate their entire business online

**Key Design Principles:**
- Cloudflare-first (not Vercel)
- Mobile-first responsive design
- Nigerian market localization
- Reusable for multiple clients
- Production-ready security
- SEO-optimized
- Premium UI/UX

---

## TECHNOLOGY STACK

### Frontend Framework
- **Next.js 14+** with App Router
- **TypeScript** (strict mode)
- **React 18+**
- Server Components by default
- Client Components where needed

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for component primitives
- **Lucide Icons** for iconography
- **CSS Variables** for theming
- Responsive design (mobile-first)

### Backend & Database
- **Supabase** (managed PostgreSQL)
- **Supabase Auth** for authentication
- **Supabase Storage** for file management
- **Supabase Realtime** (optional for admin features)
- **Row Level Security (RLS)** for authorization

### Forms & Validation
- **React Hook Form** for form state management
- **Zod** for schema validation
- Type-safe form handling

### Hosting & Infrastructure
- **Cloudflare Pages** for application hosting
- **Cloudflare Workers** runtime
- **Cloudflare CDN** for global distribution
- **Cloudflare DNS** for domain management
- **Cloudflare SSL/TLS** for security

### Development Tools
- **Git** for version control
- **GitHub** for repository hosting
- **ESLint** for code linting
- **Prettier** (optional) for code formatting
- **TypeScript** for type checking

---

## SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
│                      (Global Users)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE NETWORK                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │     DNS     │  │   SSL/TLS   │  │  DDoS Protection │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Cloudflare CDN (Cache)                   │  │
│  │  - Static Assets (images, CSS, JS)                   │  │
│  │  - Public Property Pages (optional caching)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Cloudflare Workers / Pages                    │  │
│  │  - Next.js Application Runtime                       │  │
│  │  - Server-Side Rendering                             │  │
│  │  - API Routes                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS APPLICATION                        │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────┐     │
│  │  Public Routes   │         │   Admin Routes       │     │
│  │  - Homepage      │         │   - Dashboard        │     │
│  │  - Properties    │         │   - Property CRUD    │     │
│  │  - Agents        │         │   - Leads            │     │
│  │  - Blog          │         │   - Viewings         │     │
│  │  - Contact       │         │   - Settings         │     │
│  └──────────────────┘         └──────────────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Shared Components & Services               │  │
│  │  - UI Components (shadcn/ui)                        │  │
│  │  - Supabase Client                                  │  │
│  │  - Form Components                                  │  │
│  │  - SEO Components                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          PostgreSQL Database                       │    │
│  │  - Properties, Agents, Leads, etc.                │    │
│  │  - Row Level Security (RLS)                       │    │
│  │  - Indexes & Constraints                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Supabase Auth                             │    │
│  │  - Email/Password Authentication                   │    │
│  │  - Session Management                              │    │
│  │  - JWT Tokens                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Supabase Storage                          │    │
│  │  - Property Images                                 │    │
│  │  - Agent Photos                                    │    │
│  │  - Blog Images                                     │    │
│  │  - Site Assets                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Supabase APIs                             │    │
│  │  - REST API (PostgREST)                           │    │
│  │  - Realtime (optional)                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Public Property Viewing:**
```
User → Cloudflare CDN → Next.js SSR → Supabase DB → Render Page → Cache (optional)
```

**Property Search:**
```
User → Search Form → Next.js API/Server → Supabase Query → Filter Results → Display
```

**Inquiry Submission:**
```
User → Form → Validation (Zod) → Next.js API → Supabase Insert → Success Response
```

**WhatsApp Integration:**
```
User → Click WhatsApp → Generate Message → Open WhatsApp → (External)
```

**Admin Property Management:**
```
Admin → Auth Check → Admin Dashboard → CRUD Operation → Supabase (RLS) → Update
```

---

## DATABASE ARCHITECTURE

### Entity Relationship Diagram

```
┌─────────────────┐
│    profiles     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │─────────┐
│ first_name      │         │
│ last_name       │         │
│ phone           │         │
│ role            │         │
│ created_at      │         │
└─────────────────┘         │
                            │
                            │
┌─────────────────┐         │
│     agents      │         │
├─────────────────┤         │
│ id (PK)         │         │
│ user_id (FK)    │─────────┘
│ name            │
│ slug            │         ┌──────────────────┐
│ email           │         │   properties     │
│ phone           │         ├──────────────────┤
│ whatsapp        │    ┌────│ id (PK)          │
│ bio             │    │    │ title            │
│ photo_url       │    │    │ slug             │
│ specialization  │    │    │ description      │
│ is_active       │    │    │ property_type    │
│ created_at      │    │    │ transaction_type │
└────┬────────────┘    │    │ status           │
     │                 │    │ price            │
     │                 │    │ currency         │
     │ agent_id (FK)   │    │ bedrooms         │
     └─────────────────┘    │ bathrooms        │
                            │ area             │
┌──────────────────┐        │ location_id (FK) │───────┐
│ property_images  │        │ agent_id (FK)    │       │
├──────────────────┤        │ featured_image   │       │
│ id (PK)          │        │ is_featured      │       │
│ property_id (FK) │────────│ created_at       │       │
│ url              │        │ updated_at       │       │
│ alt_text         │        └──────┬───────────┘       │
│ display_order    │               │                   │
│ is_featured      │               │                   │
└──────────────────┘               │                   │
                                   │                   │
┌──────────────────┐               │                   │
│    amenities     │               │                   │
├──────────────────┤               │                   │
│ id (PK)          │               │                   │
│ name             │               │                   │
│ icon             │               │                   │
│ category         │               │                   │
└────┬─────────────┘               │                   │
     │                             │                   │
     │        ┌────────────────────┘                   │
     │        │                                        │
┌────┴────────┴───────┐                               │
│ property_amenities  │                               │
├─────────────────────┤                               │
│ id (PK)             │                               │
│ property_id (FK)    │                               │
│ amenity_id (FK)     │                               │
└─────────────────────┘                               │
                                                      │
┌─────────────────┐                                   │
│   locations     │                                   │
├─────────────────┤                                   │
│ id (PK)         │───────────────────────────────────┘
│ name            │
│ slug            │
│ city            │
│ state           │
│ country         │
│ description     │
└─────────────────┘

┌──────────────────┐        ┌─────────────────┐
│   favorites      │        │   inquiries     │
├──────────────────┤        ├─────────────────┤
│ id (PK)          │        │ id (PK)         │
│ user_id (FK)     │        │ property_id (FK)│
│ property_id (FK) │        │ name            │
│ created_at       │        │ email           │
└──────────────────┘        │ phone           │
                            │ message         │
                            │ source          │
                            │ status          │
┌──────────────────┐        │ created_at      │
│ viewing_requests │        └─────────────────┘
├──────────────────┤
│ id (PK)          │
│ property_id (FK) │        ┌──────────────────┐
│ name             │        │   blog_posts     │
│ email            │        ├──────────────────┤
│ phone            │        │ id (PK)          │
│ preferred_date   │        │ title            │
│ preferred_time   │        │ slug             │
│ message          │        │ content          │
│ status           │        │ excerpt          │
│ agent_id (FK)    │        │ category_id (FK) │
│ created_at       │        │ featured_image   │
└──────────────────┘        │ author_id (FK)   │
                            │ status           │
┌──────────────────┐        │ published_at     │
│ contact_submissions│      │ created_at       │
├──────────────────┤        └──────────────────┘
│ id (PK)          │
│ name             │        ┌──────────────────┐
│ email            │        │ blog_categories  │
│ phone            │        ├──────────────────┤
│ message          │        │ id (PK)          │
│ status           │        │ name             │
│ created_at       │        │ slug             │
└──────────────────┘        │ description      │
                            └──────────────────┘

┌─────────────────┐
│ site_settings   │         ┌─────────────────┐
├─────────────────┤         │  social_links   │
│ id (PK)         │         ├─────────────────┤
│ key             │         │ id (PK)         │
│ value           │         │ platform        │
│ type            │         │ url             │
│ group           │         │ display_order   │
│ updated_at      │         └─────────────────┘
└─────────────────┘
```

### Complete Database Schema

#### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

#### 2. agents
```sql
CREATE TABLE agents (
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

CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_user_id ON agents(user_id);
```

#### 3. locations
```sql
CREATE TABLE locations (
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

CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_is_featured ON locations(is_featured);
```

#### 4. properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  property_id TEXT UNIQUE, -- Public property reference ID
  property_type TEXT NOT NULL CHECK (property_type IN (
    'apartment', 'duplex', 'detached', 'semi-detached', 'terrace',
    'penthouse', 'villa', 'land', 'commercial', 'office',
    'warehouse', 'shop', 'hotel', 'estate'
  )),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent', 'short-let')),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'published', 'featured', 'sold', 'rented', 'archived'
  )),
  price DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  
  -- Location
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  toilets INTEGER,
  area DECIMAL(10, 2), -- in sqm
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  parking_spaces INTEGER,
  floors INTEGER,
  is_furnished BOOLEAN DEFAULT false,
  
  -- Media
  featured_image TEXT,
  gallery_images TEXT[], -- Array of image URLs
  floor_plan_url TEXT,
  video_url TEXT,
  
  -- Assignment
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_location_id ON properties(location_id);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_published_at ON properties(published_at);
```

#### 5. property_images
```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_display_order ON property_images(display_order);
```

#### 6. amenities
```sql
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- Lucide icon name
  category TEXT CHECK (category IN ('general', 'security', 'facilities', 'services')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_amenities_category ON amenities(category);
```

#### 7. property_amenities (Junction Table)
```sql
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property_id ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity_id ON property_amenities(amenity_id);
```

#### 8. favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);
```

#### 9. inquiries
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_assigned_agent_id ON inquiries(assigned_agent_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
```

#### 10. viewing_requests
```sql
CREATE TABLE viewing_requests (
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

CREATE INDEX idx_viewing_requests_property_id ON viewing_requests(property_id);
CREATE INDEX idx_viewing_requests_status ON viewing_requests(status);
CREATE INDEX idx_viewing_requests_agent_id ON viewing_requests(agent_id);
CREATE INDEX idx_viewing_requests_preferred_date ON viewing_requests(preferred_date);
```

#### 11. contact_submissions
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
```

#### 12. blog_categories
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
```

#### 13. blog_posts
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
```

#### 14. site_settings
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json')),
  group_name TEXT, -- e.g., 'general', 'contact', 'seo', 'analytics'
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_group ON site_settings(group_name);
```

#### 15. social_links
```sql
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN (
    'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'whatsapp'
  )),
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_social_links_platform ON social_links(platform);
CREATE INDEX idx_social_links_is_active ON social_links(is_active);
```

---

## AUTHENTICATION & AUTHORIZATION

### Authentication Strategy

**Provider:** Supabase Auth

**Methods:**
- Email + Password (primary)
- Magic Link (optional future enhancement)

**User Flow:**
1. User signs up with email/password
2. Supabase creates auth.users record
3. Trigger creates corresponding profiles record
4. JWT token issued for session management
5. Client stores session in cookies/localStorage

**Protected Routes:**
- `/admin/*` — Admin only
- `/favorites` — Authenticated users only
- `/profile` — Authenticated users only

### Authorization Strategy: Row Level Security (RLS)

#### Roles
- **Public (Unauthenticated)** — Can view published properties, agents, blog posts
- **Customer (Authenticated)** — Can manage favorites, submit inquiries
- **Agent** — Can view assigned leads and properties
- **Admin** — Full access to all data

#### RLS Policies Overview

**Properties:**
```sql
-- Public can view published properties
CREATE POLICY "Public can view published properties"
ON properties FOR SELECT
TO public
USING (status IN ('published', 'featured'));

-- Admins can do everything
CREATE POLICY "Admins have full access"
ON properties FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Favorites:**
```sql
-- Users can only manage their own favorites
CREATE POLICY "Users manage own favorites"
ON favorites FOR ALL
TO authenticated
USING (user_id = auth.uid());
```

**Inquiries:**
```sql
-- Anyone can insert inquiries
CREATE POLICY "Anyone can submit inquiries"
ON inquiries FOR INSERT
TO public
WITH CHECK (true);

-- Admins and assigned agents can view
CREATE POLICY "Admins and agents can view inquiries"
ON inquiries FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'agent')
  )
);
```

**Admin-Only Tables:**
```sql
-- site_settings, viewing_requests management, etc.
CREATE POLICY "Admins only"
ON site_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Security Rules

1. **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client**
2. Use `SUPABASE_ANON_KEY` for client-side operations
3. All data mutations protected by RLS
4. Admin routes protected at Next.js middleware level
5. File uploads restricted by bucket policies
6. Rate limiting implemented for forms

---

## STORAGE ARCHITECTURE

### Storage Buckets

#### 1. property-images
```
Purpose: Property photos, galleries
Access: Public read, Admin write
Max Size: 10MB per file
Formats: JPEG, PNG, WebP
RLS: Authenticated users with admin role can upload
```

#### 2. agent-images
```
Purpose: Agent profile photos
Access: Public read, Admin write
Max Size: 5MB per file
Formats: JPEG, PNG, WebP
```

#### 3. blog-images
```
Purpose: Blog featured images, content images
Access: Public read, Admin write
Max Size: 5MB per file
Formats: JPEG, PNG, WebP
```

#### 4. site-assets
```
Purpose: Logos, favicons, general site media
Access: Public read, Admin write
Max Size: 2MB per file
Formats: JPEG, PNG, SVG, ICO, WebP
```

### Storage Policies

```sql
-- Example: property-images bucket
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Admin Property Image Upload (Phase 6)

- `POST /api/admin/property-images` accepts authenticated admin multipart uploads and uses the normal session Supabase client, so Storage RLS remains authoritative; no service-role client exists.
- Both browser and route handler allow JPEG, PNG, and WebP only, with a 10 MB per-file limit. The route also checks binary file signatures before upload.
- Editing uploads use `property-images/properties/{property-uuid}/{random-uuid}.{ext}`. Pre-creation uploads use `property-images/uploads/{random-session-uuid}/{random-uuid}.{ext}`. Client filenames never become Storage paths.
- `property_images` remains the gallery metadata source (`url`, `alt_text`, `display_order`, `is_featured`), while `properties.featured_image` stays synchronized for cards and social metadata.
- Cleanup derives paths only from URLs on the configured Supabase origin that match the strict managed-path format. External/shared URL records remain compatible and are never deleted from Storage.

### Application Theme (Phase 6)

- `next-themes` controls a class-based Light/Dark preference at the root layout and persists it in browser local storage. Light is the default, and a legacy stored `system` value is migrated safely to Light before theme initialization.
- Tailwind 4 utilities and shadcn primitives share the existing semantic CSS variables through the `@theme` namespace; there is no parallel color system.
- The Light tokens preserve the original green-and-white interface. Dark uses near-black layered surfaces, restrained gold primary/focus accents, warm off-white text, and neutral borders through the same semantic tokens.
- Public and admin navigation expose the same keyboard-accessible two-option theme control. The root theme script applies the saved class before hydration to avoid a light-theme flash.

### Admin Request Boundary (Phase 7 verification)

- `/admin*` authorization is decided in middleware before App Router page rendering begins. Anonymous requests receive an HTTP redirect to login; authenticated non-admins are redirected to a dedicated noindex access-denied page.
- The admin layout guard remains as defense in depth, every admin API route retains `adminApiGuard()`, and Supabase RLS remains authoritative for data access.
- This request-boundary check is required because App Router layouts and child pages can render in parallel; a redirect initiated only by the layout can otherwise leave child data in the streamed RSC response.

### Image Optimization Strategy

**Upload Flow:**
1. Admin uploads original image
2. Store in Supabase Storage
3. Get public URL
4. Use Next.js Image component with proper sizing
5. Implement responsive images with srcset
6. Use modern formats (WebP) where supported

**Cloudflare Considerations:**
- Do NOT use Vercel Image Optimization
- Use Cloudflare Images (optional paid feature) or
- Pre-optimize images on upload or
- Use Supabase Transform API for image transformations

---

## APPLICATION STRUCTURE

### Folder Structure

```
nigerian-real-estate-platform/
├── .git/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── layout.tsx
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx               # Property listing
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx           # Property detail
│   │   │   │   ├── buy/page.tsx
│   │   │   │   ├── rent/page.tsx
│   │   │   │   └── short-let/page.tsx
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx               # Agent listing
│   │   │   │   └── [slug]/page.tsx        # Agent detail
│   │   │   ├── locations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx               # Blog listing
│   │   │   │   ├── [slug]/page.tsx        # Blog post
│   │   │   │   └── category/[slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── schedule-viewing/page.tsx
│   │   │   ├── favorites/page.tsx
│   │   │   ├── compare/page.tsx
│   │   │   ├── privacy-policy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx               # Dashboard
│   │   │       ├── properties/
│   │   │       │   ├── page.tsx           # Property list
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── agents/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── leads/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── viewings/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── blog/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       └── settings/
│   │   │           ├── page.tsx
│   │   │           ├── general/page.tsx
│   │   │           └── seo/page.tsx
│   │   ├── api/
│   │   │   ├── properties/
│   │   │   │   └── route.ts
│   │   │   ├── inquiries/
│   │   │   │   └── route.ts
│   │   │   └── contact/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── sitemap.xml/route.ts
│   │   ├── robots.txt/route.ts
│   │   ├── layout.tsx                     # Root layout
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                            # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyGrid.tsx
│   │   │   ├── PropertySearch.tsx
│   │   │   ├── PropertyFilters.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   └── PropertyComparison.tsx
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx
│   │   │   └── AgentContact.tsx
│   │   ├── forms/
│   │   │   ├── InquiryForm.tsx
│   │   │   ├── ViewingForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── SearchForm.tsx
│   │   ├── admin/
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── AgentForm.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── StatsCard.tsx
│   │   └── shared/
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Pagination.tsx
│   │       └── Breadcrumb.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Client-side Supabase
│   │   │   ├── server.ts              # Server-side Supabase
│   │   │   └── middleware.ts          # Middleware helper
│   │   ├── utils.ts                   # Utility functions
│   │   ├── constants.ts               # App constants
│   │   └── validations.ts             # Zod schemas
│   ├── types/
│   │   ├── database.types.ts          # Supabase generated types
│   │   ├── property.types.ts
│   │   ├── agent.types.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useProperties.ts
│   │   ├── useAuth.ts
│   │   ├── useFavorites.ts
│   │   └── useLocalStorage.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_setup.sql
│   │   ├── 003_properties.sql
│   │   ├── 004_agents.sql
│   │   ├── 005_leads.sql
│   │   ├── 006_blog.sql
│   │   └── 007_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
├── docs/
│   ├── PROJECT_STATUS.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   └── DEPLOYMENT.md
├── .env.example
├── .env.local
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── components.json                    # shadcn config
```

---

## ROUTING ARCHITECTURE

### Route Groups

**Public Routes:** `(public)`
- No authentication required
- SEO-optimized
- Server-side rendered where possible
- Cacheable (with caution for Cloudflare)

**Admin Routes:** `(admin)`
- Authentication required
- Admin role verification
- Protected by middleware
- NOT cached

### Complete Route Map

| Route | Purpose | Auth | Role | Cache |
|-------|---------|------|------|-------|
| `/` | Homepage | No | Public | Yes |
| `/properties` | Property listing | No | Public | Yes |
| `/properties/[slug]` | Property detail | No | Public | Yes |
| `/properties/buy` | For sale properties | No | Public | Yes |
| `/properties/rent` | For rent properties | No | Public | Yes |
| `/properties/short-let` | Short-let properties | No | Public | Yes |
| `/agents` | Agent listing | No | Public | Yes |
| `/agents/[slug]` | Agent profile | No | Public | Yes |
| `/locations` | Location listing | No | Public | Yes |
| `/locations/[slug]` | Location detail | No | Public | Yes |
| `/blog` | Blog listing | No | Public | Yes |
| `/blog/[slug]` | Blog post | No | Public | Yes |
| `/blog/category/[slug]` | Category posts | No | Public | Yes |
| `/about` | About page | No | Public | Yes |
| `/contact` | Contact page | No | Public | Yes |
| `/schedule-viewing` | Viewing form | No | Public | No |
| `/favorites` | User favorites | Yes | Customer | No |
| `/compare` | Compare properties | No | Public | No |
| `/privacy-policy` | Privacy policy | No | Public | Yes |
| `/terms` | Terms of service | No | Public | Yes |
| `/auth/login` | Login page | No | Public | No |
| `/auth/signup` | Signup page | No | Public | No |
| `/admin` | Admin dashboard | Yes | Admin | No |
| `/admin/properties` | Manage properties | Yes | Admin | No |
| `/admin/properties/new` | Add property | Yes | Admin | No |
| `/admin/properties/[id]/edit` | Edit property | Yes | Admin | No |
| `/admin/agents` | Manage agents | Yes | Admin | No |
| `/admin/leads` | Manage leads | Yes | Admin | No |
| `/admin/viewings` | Manage viewings | Yes | Admin | No |
| `/admin/blog` | Manage blog | Yes | Admin | No |
| `/admin/settings` | Site settings | Yes | Admin | No |

### API Routes

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/properties` | GET | Search properties | No |
| `/api/inquiries` | POST | Submit inquiry | No |
| `/api/viewing-requests` | POST | Request viewing | No |
| `/api/contact` | POST | Contact submission | No |
| `/api/favorites` | GET/POST/DELETE | Manage favorites | Yes |

---

## COMPONENT ARCHITECTURE

### Component Categories

#### 1. UI Components (`/components/ui/`)
- Primitive components from shadcn/ui
- Reusable across the application
- Examples: Button, Input, Card, Dialog, Select

#### 2. Layout Components (`/components/layout/`)
- Application shell components
- Navbar, Footer, Sidebars
- Consistent across pages

#### 3. Feature Components (`/components/[feature]/`)
- Domain-specific components
- PropertyCard, AgentCard, etc.
- Business logic encapsulation

#### 4. Form Components (`/components/forms/`)
- Form implementations
- Integrated with React Hook Form + Zod
- Validation and submission logic

#### 5. Admin Components (`/components/admin/`)
- Admin-specific components
- CRUD forms, stats cards
- Dashboard widgets

#### 6. Shared Components (`/components/shared/`)
- Cross-cutting concerns
- Loading states, empty states
- Pagination, breadcrumbs

### Component Design Principles

1. **Server Components by Default**
   - Use React Server Components unless interactivity needed
   - Reduces JavaScript bundle size
   - Better performance

2. **Client Components When Needed**
   ```tsx
   'use client'
   // For: Forms, event handlers, useState, useEffect
   ```

3. **Composition over Props Drilling**
   - Use context for deeply nested state
   - Compound component pattern where appropriate

4. **Type Safety**
   - All components fully typed
   - Props interfaces defined
   - Database types imported

5. **Accessibility**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation
   - Focus management

---

## SEO ARCHITECTURE

### SEO Strategy

#### 1. Metadata Management

- `lib/seo.ts` is the canonical metadata builder for absolute canonicals, Open Graph, Twitter cards, article dates, social images, and robots directives.
- The root layout defines `metadataBase` from `NEXT_PUBLIC_SITE_URL`. Production must set that variable to the final HTTPS origin.
- Property, location, agent, and article pages use `generateMetadata()` with public Supabase data. Request-level React memoization prevents the metadata and page render from issuing the same detail lookup twice.
- Listing filters use an explicit index policy: stable buy/rent/short-let routes and useful pagination/category states are self-canonical; transient search combinations are `noindex` and canonical to the nearest stable landing page.
- Login, signup, favorites, comparison, access-denied, missing dynamic content, and invalid filter/category states are non-indexable.

#### 2. Structured Data

- `components/seo/JsonLd.tsx` safely escapes serialized JSON-LD before placing it in a script element.
- The homepage emits the configured business as `RealEstateAgent`.
- Property detail pages emit `RealEstateListing`, a nested appropriate `Residence`/`Apartment`/`Place`, the real offer, address, images, and available characteristics.
- Active agent pages emit `RealEstateAgent`; published blog posts emit `Article`; all property, location, agent, and article detail pages emit `BreadcrumbList`.
- Only stored/configured values are emitted. Ratings, reviews, opening hours, contact details, authors, and other facts are omitted when unavailable.

#### 3. Sitemap Generation

- `app/sitemap.ts` is a Next.js metadata route with a one-hour revalidation interval.
- It uses a cookie-free anonymous Supabase client, so public RLS determines visibility and no authenticated identity can affect the generated document.
- It includes stable public pages, published/featured properties, active agents, locations, and published articles. Each optional dataset is error-isolated so one failure or an empty table does not remove unrelated URLs.

#### 4. Robots.txt

- `app/robots.ts` allows public crawling and disallows access-denied, admin, API, auth, and favorites paths.
- The generated document references the configured host and sitemap. It does not block properties, agents, locations, blog, or static informational routes.

#### 5. Canonical URLs

Every indexable page has an absolute canonical URL. Invalid/private pages also receive a canonical for deterministic metadata, but their robots directive remains the indexing authority.

#### 6. URL Structure

```
SEO-Friendly URLs:
✓ /properties/4-bedroom-luxury-duplex-lekki
✓ /agents/john-doe
✓ /blog/best-areas-to-buy-in-lagos

NOT:
✗ /property?id=123
✗ /agent/456
```

---

## DEPLOYMENT ARCHITECTURE

### Cloudflare Pages Deployment

#### Prerequisites
1. Cloudflare account
2. GitHub account
3. GitHub repository with code
4. Supabase project

#### Build Configuration

**Build Command:**
```bash
npm run build
```

**Build Output Directory:**
```
.next
```

**Node Version:**
```
18.x or 20.x
```

#### Environment Variables (Cloudflare)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (for admin operations)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=234XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Cloudflare Compatibility

**Next.js Config for Cloudflare:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare doesn't support Vercel Image Optimization
    unoptimized: true, // or use Cloudflare Images
  },
  // Ensure compatibility with Cloudflare Workers runtime
}

module.exports = nextConfig
```

**Note:** Verify current Cloudflare Pages compatibility with Next.js App Router. As of 2024, Cloudflare supports Next.js via `@cloudflare/next-on-pages` adapter.

#### Deployment Steps

1. **Connect GitHub Repository**
   - Login to Cloudflare Dashboard
   - Navigate to Pages
   - Create new project
   - Connect GitHub repository

2. **Configure Build**
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output: `.next`
   - Environment variables: Add all required vars

3. **Deploy**
   - Cloudflare auto-deploys on git push
   - Build logs available in dashboard

4. **Custom Domain**
   - Add custom domain in Cloudflare Pages
   - Update DNS records
   - SSL/TLS auto-provisioned

5. **Configure Caching**
   - Set cache rules for static assets
   - Exclude admin routes from cache
   - Exclude API routes from cache

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      # Cloudflare Pages handles deployment via GitHub integration
```

---

## SECURITY ARCHITECTURE

### Security Layers

#### 1. Network Security (Cloudflare)
- DDoS protection
- WAF (Web Application Firewall)
- SSL/TLS encryption
- Bot protection

#### 2. Application Security (Next.js)
- Environment variable protection
- CSRF protection
- XSS prevention
- SQL injection prevention (via Supabase RLS)

#### 3. Database Security (Supabase)
- Row Level Security (RLS)
- Role-based access control
- Encrypted at rest
- Connection encryption

#### 4. Authentication Security (Supabase Auth)
- JWT tokens
- Secure session management
- Password hashing (bcrypt)
- Email verification

#### 5. File Upload Security
- File type validation
- File size limits
- MIME type checking
- Malware scanning (optional)

### Security Checklist

- ✅ RLS enabled on all tables
- ✅ Service role key never exposed to client
- ✅ Admin routes protected by middleware
- ✅ Form inputs validated (client + server)
- ✅ File uploads restricted by bucket policies
- ✅ HTTPS enforced
- ✅ CORS configured correctly
- ✅ Rate limiting on public forms
- ✅ SQL injection prevented (Supabase parameterized queries)
- ✅ XSS prevented (React auto-escaping)
- ✅ Secrets stored in environment variables
- ✅ Dependencies regularly updated

### Rate Limiting Strategy

**Inquiry Forms:**
- Max 5 submissions per IP per hour

**Viewing Requests:**
- Max 3 submissions per IP per hour

**Contact Forms:**
- Max 3 submissions per IP per hour

**Implementation:**
- Use Cloudflare Rate Limiting or
- Implement custom middleware with Redis/KV

---

## CLOUDFLARE-SPECIFIC CONSIDERATIONS

### Cloudflare Workers Runtime

Cloudflare Pages uses Workers runtime, which has differences from Node.js:

**Supported:**
- Fetch API
- Web Crypto API
- URL API
- Most standard JavaScript

**NOT Supported:**
- Node.js `fs` module
- Node.js `crypto` module (use Web Crypto)
- Long-running processes
- WebSockets (use Durable Objects)

### Next.js Compatibility

**Compatible Features:**
- App Router
- Server Components
- Client Components
- API Routes
- Middleware
- Static Site Generation (SSG)
- Server-Side Rendering (SSR)

**Check Compatibility:**
- Dynamic routes
- Image optimization (use unoptimized or Cloudflare Images)
- Incremental Static Regeneration (ISR) — check current support

### Caching Strategy

- Static build assets remain content-hashed and are suitable for long-lived browser/Cloudflare caching.
- `app/sitemap.ts` is the only application-data response currently time-cached (`revalidate = 3600`). Its client is anonymous and cookie-free.
- Public page renders remain dynamic because the shared navigation and property cards resolve the current session/favorite state from cookies. Caching those full responses publicly could expose or mix user state, so no page-level ISR was added.
- React `cache()` provides request-level deduplication for detail metadata/page reads, blog categories, and server auth/profile checks. It does not retain property availability across requests.
- Admin pages, authenticated/private routes, auth flows, favorites, and mutation APIs must never be placed in a public CDN cache.
- Phase 9 must configure Cloudflare to cache immutable static assets and public media while bypassing `/admin*`, `/api*`, auth/session-sensitive responses, and any response carrying private cookies. Property data should remain fresh until an explicit invalidation design exists.

---

## NIGERIAN MARKET LOCALIZATION

### Currency
- **NGN (₦)** — Nigerian Naira
- Display format: `₦85,000,000` or `₦450,000/month`

### Locations
- Focus on major cities: Lagos, Abuja, Port Harcourt
- Popular neighborhoods: Lekki, Ikoyi, Victoria Island, Banana Island, Maitama, Asokoro

### Property Types
- Duplex (very popular in Nigeria)
- Detached/Semi-detached
- BQ (Boys' Quarters) — important amenity

### Amenities
- Generator (power backup)
- Borehole/Water supply
- Security/CCTV
- Gated estate
- Serviced (common for apartments)

### Contact Methods
- **WhatsApp** — Primary communication channel
- Phone
- Email

### Language
- English (official language)
- Professional, clear communication

---

## PERFORMANCE TARGETS

### Core Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s
- **INP (Interaction to Next Paint):** < 200ms (current responsiveness metric)
- **FID (First Input Delay):** < 100ms (legacy documented target; retained for historical comparison)
- **CLS (Cumulative Layout Shift):** < 0.1

### Performance Optimizations

1. **Images:**
   - Lazy loading below fold
   - Responsive images
   - Modern formats (WebP)
   - Proper sizing

2. **JavaScript:**
   - Code splitting
   - Dynamic imports
   - Minimal client-side JS

3. **CSS:**
   - Critical CSS inlined
   - Tailwind purging unused styles

4. **Database:**
   - Indexed queries
   - Efficient joins
   - Pagination

5. **Caching:**
   - Cloudflare CDN
   - Browser caching
   - Server-side caching where appropriate

### Phase 7 measured baseline

- Unthrottled local production measurements at 390px and 1440px on the homepage, property listing, and a live property detail recorded LCP between 1.10s and 1.45s and CLS of 0.
- This is a repeatable development diagnostic, not production field data. INP requires real user interaction data (or a controlled interaction suite) after deployment; TTFB and LCP must be rechecked from the production region in Phase 9.
- The current image path intentionally uses unoptimized Next Image URLs for Cloudflare compatibility. External Supabase media can dominate transfer cost; responsive Cloudflare/Supabase transformations should be enabled only once the production delivery service and URL contract are chosen.

---

## ACCESSIBILITY REQUIREMENTS

- **WCAG 2.1 Level AA compliance**
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Sufficient color contrast
- Alt text for images
- ARIA labels where needed
- Focus management
- Reduced motion support

---

## REUSABILITY STRATEGY

To make this platform reusable for multiple clients:

### Configurable via Admin
- Company name
- Logo
- Contact information (phone, email, WhatsApp)
- Social links
- SEO defaults
- Colors (via CSS variables)

### Configurable via Code (One-time per client)
- Domain
- Supabase project
- Analytics IDs
- Brand colors (Tailwind config)

### Data-Driven
- Properties
- Agents
- Locations
- Blog posts
- Amenities

**Goal:** Deploy for a new client by:
1. Cloning repository
2. Creating new Supabase project
3. Running migrations
4. Configuring environment variables
5. Updating site settings
6. Deploying to Cloudflare
7. Connecting custom domain

---

## CONCLUSION

This architecture provides a solid foundation for a premium, production-ready Nigerian real estate platform that can be:

- Deployed to Cloudflare
- Powered by Supabase
- Secured with RLS
- Optimized for SEO
- Localized for Nigeria
- Reused for multiple clients
- Maintained and scaled

**Next Step:** Begin Phase 2 — Foundation (Next.js setup, Tailwind, shadcn/ui, folder structure)

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-08-19
**Status:** Phase 1 Complete
