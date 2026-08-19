# PROJECT STATUS

**Project:** Nigerian Real Estate Platform  
**Type:** Premium Commercial Real Estate Platform  
**Target Market:** Nigerian Real Estate Agencies  
**Price Point:** $500–$1,000  
**Last Updated:** 2026-08-19

---

## CURRENT PHASE

**PHASE 9 — CLOUDFLARE PRODUCTION PREPARATION IN PROGRESS**

Status: 🟡 LOCAL PREPARATION COMPLETE — Cloudflare Worker/OpenNext build and security integrations are prepared; owner configuration, remote preview, DNS/TLS, distributed rules, production deployment, and production validation remain

---

## CURRENT TASK

Phase 9 audited the deployment architecture and corrected the target from obsolete Cloudflare Pages guidance to a Cloudflare Worker built by OpenNext. Worker/Wrangler configuration, static-asset caching, centralized production identity variables, and Turnstile integration are prepared. The native Next.js and OpenNext Worker builds pass. No Cloudflare login, upload, deployment, DNS/HSTS change, production Auth change, database change, commit, or push was performed.

✅ **Migration `018_protect_profile_role.sql` has been applied to the live database** (2026-08-15 via `supabase db query --linked`; function + trigger verified to exist).
✅ **Migration `019_security_hardening.sql` has been applied to the live database** (2026-08-19; migrations 001–019 aligned and `db push --dry-run` reports the remote database is up to date).

---

## COMPLETED

### Phase 1 — Architecture & Planning ✅ (2026-08-13)
- ✅ Git repository initialized
- ✅ Project directory created
- ✅ PROJECT_STATUS.md created
- ✅ ARCHITECTURE.md created — Complete system architecture
- ✅ CHANGELOG.md created
- ✅ Database schema designed (15 tables with relationships)
- ✅ RLS strategy defined
- ✅ Storage architecture defined (4 buckets)
- ✅ Route map completed (30+ routes)
- ✅ Component architecture planned
- ✅ Cloudflare + Supabase deployment strategy documented
- ✅ Nigerian market requirements documented
- ✅ Security architecture defined
- ✅ SEO architecture planned

### Phase 2 — Foundation ✅ (2026-08-13)
- ✅ Next.js 16.3.0 initialized with App Router
- ✅ TypeScript configured (strict mode enabled)
- ✅ Tailwind CSS 4 setup with design tokens
- ✅ React 19.2.8 installed
- ✅ Project folder structure created
- ✅ Navbar component built
- ✅ Footer component built
- ✅ Root layout configured with metadata
- ✅ Global styles with CSS variables
- ✅ Utility functions (formatPrice, slugify, etc.)
- ✅ Constants file (property types, locations, etc.)
- ✅ Next.js config for Cloudflare compatibility
- ✅ .env.example created
- ✅ README.md created
- ✅ Dependencies installed (Supabase, React Hook Form, Zod, lucide-react)
- ✅ Build verified successfully

### Phase 3 — Supabase Backend ✅ (2026-08-13)
- ✅ Supabase folder structure created
- ✅ 17 database migrations created (all 15 tables + RLS + storage)
- ✅ Row Level Security policies implemented for all tables
- ✅ Helper functions created (is_admin, is_agent)
- ✅ Storage buckets configured (4 buckets: property-images, agent-images, blog-images, site-assets)
- ✅ Storage policies implemented
- ✅ Supabase client utilities created (client.ts, server.ts, middleware.ts)
- ✅ TypeScript database types generated
- ✅ Seed data created (locations, amenities, agents, settings)
- ✅ Comprehensive setup documentation (SUPABASE_SETUP.md)
- ✅ Migration order documented
- ✅ @supabase/ssr dependency installed
- ✅ PROJECT_RULES.md created (permanent project rules documentation)

---

## RECENTLY COMPLETED

### Phase 9 — Cloudflare Production Preparation 🟡 LOCAL WORK COMPLETE (2026-08-19)

