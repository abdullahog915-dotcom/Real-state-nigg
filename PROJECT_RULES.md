# PROJECT RULES

**Project:** Nigerian Real Estate Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-08-13

---

## NEW SESSION PROTOCOL

**At the beginning of every new session:**

1. Read `PROJECT_RULES.md` (this file)
2. Read `PROJECT_STATUS.md` for current phase and status
3. Read `ARCHITECTURE.md` for system design
4. Read `CHANGELOG.md` for recent changes
5. Run `git status` and `git log --oneline -5`
6. Inspect relevant files for current task
7. Continue from **NEXT ACTION** in `PROJECT_STATUS.md`

**DO NOT restart completed work. DO NOT rebuild completed phases.**

---

## TOKEN/CONTEXT LIMIT PROTOCOL

**If context/token limit is approaching:**

1. Stop starting new major features
2. Finish current safe unit of work
3. Update `PROJECT_STATUS.md` with:
   - Exact current state
   - Files changed
   - Unfinished implementation details
   - Known issues
   - Exact **NEXT ACTION**
4. Update `CHANGELOG.md` with changes made
5. Commit changes to Git
6. Ensure project remains buildable

**The repository files are the source of truth, not conversation history.**

---

## PROJECT OVERVIEW

### Purpose
Premium, reusable real estate platform designed for Nigerian real estate agencies. Commercial product targeting **$500–$1,000** sale price per client.

### Target Market
- Nigerian real estate agencies
- Focus on Lagos, Abuja, Port Harcourt
- Mobile-first (Nigerian users primarily mobile)
- WhatsApp-first communication

### Key Design Principles
- Cloudflare-first (NOT Vercel)
- Mobile-first responsive design
- Nigerian market localization (NGN currency, local areas)
- Reusable for multiple clients
- Production-ready security
- SEO-optimized
- Premium UI/UX

---

## TECHNOLOGY STACK

### Frontend
- **Next.js 16.3.0** with App Router
- **React 19.2.8**
- **TypeScript** (strict mode)
- **Tailwind CSS 4** with CSS variables
- **shadcn/ui** component library
- **Lucide Icons**

### Backend
- **Supabase** (managed PostgreSQL + Auth + Storage)
- **Row Level Security (RLS)** for authorization
- **@supabase/ssr** for server-side rendering
- **@supabase/supabase-js** for client operations

### Forms & Validation
- **React Hook Form** for form state
- **Zod** for schema validation
- **@hookform/resolvers** for integration

### Hosting & Deployment
- **Cloudflare Pages** (PRIMARY - NOT Vercel)
- **Cloudflare Workers** runtime
- **Cloudflare CDN** for assets
- **Cloudflare DNS & SSL/TLS**

### Development
- **Git** for version control
- **GitHub** for repository
- **TypeScript** for type checking
- **ESLint** for linting

---

## ARCHITECTURE RULES