- Selected Cloudflare Workers via `@opennextjs/cloudflare` 1.20.2 and Wrangler 4.124.0; added `wrangler.jsonc`, `open-next.config.ts`, safe scripts, ignored build/local state, and immutable Next static-asset headers.
- Removed the misleading standalone-output assumption. `npm run build:cloudflare` now produces `.open-next/worker.js` successfully for Next.js 16.3.
- Tested the Next.js 16 `proxy.ts` migration and deliberately retained `middleware.ts`: OpenNext does not yet support the Node middleware forced by `proxy.ts`; the Edge middleware builds and preserves admin/favorites/session/Origin/body-size protections.
- Added accessible Turnstile widgets to login, signup, contact, inquiry, and viewing. Application form tokens are verified server-side with action/hostname validation and generic failures; auth tokens are passed to Supabase Auth.
- Centralized name, description, tagline, address, logo text, contact values, and optional social URLs. Fake address/social links are no longer rendered when values are blank.
- Added `docs/CLOUDFLARE_DEPLOYMENT.md` covering variables/secrets, Supabase Auth, Turnstile, exact rate-limit rules, DNS/TLS/HSTS, caching/images, preview/production, validation, and rollback.
- Remote deployment and preview are intentionally not performed. Turnstile enforcement, Supabase Auth CAPTCHA, WAF rate limits, domain/TLS, and HSTS are not active until the owner completes the documented Cloudflare/Supabase steps.

### Phase 8 — Security Review ✅ COMPLETE (2026-08-19)
- ✅ Anonymous live checks: public published data allowed; drafts, profiles, favorites, inquiries, viewings, contacts, and draft blog rows hidden; anonymous writes returned no rows
- ✅ All 10 admin pages redirect anonymous requests before rendering; all 20 admin mutations return 401 before parsing IDs/bodies
- ✅ Anonymous `/favorites` now redirects at the request boundary; its API returns 401 and RLS exposes no rows
- ✅ Migration 019 narrows public lead inserts, limits agents to assigned leads, protects customer fields, hardens `SECURITY DEFINER` search paths, and sets Storage MIME/size limits
- ✅ Role escalation remains protected by migration 018; application roles are always session-derived
- ✅ Property uploads now have structural JPEG/PNG/WebP checks, 10 MB/file and 50 MB/batch limits, uploader-scoped temporary paths, attached-image delete refusal, and shared-reference-safe cleanup
- ✅ Account-enumeration differences removed from login/signup responses
- ✅ Cross-site API mutations rejected; no permissive CORS headers; redirect attack variants rejected
- ✅ Baseline CSP/clickjacking/MIME/referrer/permissions headers added; HSTS deferred to production
- ✅ Raw PostgREST `.or()` search values sanitized and bounded; public APIs now verify inquiry/viewing targets are published
- ✅ Tracked source and recent history contain no credential-shaped secrets; production dependency audit reports zero vulnerabilities
- ✅ Migration 019 applied successfully; migrations 001–019 are aligned locally/remotely and all hardened policies, functions, triggers, RLS flags, and bucket restrictions were verified in the remote catalogs
- ✅ Post-migration owner testing passed for the public site, published property/blog, public forms/features, authenticated admin panel, and anonymous admin denial; no regression was observed
- ✅ Final anonymous HTTP/RLS matrix passed, including all 10 admin pages, all 20 admin mutations, favorites privacy, CSRF/origin rejection, redirect safety, headers, crawl controls, and generic errors
- ⚠️ Distributed abuse controls remain Phase 9 work: Supabase Auth rate limits/Turnstile plus Cloudflare rules for application endpoints.