### Next.js Architecture
- Use App Router (NOT Pages Router)
- Server Components by default
- Client Components only when needed (`'use client'`)
- No Vercel-specific APIs
- Configure for Cloudflare Workers compatibility
- Images: `unoptimized: true` (Cloudflare doesn't support Vercel Image Optimization)

### Supabase Architecture
- All database operations through Supabase client
- Use `lib/supabase/server.ts` for Server Components
- Use `lib/supabase/client.ts` for Client Components
- Use `lib/supabase/middleware.ts` for auth middleware
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Always use `SUPABASE_ANON_KEY` for client-side

### Database Architecture
- 15 tables: profiles, agents, locations, properties, property_images, amenities, property_amenities, favorites, inquiries, viewing_requests, contact_submissions, blog_categories, blog_posts, site_settings, social_links
- PostgreSQL via Supabase
- UUID primary keys
- Foreign key relationships with proper cascading
- Indexes on frequently queried columns
- Full-text search on properties and blog posts
- Triggers for updated_at, published_at, auto-profile-creation

---

## SECURITY RULES

### Row Level Security (RLS)
- **MANDATORY:** RLS enabled on ALL tables
- **Public (unauthenticated):**
  - Can view published properties, active agents, published blog posts
  - Can submit inquiries, viewing requests, contact forms
  - CANNOT view drafts or admin data
- **Customers (authenticated):**
  - Can manage own favorites
  - Can view/update own profile
  - CANNOT access other users' data
- **Agents:**
  - Can view assigned properties
  - Can view/update assigned leads and viewing requests
  - CANNOT access unassigned data
- **Admins:**
  - Full access to all tables
  - Can manage all content
  - Can upload to storage buckets

### Helper Functions
- `is_admin()` - checks if user role = 'admin'
- `is_agent()` - checks if user role IN ('agent', 'admin')
- Used in RLS policies for role-based access

### Authentication
- Supabase Auth with email/password
- Session management via cookies
- JWT tokens
- Auto-create profile on signup (trigger function)

### Storage Security
- 4 buckets: property-images, agent-images, blog-images, site-assets
- Public read access
- Admin-only write/delete
- File size limits recommended
- MIME type validation

### Environment Variables
- NEVER commit `.env.local` or `.env`
- NEVER expose service_role key to client
- Always use environment variables for secrets
- `.env.example` contains template only

---

## DATABASE RULES

### Migration Rules
1. **Never run migrations out of order**
2. Migrations are numbered 001-017
3. Run in exact sequence (see `supabase/MIGRATION_ORDER.md`)
4. **Never recreate existing tables**
5. If table exists, create new migration to alter it
6. Never destroy production data to simplify development
7. Use `DROP TABLE IF EXISTS` only in development
8. Always create new migration file for schema changes

### Migration Files
- `001_initial_schema.sql` - Extensions (uuid-ossp, pgcrypto)
- `002-015` - Table definitions
- `016_rls_policies.sql` - RLS policies (depends on ALL tables)
- `017_storage_buckets.sql` - Storage buckets (depends on RLS functions)

### Seed Data
- Located in `supabase/seed.sql`
- Contains: 18 locations, 20 amenities, 6 agents, 5 blog categories, site settings, social links
- Run AFTER all migrations complete
- Clearly marked as DEMO DATA

---

## FEATURE REQUIREMENTS

### Property Management
- Full CRUD operations
- Property types: apartment, duplex, detached, semi-detached, terrace, penthouse, villa, land, commercial, office, warehouse, shop, hotel, estate
- Transaction types: sale, rent, short-let
- Status: draft, published, featured, sold, rented, archived
- Details: bedrooms, bathrooms, toilets, area, parking, furnished status
- Gallery with ordering and featured image
- Amenities (many-to-many relationship)
- Agent assignment
- Location (Nigerian cities/neighborhoods)
- SEO fields (meta title, description, OG image)

### Agent Management
- Agent profiles with photo
- Bio, specializations, locations
- Contact info (phone, WhatsApp, email)
- Property assignments
- Lead assignments
- Active/inactive status

### Lead Management
- Inquiries table for property inquiries
- Source tracking (website, whatsapp, phone, email)
- Status pipeline: new → contacted → qualified → negotiation → won/lost
- Agent assignment
- Notes field for internal tracking

### Viewing Requests
- Property viewing appointments
- Customer details (name, email, phone)
- Preferred date/time
- Status: requested → confirmed → completed/cancelled
- Agent assignment
- Notes for scheduling

### WhatsApp Integration
- Generate WhatsApp URLs with pre-filled messages
- Include property details in message
- Configurable WhatsApp number (site settings)
- Track WhatsApp clicks (future)

### Blog/CMS
- Blog posts with categories
- Draft/published/archived status
- Featured images
- SEO metadata
- Author assignment
- Full-text search
- Views count tracking

### Nigerian Market Localization
- **Currency:** NGN (₦) - format with `formatPrice()` utility
- **Locations:** Lagos (Lekki, Ikoyi, Victoria Island, etc.), Abuja (Maitama, Asokoro, etc.), Port Harcourt
- **Property Types:** Include Duplex, BQ (Boys' Quarters), Estate
- **Amenities:** Generator, Borehole, Security, CCTV, Gated Estate
- **Communication:** WhatsApp primary, then phone, email

---

## RESPONSIVE & MOBILE RULES

### Mobile-First Design
- Design for mobile FIRST (360px, 390px, 430px)
- Then tablet (768px, 1024px)
- Then desktop (1366px, 1440px, 1920px)
- Mobile is NOT just smaller desktop
- Touch targets minimum 44x44px
- Sticky CTAs on mobile
- Mobile navigation drawer/menu
- Swipe galleries on mobile

### Responsive Components
- Navbar: Desktop nav vs mobile drawer
- Property cards: Grid adjusts by breakpoint
- Property gallery: Swipe on mobile, click on desktop
- Footer: Stacked on mobile, multi-column on desktop
- Forms: Full-width on mobile, contained on desktop

---

## SEO REQUIREMENTS

### Metadata
- Unique title and description per page
- OpenGraph tags for social sharing
- Twitter Card metadata
- Canonical URLs to prevent duplicates
- robots.txt and sitemap.xml

### Structured Data
- RealEstateAgent schema for agent pages
- Residence schema for property pages
- Article schema for blog posts
- BreadcrumbList for navigation
- FAQPage where appropriate

### Performance
- Core Web Vitals targets:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Lazy loading below fold
- Responsive images
- Code splitting
- Minimal JavaScript

---

## REUSABILITY ARCHITECTURE

### Configurable via Admin Panel
- Company name, logo
- Contact information (phone, WhatsApp, email)
- Social media links
- Site tagline
- SEO defaults

### Configurable via Environment Variables
- Supabase credentials
- Domain/site URL
- WhatsApp number
- Analytics IDs (Google Analytics, Meta Pixel)

### Data-Driven
- Properties (client adds their own)
- Agents (client adds their team)
- Locations (admin can add more)
- Amenities (seeded, admin can extend)
- Blog content (client creates)

### Multi-Client Deployment
1. Clone repository
2. Create new Supabase project
3. Run migrations and seed data
4. Update environment variables
5. Customize site settings in admin
6. Deploy to Cloudflare with custom domain

---

## GIT RULES

### Commit Guidelines
- Create commits after each completed phase
- Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`
- Include `Co-Authored-By: Claude <noreply@anthropic.com>`
- Never commit secrets, API keys, or `.env` files
- `.gitignore` protects sensitive files

### Branch Strategy
- `master` branch for main development
- Create feature branches for experimental work
- Never force push to main/master without user approval

### Before Committing
1. Run `git status` to see changes
2. Review changed files
3. Never commit `.env.local` or secrets
4. Run build to verify no errors
5. Stage specific files (avoid `git add .` blindly)

---

## CODING STANDARDS

### TypeScript
- Strict mode enabled
- Avoid `any` type
- Define interfaces for data structures
- Use database types from `types/database.types.ts`

### Component Rules
- Server Components by default
- Use `'use client'` only when needed (forms, useState, event handlers)
- Keep components focused and single-purpose
- Reusable components in `/components`
- Feature-specific components in feature folders

### File Organization
- `app/` - Next.js App Router pages
- `components/` - React components (ui, layout, features)
- `lib/` - Utilities, Supabase clients, constants
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks
- `supabase/` - Database migrations and seed data
- `docs/` - Project documentation

### Code Quality
- No duplicate functionality
- No dead code
- No commented-out code
- Proper error handling
- Loading states for async operations
- Empty states for no data
- Accessible forms with labels

---

## DEVELOPMENT PHASES

### Phase 1 — Architecture & Planning ✅ COMPLETE
- Database schema (15 tables)
- RLS strategy
- Component architecture
- Deployment architecture
- Nigerian market requirements

### Phase 2 — Foundation ✅ COMPLETE
- Next.js 16.3.0 with App Router
- TypeScript (strict mode)
- Tailwind CSS 4
- Project structure
- Navbar/Footer components
- Utility functions
- Cloudflare compatibility

### Phase 3 — Supabase Backend ✅ COMPLETE
- 17 database migrations
- Row Level Security policies
- Storage buckets and policies
- Supabase client utilities
- TypeScript database types
- Seed data
- Setup documentation

### Phase 4 — Public Website ✅ COMPLETE
- Homepage with hero
- Property search and listing
- Property detail with gallery
- Agent pages
- Location pages
- Contact page
- Blog listing and detail

### Phase 5 — Conversion Features (NEXT)
- WhatsApp integration
- Inquiry forms
- Viewing request system ✅ (2026-08-15)
- Favorites system
- Property comparison ✅ (2026-08-15)

### Phase 6 — Admin Dashboard
- Admin authentication
- Dashboard overview
- Property CRUD
- Image upload
- Agent CRUD
- Lead management
- Viewing management
- Blog CMS
- Settings management

### Phase 7 — SEO & Performance
- Metadata optimization
- Structured data
- Sitemap generation
- robots.txt
- Image optimization
- Core Web Vitals optimization

### Phase 8 — Security Review
- RLS verification
- Authorization testing
- File upload security
- Environment variable audit
- Admin route protection

### Phase 9 — Cloudflare Production
- Cloudflare deployment
- Custom domain
- SSL/TLS setup
- CDN configuration
- Production testing

---

## PROJECT MEMORY SYSTEM

### File Structure
- **PROJECT_RULES.md** (this file) = WHAT + RULES
- **PROJECT_STATUS.md** = WHERE WE ARE + NEXT ACTION
- **ARCHITECTURE.md** = HOW IT WORKS
- **CHANGELOG.md** = WHAT CHANGED

### Session Continuity
1. Repository files are source of truth
2. Read documentation files at session start
3. Check Git status and recent commits
4. Continue from NEXT ACTION in PROJECT_STATUS.md
5. Never restart completed phases

### Documentation Updates
- Update `PROJECT_STATUS.md` after completing tasks
- Update `CHANGELOG.md` with changes made
- Keep `NEXT ACTION` current and specific
- Document known issues
- List files created/modified

---

## RULES AGAINST DUPLICATION

### DO NOT Duplicate Existing Work
- ✅ Phase 1, 2, 3 are COMPLETE - do not rebuild
- ✅ Database migrations exist - do not recreate
- ✅ Navbar/Footer exist - do not rebuild
- ✅ Utility functions exist - use them
- ✅ Supabase clients exist - use them
- Before creating anything, check if it exists:
  1. Search repository
  2. Read PROJECT_STATUS.md
  3. Check existing components/utilities
  4. Check database migrations

### Before Creating a Migration
- Check `supabase/migrations/` for existing files
- Check migration number sequence
- Never recreate existing tables
- Create new migration to alter schema

### Before Creating a Component
- Check `components/` directory
- Search for similar functionality
- Reuse existing components
- Extend, don't duplicate

---

## CLOUDFLARE DEPLOYMENT RULES

### Cloudflare Compatibility
- Next.js must work with Cloudflare Workers runtime
- No Node.js-specific APIs (fs, crypto - use Web APIs)
- Images: `unoptimized: true` in next.config.ts
- No Vercel-specific features
- No Edge Runtime assumptions from Vercel

### Caching Strategy
- Cache static assets (CSS, JS, images)
- Cache public property pages (with TTL)
- DO NOT cache admin pages
- DO NOT cache authenticated responses
- DO NOT cache API mutations

### Deployment Process
1. Push to GitHub
2. Cloudflare auto-deploys from GitHub
3. Build command: `npm run build`
4. Build output: `.next`
5. Environment variables in Cloudflare dashboard
6. Custom domain via Cloudflare DNS

---

## QUALITY REQUIREMENTS

### Before Declaring Phase Complete
1. Run `npm run build` successfully
2. No TypeScript errors
3. No console errors
4. Test main functionality
5. Update PROJECT_STATUS.md
6. Update CHANGELOG.md
7. Commit to Git
8. Mark phase complete

### Production Readiness
- All features work as designed
- Responsive on all breakpoints
- SEO metadata present
- Security (RLS) verified
- Performance acceptable
- Error states handled
- Loading states present
- Empty states designed

---

## PROHIBITED ACTIONS

### DO NOT
- ❌ Restart completed phases (1, 2, 3 are done)
- ❌ Recreate existing migrations
- ❌ Rebuild existing components without reason
- ❌ Commit secrets or `.env` files
- ❌ Use Vercel-specific APIs
- ❌ Expose service_role key to client
- ❌ Bypass RLS policies
- ❌ Create duplicate functionality
- ❌ Modify completed phase code without user request
- ❌ Start new phase without user instruction

### ALWAYS
- ✅ Read PROJECT_STATUS.md at session start
- ✅ Check Git status before starting work
- ✅ Update documentation before ending session
- ✅ Commit completed work to Git
- ✅ Use existing utilities and components
- ✅ Follow migration order
- ✅ Test builds before committing
- ✅ Keep NEXT ACTION updated

---

**Last Updated:** 2026-08-15  
**Current Phase:** Phase 5 — Conversion Features (Viewing Requests + Property Comparison complete)  
**Status:** Continue Phase 5 — Favorites system (requires Supabase Auth rollout)