### Phase 7 — SEO & Performance ✅ COMPLETE (2026-08-19)
- ✅ Unique metadata, canonical URLs, Open Graph, and Twitter metadata across public routes
- ✅ Dynamic property, location, agent, and blog metadata from public Supabase data
- ✅ Safe JSON-LD for the site business, properties, agents, articles, and detail breadcrumbs
- ✅ RLS-backed dynamic sitemap and explicit robots exclusions
- ✅ Dedicated indexable buy/rent/short-let landing routes; transient property filters are `noindex`
- ✅ Private/auth routes and invalid dynamic content are `noindex`; admin is absent from the sitemap
- ✅ Request-level query memoization and smaller card query payloads
- ✅ Image dimensions, responsive `sizes`, loading priorities, client boundaries, and `next/font` audited
- ✅ Lab checks met documented LCP/CLS targets on representative mobile and desktop routes
- ✅ TypeScript, ESLint, production build, rendered HTML, themes, and responsive overflow verified

### Phase 6 — Admin Dashboard ✅ COMPLETE (2026-08-18)
- ✅ Admin authentication (three-layer: layout gate + `adminApiGuard()` + RLS admin policies; no service_role)
- ✅ Dashboard overview (`/admin` — 8 live stat cards + recent activity feeds, all real queries)
- ✅ Property CRUD (`/admin/properties` — list/filter/paginate, create/edit form, gallery rows, amenities, featured toggle, delete)
- ✅ Agent CRUD (`/admin/agents`)
- ✅ Location CRUD (`/admin/locations`)
- ✅ Lead management (`/admin/inquiries` — status pipeline new/contacted/qualified/negotiation/won/lost, notes; no delete by design)
- ✅ Viewing management (`/admin/viewing-requests` — requested/confirmed/completed/cancelled)
- ✅ Contact submissions (`/admin/contact-submissions` — new/read/replied/archived)
- ✅ Blog CMS (`/admin/blog` + `/admin/categories` — posts with category/status/SEO, category manager)
- ✅ Users overview (`/admin/users` — read-only profiles; roles managed in DB per migration 018)
- ✅ Image upload/management implemented (authenticated RLS endpoint, JPEG/PNG/WebP validation, 10 MB limit, multiple upload/progress/previews/alt text/cover/order, managed-object cleanup, external URL compatibility)
- ✅ Light/Dark theme implemented across the public and admin shells with persisted preference, Light fallback for legacy `system` values, original Light visuals, and premium near-black/gold semantic tokens for Dark
- ✅ Owner-session verification completed before commit `c722b35`
- ⬜ Site settings management (deferred — no schema gaps, can be added as a small follow-up)

### Phase 5 — Conversion Features ✅ COMPLETE (2026-08-15)
- ✅ Viewing request system (public form on property detail + `/api/viewing-requests` route)
- ✅ Property comparison (client-side selection + `/compare` page)
- ✅ Auth foundation (`/login`, `/signup`, `/auth/callback`, sign-out, auth-aware navbar — no migrations, existing `@supabase/ssr` plumbing)
- ✅ Favorites system (`/api/favorites` + auth-gated `/favorites` page + heart buttons on every property card/detail — existing `favorites` table + RLS, no migrations)
- ✅ WhatsApp integration (already shipped in Phase 4)
- ✅ Inquiry forms (already shipped in Phase 4)

---

## NOT STARTED

### Phase 3 — Supabase Backend (see Phase 4 for current work)
- Database, RLS, Storage all complete

### Phase 4 — Public Website (REMAINING)
- None — Phase 4 fully complete

### Phase 4 — Public Website ✅ COMPLETE (2026-08-15)
- ✅ Homepage with hero section, search, featured properties, categories, locations, agents, CTA
- ✅ Property search bar (client component with filters)
- ✅ PropertyCard component
- ✅ AgentCard component
- ✅ Shared components (SearchBar, EmptyState, SectionHeading, Pagination)
- ✅ Supabase query layer (lib/supabase/queries.ts)
- ✅ Loading skeleton pages (homepage + properties)
- ✅ Error boundary page
- ✅ SEO metadata for homepage and property listing
- ✅ shadcn/ui primitives installed (button, card, badge, input, select, skeleton, separator)
- ✅ Footer brand icons updated (lucide-react removed brand icons)
- ✅ Property listing page (`/properties`) with filters, sorting, pagination, empty state
- ✅ PropertyFilters client component (keyword, transaction type, property type, location, bedrooms, price range, sort)
- ✅ getProperties() query with full filter/sort/pagination support
- ✅ Property detail page (`/properties/[slug]`) with gallery, features, amenities, location, agent, WhatsApp CTA, inquiry form, related properties
- ✅ PropertyGallery client component (main image + thumbnails + prev/next)
- ✅ InquiryForm client component (React Hook Form + Zod)
- ✅ `/api/inquiries` server route with Zod validation
- ✅ getPropertyBySlug() and getRelatedProperties() queries
- ✅ Dynamic SEO metadata (generateMetadata) + not-found + loading states
- ✅ Agent listing and detail pages
- ✅ Location pages
- ✅ Contact page
- ✅ Blog listing and detail pages

### Phase 5 — Conversion Features
- WhatsApp integration
- Inquiry forms
- Viewing request system
- Favorites system
- Property comparison

### Phase 6 — Admin Dashboard (REMAINING)
- Site settings management

### Phase 8 — Security Review ✅ COMPLETE
- Migration 019 applied and migrations 001–019 aligned locally/remotely
- Remote hardened RLS policies, functions, triggers, RLS enablement, and Storage restrictions verified
- Post-migration public and authenticated-admin application testing passed
- A future customer/linked-agent session can extend the matrix when those identities exist; live policies and protection triggers are already verified
- Remove the unused service-role credential from ignored local/deployment environments and rotate it if it has been shared

### Phase 9 — Cloudflare Production
- ✅ OpenNext/Workers architecture and local Worker build
- ✅ Turnstile application integration and owner setup plan
- ✅ Exact distributed rate-limiting plan (not yet active)
- ⬜ Owner production identity, canonical URL, and keys
- ⬜ Owner-approved remote preview and full smoke matrix
- ⬜ Custom domain, SSL/TLS, redirects, and edge rules
- ⬜ Owner-approved production deployment and production performance/log validation

---

## FILES CREATED/MODIFIED

### Phase 1 Documentation
- `PROJECT_STATUS.md` — Project tracking and session management
- `ARCHITECTURE.md` — Complete system architecture (115KB)
- `CHANGELOG.md` — Project change log
- `.git/` — Git repository initialized

### Phase 4 — Homepage (2026-08-14)
- `app/page.tsx` — Full homepage (hero, search, categories, featured properties, property types, locations, agents, why us, CTA)
- `app/loading.tsx` — Homepage loading skeleton
- `app/error.tsx` — Homepage error boundary
- `components/properties/PropertyCard.tsx` — Property card with image, price, location, features
- `components/agents/AgentCard.tsx` — Agent card with photo, specialization, location, contact
- `components/shared/SearchBar.tsx` — Client search bar with transaction type, property type, location filters
- `components/shared/EmptyState.tsx` — Reusable empty state component
- `components/shared/SectionHeading.tsx` — Reusable section heading component
- `lib/supabase/queries.ts` — Supabase query layer (featured properties, locations, agents, counts)
- `components/layout/Footer.tsx` — Updated brand icons (lucide-react removed brand icons)
- `components/ui/*.tsx` — shadcn/ui primitives (button, card, badge, input, select, skeleton, separator)
- `package.json` — Updated dependencies (lucide-react, class-variance-authority, radix-ui)

### Phase 4 — Property Listing (2026-08-14)
- `app/properties/page.tsx` — Full property listing page with SEO metadata, URL-driven filters, property grid, pagination, empty state
- `app/properties/loading.tsx` — Property listing loading skeleton with header + card grid placeholders
- `components/properties/PropertyFilters.tsx` — Client filter component (keyword, transaction type, property type, location, bedrooms, price range, sort) with collapsible advanced section
- `components/shared/Pagination.tsx` — Reusable URL-based pagination component with page numbers and prev/next navigation
- `lib/supabase/queries.ts` — Added `getProperties()` query with PropertyListFilters interface (filter, sort, pagination support)

### Phase 4 — Property Detail (2026-08-14)
- `app/properties/[slug]/page.tsx` — Property detail page (gallery, header, features, description, amenities, location, agent sidebar, WhatsApp CTA, inquiry form, related properties, breadcrumbs, dynamic SEO)
- `app/properties/[slug]/not-found.tsx` — Professional Property Not Found page
- `app/properties/[slug]/loading.tsx` — Detail page loading skeleton
- `app/api/inquiries/route.ts` — Public inquiry submission API route with server-side Zod validation
- `components/properties/PropertyGallery.tsx` — Interactive image gallery (main image, thumbnails, prev/next, placeholder fallback)
- `components/forms/InquiryForm.tsx` — Client inquiry form (React Hook Form + Zod, submits to /api/inquiries)
- `lib/supabase/queries.ts` — Added `getPropertyBySlug()` and `getRelatedProperties()` queries

### Phase 4 — Agents (2026-08-14)
- `app/agents/page.tsx` — Agent listing page (SEO metadata, name search, responsive grid, empty state)
- `app/agents/loading.tsx` — Agents listing loading skeleton
- `app/agents/[slug]/page.tsx` — Agent detail page (breadcrumbs, photo, specialization, locations, bio, contact sidebar with WhatsApp/phone/email, agent's property listings)
- `app/agents/[slug]/loading.tsx` — Agent detail loading skeleton
- `app/agents/[slug]/not-found.tsx` — Professional Agent Not Found page
- `components/agents/AgentSearch.tsx` — Client name search driving `?q=` URL parameter
- `lib/supabase/queries.ts` — Added `getAgents()`, `getAgentBySlug()`, and `getAgentProperties()` queries

### Phase 4 — Locations (2026-08-15)
- `app/locations/page.tsx` — Location listing page (SEO metadata, location count, responsive grid, empty state)
- `app/locations/loading.tsx` — Locations listing loading skeleton
- `app/locations/[slug]/page.tsx` — Location detail page (breadcrumbs, featured badge, city/state/country, description, properties-in-location CTA linking to /properties?location=<slug>, location's property listings)
- `app/locations/[slug]/loading.tsx` — Location detail loading skeleton
- `app/locations/[slug]/not-found.tsx` — Professional Location Not Found page
- `components/locations/LocationCard.tsx` — Location card with featured badge, city/state, description snippet, and live property count
- `lib/supabase/queries.ts` — Added `getLocations()`, `getLocationBySlug()`, and `getLocationProperties()` queries

### Phase 4 — Contact Page (2026-08-15)
- `app/contact/page.tsx` — Contact page (SEO metadata, phone/WhatsApp/email channels from CONTACT_INFO, office hours, contact form)
- `app/api/contact/route.ts` — Public contact submission API route with server-side Zod validation (inserts into contact_submissions via anon server client)
- `components/forms/ContactForm.tsx` — Client contact form (React Hook Form + Zod, submits to /api/contact)

### Phase 4 — Blog (2026-08-15)
- `app/blog/page.tsx` — Blog listing page (SEO metadata, category filter chips, URL-driven `?category=` and `?page=` params preserved across pagination, published-only, empty state)
- `app/blog/loading.tsx` — Blog listing loading skeleton
- `app/blog/[slug]/page.tsx` — Blog detail page (dynamic SEO metadata via meta_title/meta_description, breadcrumbs, category badge, published date, featured image, excerpt, full content, related posts, back link)
- `app/blog/[slug]/loading.tsx` — Blog detail loading skeleton
- `app/blog/[slug]/not-found.tsx` — Professional Article Not Found page
- `components/blog/BlogCard.tsx` — Blog card (featured image, category badge, date, excerpt, link)
- `lib/supabase/queries.ts` — Added `getBlogPosts()`, `getBlogCategories()`, `getBlogPostBySlug()`, and `getRelatedBlogPosts()` queries (published-only, anon client, count-first pagination)
- `lib/utils.ts` — Added `formatDate()` utility

### Phase 5 — Viewing Request System (2026-08-15)
- `app/api/viewing-requests/route.ts` — Public viewing request submission API route with server-side Zod validation and past-date rejection (inserts into viewing_requests via anon server client, status = 'requested')
- `components/forms/ViewingRequestForm.tsx` — Client viewing request form (React Hook Form + Zod, date/time inputs, submits to /api/viewing-requests)
- `app/properties/[slug]/page.tsx` — Viewing request form integrated into property detail sidebar

### Phase 5 — Property Comparison (2026-08-15)
- `lib/compare.ts` — Comparison constants, safe localStorage helpers, URL id parsing, ComparePropertyView view model
- `hooks/useCompare.ts` — Shared comparison selection state via useSyncExternalStore (toggle/remove/clear, max 3)
- `components/compare/CompareButton.tsx` — Add/remove toggle (card overlay + detail sidebar variants)
- `components/compare/CompareBar.tsx` — Floating selection bar with Clear + Compare link
- `components/compare/CompareTable.tsx` — Responsive side-by-side comparison table with per-column remove
- `app/compare/page.tsx` — Comparison page (SEO metadata, no-selection / stale-selection / active states)
- `app/compare/loading.tsx` — Comparison loading skeleton
- `lib/supabase/queries.ts` — Added `getPropertiesForComparison()` (anon client, published/featured only)
- `components/properties/PropertyCard.tsx` — Restructured to stretched-link pattern with compare toggle overlay
- `app/properties/page.tsx` — CompareBar mounted
- `app/properties/[slug]/page.tsx` — Add/Remove from Compare button + CompareBar

### Phase 5 — Auth Foundation (2026-08-15)
- `lib/auth.ts` — `getSafeRedirectPath()` open-redirect guard for `?next=` targets
- `app/login/page.tsx` — Sign-in page (metadata, callback-error banner, signed-in redirect, `?next=`)
- `components/auth/LoginForm.tsx` — RHF + Zod login form with friendly auth-error mapping
- `app/signup/page.tsx` — Create-account page (`?next=` support)
- `components/auth/SignupForm.tsx` — RHF + Zod signup form (password confirm, "Check Your Email" state, `emailRedirectTo` = `/auth/callback`)
- `app/auth/callback/route.ts` — Email-confirmation code exchange (SSR client, no service_role)
- `app/auth/actions.ts` — `signOut` server action
- `components/auth/SignOutButton.tsx` — Reusable sign-out button
- `components/layout/NavbarClient.tsx` — Navbar interactivity + auth areas (Login/Sign Up vs Favorites/email/Sign Out)
- `components/layout/Navbar.tsx` — Converted to server wrapper using existing `getUser()`

### Phase 5 — Favorites (2026-08-15)
- `app/api/favorites/route.ts` — GET/POST/DELETE favorites API (Zod-validated `property_id`, session-derived `user_id`, 401 unauthenticated, published/featured check before insert, `23505` idempotency)
- `components/favorites/FavoriteButton.tsx` — Heart toggle (card overlay + detail sidebar variants), pending state, login redirect with `next` on 401
- `components/favorites/FavoritesGrid.tsx` — Client favorites grid (instant removal on un-favorite, live count, EmptyState)
- `app/favorites/page.tsx` — Auth-gated favorites page (`redirect('/login?next=/favorites')`, newest-first, noindex)
- `app/favorites/loading.tsx` — Favorites loading skeleton
- `lib/supabase/queries.ts` — Added `getFavoritePropertyIds()` and `getFavoriteProperties()` (inner join, published/featured visibility) + shared `PROPERTY_CARD_COLUMNS`
- `components/properties/PropertyCard.tsx` — Heart overlay bottom-right (`isFavorited` / `onFavoriteToggle` props)
- `app/page.tsx`, `app/properties/page.tsx`, `app/properties/[slug]/page.tsx`, `app/locations/[slug]/page.tsx`, `app/agents/[slug]/page.tsx` — Favorite ids fetched in parallel and passed to every card; detail sidebar favorite button

### Phase 6 — Admin Dashboard (2026-08-15)
- `app/admin/layout.tsx` — Admin shell: server gate (anon → `/login?next=/admin`, non-admin → AccessDenied), sidebar + mobile nav, noindex metadata
- `app/admin/loading.tsx` — Admin loading skeleton
- `app/admin/page.tsx` — Dashboard overview (8 live stat cards, registered users, recent inquiries + viewing requests)
- `app/admin/properties/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` — Property list + create/edit
- `app/admin/agents/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` — Agent list + create/edit
- `app/admin/locations/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` — Location list + create/edit
- `app/admin/inquiries/page.tsx` — Inquiry lead pipeline
- `app/admin/viewing-requests/page.tsx` — Viewing request pipeline
- `app/admin/contact-submissions/page.tsx` — Contact submission pipeline
- `app/admin/blog/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` — Blog post list + create/edit
- `app/admin/categories/page.tsx` — Blog category manager
- `app/admin/users/page.tsx` — Read-only registered users
- `app/api/admin/properties/route.ts` + `[id]/route.ts` — Property POST/PATCH/DELETE (gallery + amenities synced, 409/400/404 mapping)
- `app/api/admin/agents/route.ts` + `[id]/route.ts`
- `app/api/admin/locations/route.ts` + `[id]/route.ts`
- `app/api/admin/inquiries/[id]/route.ts` — PATCH status + notes
- `app/api/admin/viewing-requests/[id]/route.ts` — PATCH status + notes
- `app/api/admin/contact-submissions/[id]/route.ts` — PATCH status
- `app/api/admin/blog-posts/route.ts` + `[id]/route.ts`
- `app/api/admin/blog-categories/route.ts` + `[id]/route.ts`
- `components/admin/*.tsx` — AdminSidebar, AccessDenied, AdminPageHeader, StatusSelect, ToggleCell, DeleteButton, AdminFilterBar, PropertyForm, AgentForm, LocationForm, BlogPostForm, BlogCategoriesManager, InquiriesTable, ViewingRequestsTable, ContactSubmissionsTable
- `components/ui/*.tsx` — shadcn additions: table, textarea, label, switch, dialog, sonner
- `lib/auth.ts` — `adminApiGuard()` (server-only)
- `lib/redirects.ts` — `getSafeRedirectPath()` moved here to keep it client-safe
- `lib/admin-schemas.ts` — Zod schemas/enums mirroring DB CHECK constraints + `statusVariant()`
- `lib/supabase/queries.ts` — +20 typed admin queries with explicit row interfaces
- `supabase/migrations/018_protect_profile_role.sql` — Role-escalation protection trigger (**applied to the live database 2026-08-15**)
- `supabase/MIGRATION_ORDER.md` — Migration 018 entry
- `app/layout.tsx` — Hides public Navbar/Footer on `/admin` routes
- `lib/supabase/middleware.ts` — Sets `x-current-path` header (always overwritten server-side)
- `components/auth/LoginForm.tsx`, `SignupForm.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/auth/callback/route.ts` — import `getSafeRedirectPath` from `lib/redirects`

### Phase 3 — Supabase Backend
- `supabase/migrations/*.sql` — 17 database migration files
- `supabase/seed.sql` — Demo data seed file
- `supabase/MIGRATION_ORDER.md` — Migration execution order
- `lib/supabase/client.ts` — Client-side Supabase client
- `lib/supabase/server.ts` — Server-side Supabase client
- `lib/supabase/middleware.ts` — Middleware authentication helper
- `types/database.types.ts` — TypeScript database types
- `docs/SUPABASE_SETUP.md` — Complete setup guide
- `package.json` — Dependencies and scripts
- `next.config.ts` — Cloudflare-compatible Next.js config
- `tsconfig.json` — TypeScript strict mode configuration
- `app/layout.tsx` — Root layout with Navbar/Footer
- `app/page.tsx` — Homepage
- `app/globals.css` — Global styles and design tokens
- `components/layout/Navbar.tsx` — Navigation component
- `components/layout/Footer.tsx` — Footer component
- `lib/utils.ts` — Utility functions
- `lib/constants.ts` — App constants
- `.env.example` — Environment variables template
- `README.md` — Comprehensive documentation
- `components.json` — shadcn/ui configuration

---

## DATABASE STATUS

**Status:** ✅ Schema Complete

**Tables Created:** 15 tables
- ✅ profiles
- ✅ agents
- ✅ properties
- ✅ property_images
- ✅ amenities
- ✅ property_amenities
- ✅ locations
- ✅ favorites
- ✅ inquiries
- ✅ viewing_requests
- ✅ blog_posts
- ✅ blog_categories
- ✅ contact_submissions
- ✅ site_settings
- ✅ social_links

**Migrations:** 19 migration files created — migrations 001–019 are aligned locally/remotely; hardened functions, triggers, policies, and Storage limits verified live
**RLS Policies:** ✅ Implemented for all tables
**Storage Buckets:** ✅ 4 buckets configured (property-images, agent-images, blog-images, site-assets)
**Seed Data:** ✅ Created (locations, amenities, agents, blog categories, site settings)

---

## KNOWN ISSUES

- `NEXT_PUBLIC_SITE_URL` and the final brand/contact values must be set for production so canonical, sitemap, robots, and structured-data URLs use the real domain and business identity.
- Turnstile keys, allowed hostnames, Supabase Auth CAPTCHA, and Cloudflare WAF rate-limit rules are prepared but not active; missing production server configuration fails application public-form verification closed.
- OpenNext 1.20.2 does not support Next.js 16 Node middleware. Keep the deprecated Edge `middleware.ts` until adapter support lands; converting to `proxy.ts` currently breaks the Cloudflare build.
- Cloudflare preview/production, DNS/TLS, HSTS, remote smoke tests, and production performance/log measurements require owner approval and infrastructure access.
- Supabase-hosted public images remain unoptimized by Next.js by design for the current Cloudflare target. Configure/verify Cloudflare image delivery and cache behavior during Phase 9 rather than introducing Vercel image infrastructure.
- No customer profile or auth-linked agent currently exists for a non-destructive live-session matrix; customer ownership and assigned-agent behavior were verified from the active RLS policies/functions/triggers and should be smoke-tested when those identities are introduced.

---

## TECHNICAL REQUIREMENTS

### Must Use
- Next.js with App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- React Hook Form + Zod
- Lucide Icons

### Deployment Target
- **PRIMARY:** Cloudflare (NOT Vercel)
- Must be Cloudflare Workers compatible
- No Vercel-specific APIs
- Custom domain support

### Market Requirements
- Currency: NGN (₦)
- Primary locations: Lagos, Abuja, Port Harcourt
- Nigerian property types
- WhatsApp integration
- Mobile-first design

---

## NEXT ACTION

**PHASE 9 LOCAL PREPARATION COMPLETE — OWNER/REMOTE ACTIONS REQUIRED**

1. Review the uncommitted Phase 9 diff; do not commit until owner approval.
2. Provide final identity/contact/social values, canonical hostname, and real Turnstile widget keys.
3. Configure Cloudflare build/runtime variables and secrets, Supabase Auth URL/CAPTCHA settings, then authorize a remote preview upload.
4. Run the preview smoke/auth/form/storage matrix, activate and test the documented distributed rate limits, and only then authorize production deployment/domain changes.
5. Keep HSTS disabled until the canonical HTTPS host and required subdomains are stable.
6. Remove the unused service-role credential from ignored local/deployment environments; rotate it if it has ever been copied or shared. The app does not require it.

**Note:** The live database currently contains real data (including one published property with four property-image rows/objects, agents, locations, two inquiries, one published blog post, and one registered admin user); older empty-database notes are obsolete.
