# CHANGELOG

All notable changes to the Nigerian Real Estate Platform project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Phase 10 — Production Polish, Branding, Banners & Handoff

#### Phase 10.1 — MP4 banner support

- Added non-destructive migration 022 with an image/video discriminator, nullable desktop/mobile MP4 URLs, an optional poster, conditional media constraints, and a 25 MB `site-assets` bucket ceiling that permits `video/mp4`.
- Added admin MP4/poster uploads, previews, media-specific limits, cancellation cleanup, and reference-safe replacement/deletion.
- Added muted inline public playback, video-end carousel advancement, single-video looping, mobile source selection, poster/error fallback, and reduced-motion suppression.
- Extended Phase 10 tests for legacy image compatibility, unsafe media combinations, MP4 URL/path/structure validation, and reduced-motion decisions.

- Added owner-managed branding, contact, social, homepage fallback, favicon, and SEO defaults under `/admin/settings`.
- Centralized Navbar, Footer, Contact, homepage fallback, root metadata, and organization schema on request-time site settings with documented DB → environment → code precedence.
- Added admin-only JPEG/PNG/WebP uploads to the existing `site-assets` bucket with 5 MB limits, binary validation, server-generated paths, and reference-safe cleanup.
- Added migration 021 for ordered, RLS-protected homepage banners; it is prepared but not applied.
- Added `/admin/banners` CRUD and an accessible, responsive public slider with a safe no-banner fallback.
- Added focused Phase 10 validation/storage tests and expanded rate-limit regression coverage for the new guarded routes.
- Added `docs/OWNER_HANDOFF.md` for content ownership, deployment, Supabase, custom-domain, sale transfer, and secret-rotation procedures.

### Phase 9 — Cloudflare production preparation (2026-08-19)

#### Deployment architecture
- Corrected the target from obsolete Cloudflare Pages/`.next` guidance to a Cloudflare Worker built with `@opennextjs/cloudflare` 1.20.2 and Wrangler 4.124.0.
- Added the reviewed Worker/OpenNext configuration, safe build/preview/upload/deploy scripts, immutable static-asset caching, local preview template, ignored generated state, and dashboard-variable preservation for future approved deployments.
- Removed `output: 'standalone'`; OpenNext owns the deployment bundle. The Cloudflare-targeted build now succeeds and produces `.open-next/worker.js`.
- Tested Next.js 16 `proxy.ts` and retained Edge `middleware.ts` because OpenNext currently rejects Node middleware. Existing admin/favorites/session, Origin/CSRF, and body-size behavior remains unchanged.

#### Production security preparation
- Integrated Cloudflare Turnstile into login, signup, contact, inquiry, and viewing forms. Contact/inquiry/viewing verify tokens server-side with action/hostname checks, timeout, single-use reset behavior, a production fail-closed configuration, and generic public errors; auth sends CAPTCHA tokens to Supabase.
- Added safe Turnstile and identity variables to `.env.example`. Centralized visible identity values and removed the fake footer address and unconfigured `#` social destinations.
- Added an owner runbook for environment separation, Supabase Auth URLs/CAPTCHA, exact Cloudflare edge rate-limit expressions, TLS/HSTS, canonical domains, images/caching, preview/production validation, and rollback.
- Documented that direct anonymous Supabase REST insert policies remain constrained by migration 019 but are outside the application hostname's Turnstile/WAF boundary; no service-role bypass or unreviewed database migration was introduced.

#### Verification and deferred actions
- TypeScript, ESLint, native Next.js build, OpenNext Cloudflare build, Wrangler packaging dry-run, and `git diff --check` pass; `npm audit --omit=dev` reports zero vulnerabilities. The first adapter build intentionally exposed the unsupported Node-proxy path; the retained Edge middleware build completed successfully.
- No Cloudflare login/upload/deployment, DNS/HSTS change, Supabase setting/database change, commit, or push was performed. Real widget keys, Supabase Auth CAPTCHA, WAF rules, preview, custom domain/TLS, production smoke tests, and production performance/log checks remain owner/remote work.

### Phase 8 — Security Review (2026-08-19)

#### Findings and fixes
- Added and applied `019_security_hardening.sql` to replace broad `WITH CHECK (true)` lead policies with initial-state, published-property, and length checks; agents are limited to assigned inquiries/viewings and cannot rewrite customer/assignment fields. The migration also fixes mutable `search_path` use in all `SECURITY DEFINER` functions and restricts direct function execution.
- Added per-bucket Storage MIME and size restrictions. Property uploads also enforce 10 MB/file, 50 MB/batch, server-generated UUID paths, structural JPEG/PNG/WebP validation, and an early request-size check.
- Bound temporary upload paths to the authenticated uploader. Direct cleanup now rejects attached objects and property-ID mismatches; property replacement/deletion preserves any object still referenced by another record.
- Public inquiry/viewing APIs now verify that the target property is published or featured. Public request fields remain allowlisted and internal status/assignment/notes are server-derived.
- Removed email/account-state distinctions from login/signup responses to reduce account enumeration.
- Added request-boundary Origin/Fetch Metadata checks for browser API mutations. Cross-site requests receive 403; same-origin and non-browser clients remain compatible. No permissive CORS headers were added.
- Added a request-boundary `/favorites` gate so anonymous requests receive a real 307 before any private page shell can stream; the page-level session redirect remains defense in depth.
- Added compatible baseline headers: partial CSP (`base-uri`, `object-src`, `frame-ancestors`), `X-Frame-Options: DENY`, MIME sniffing protection, strict-origin referrer policy, and a restrictive permissions policy. HSTS remains production-only.
- Restricted admin-provided public media URLs to HTTP(S), bounded blog content, and sanitized/bounded values interpolated into raw PostgREST `.or()` filters.
- Removed the unused service-role variable from `.env.example` and setup/architecture guidance. Admin code continues to use only the verified session plus RLS.

#### Verification
- Migration 019 applied successfully; `supabase migration list --linked` shows 001–019 aligned and `supabase db push --linked --dry-run` reports the remote database is up to date.
- Remote PostgreSQL catalogs confirmed all five hardened replacement policies, all six expected hardened/new functions, the auth/profile/inquiry/viewing protection triggers, RLS enabled on all 15 public tables, and the exact four Storage MIME/file-size configurations.
- Post-migration owner testing passed for the public website, published property/blog, public forms/features, authenticated admin panel, and anonymous admin protection, with no observed regression.
- Live anonymous RLS reads: published property allowed; draft properties, profiles, favorites, inquiries, viewing requests, contact submissions, and draft blog posts returned zero rows. Random-ID anonymous UPDATE/DELETE returned zero rows and changed nothing.
- Live HTTP matrix: all 10 `/admin*` pages redirected to login before rendering; all 20 `/api/admin/*` mutations returned 401; cross-site mutation returned 403; same-origin invalid input returned 400; encoded open-redirect variants stayed internal.
- Upload utility tests accepted structurally valid JPEG/PNG/WebP inputs and rejected zero-byte, signature-only, MIME-mismatched, traversal, slash-filename, and external-managed-URL cases.
- Final quality checks passed: `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check`.
- Tracked source/recent history scan found no credential-shaped secrets or tracked environment files. `npm audit --omit=dev` reported zero vulnerabilities. An unused service-role credential exists only in ignored `.env.local`; its value was not printed or changed.

#### Deferred/manual
- No customer profile or auth-linked agent currently exists for non-destructive live-session testing; their ownership/assignment rules were verified from the active remote RLS catalog and protection triggers, and can be smoke-tested when those identities are introduced.
- Configure Supabase Auth rate limits/Turnstile and Cloudflare distributed limits for public/application mutations in Phase 9; in-process limiting was deliberately avoided because it is not reliable across Workers.
- Remove the unused service-role credential from local/deployment environments and rotate it if it has ever been shared. No secrets were rotated automatically.

### Phase 7 — SEO & Performance (2026-08-19)

#### SEO and public routes
- Added one metadata builder for canonical URLs, Open Graph, Twitter cards, absolute social images, article dates, and explicit `noindex` rules; configured root `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- Added dynamic Supabase-backed metadata for property, location, agent, and blog detail routes. Property and blog SEO fields take precedence over generated fallbacks; missing/unpublished detail content is `noindex` and handled by `notFound()`.
- Added dedicated `/properties/buy`, `/properties/rent`, and `/properties/short-let` landing routes. These and useful pagination/category pages are self-canonical; transient search/filter combinations are `noindex` and canonical to the nearest stable listing route.
- Added complete public pages for `/about`, `/privacy-policy`, and `/terms`, replacing dead footer destinations, plus a global accessible not-found page.
- Marked login, signup, favorites, compare, unknown filters/categories, and unavailable detail records as non-indexable where appropriate.

#### Structured data and crawl controls
- Added XSS-safe JSON-LD serialization. The homepage emits the configured business as `RealEstateAgent`; property pages emit `RealEstateListing` with the actual offer and an appropriate property/place type; agent profiles emit `RealEstateAgent`; published articles emit `Article`; all detail routes emit `BreadcrumbList`.
- Added `app/sitemap.ts` with a cookie-free anonymous Supabase client constrained by public RLS. It includes static public routes, published/featured properties, active agents, locations, and published blog posts, retains available modification dates/images, refreshes hourly, and tolerates an empty/failed optional dataset.
- Added `app/robots.ts`: public crawling is allowed while `/access-denied`, `/admin`, `/api`, `/auth`, and `/favorites` are disallowed; the generated sitemap and host are declared.

#### Performance and data access
- Audited public images: existing intrinsic aspect ratios, responsive `sizes`, lazy-loading defaults, and selective hero/detail priority prevent layout shifts. `images.unoptimized` remains intentional for Cloudflare compatibility; no Vercel-only image service or destructive source-image changes were introduced.
- Split property/blog card projections from detail projections so location, agent, related-property, blog-list, and related-blog grids no longer fetch detail-only columns such as galleries, coordinates, SEO fields, or full article content.
- Added React request memoization for detail records, blog categories, and server auth/profile checks, removing repeated metadata/page and navbar/favorites reads within a render request.
- Kept public pages dynamic because the shared auth-aware navigation and favorite state read session cookies. Only the anonymous sitemap is time-cached (one hour); private, admin, auth, and mutation responses are never publicly cached.
- Audited Server/Client Component boundaries and retained only behavior-driven clients (filters, search, theme, favorites, compare, forms, galleries, and navigation controls). Existing `next/font` Inter loading and fallback behavior remains unchanged.

#### Admin boundary hardening discovered during rendered-source verification
- Moved the admin role decision to middleware for `/admin*` requests, before App Router child rendering begins. Anonymous requests now receive an HTTP 307 to login at the request boundary; authenticated non-admins are redirected to a noindex access-denied page.
- Retained the admin layout guard, API guards, and RLS as defense in depth. This prevents parallel App Router rendering from serializing admin child data into an anonymous redirect response.

#### Verification
- TypeScript PASS; ESLint PASS; `git diff --check` PASS; Next.js 16.3 production build PASS (47 pages, generated robots, one-hour sitemap).
- Production rendered-source checks confirmed title, description, canonical, Open Graph, Twitter, robots, and server-rendered JSON-LD on representative public routes. `/sitemap.xml` and `/robots.txt` return valid generated content; anonymous `/admin` returns an HTTP 307 before admin rendering.
- Responsive overflow checks passed at 360, 390, 430, 768, 1024, 1366, 1440, and 1920px; Light and Dark persisted with zero observed theme layout shift.
- Unthrottled local production lab samples at 390/1440px measured LCP 1.10–1.45s and CLS 0 across the homepage, listing, and live property detail. These are development-machine diagnostics, not field data; INP requires real interaction/field measurement after deployment.
- Live content limitation: the database has no published blog post, so Article logic was type/build/source verified but no live article URL was available for rendered-content testing.

### Phase 6 targeted debugging and dark theme (2026-08-18)

- Reworked admin dashboard counts to select only `id`, label every table/filter, retain full PostgREST diagnostics (`code`, `message`, `details`, `hint`), and throw instead of silently returning fake zeroes.
- Verified the live schema and RLS for all nine dashboard statistics. Authenticated-role RLS counts return 1 published property, 0 drafts, 6 active agents, 18 locations, 1 new inquiry, 0 requested viewings, 0 new contacts, 0 published posts, and 1 registered user; anonymous clients remain restricted to public rows.
- Fixed the shared Radix Switch interaction target with an explicit non-submit button, pointer/touch behavior, visible 44×24 default control, stable thumb transforms, clickable labels, and non-overlaid form placement. `is_featured` and `is_furnished` remain in both POST and PATCH payloads/schemas.
- Added authenticated `POST/DELETE /api/admin/property-images` using the session Supabase client and existing Storage RLS. Supports multiple JPEG/PNG/WebP files, client/server validation, binary signature checks, 10 MB per-file and 30-image limits, XHR progress, previews, alt text, cover choice, and display-order controls.
- Managed uploads use `properties/{property-uuid}/{random-uuid}.{ext}` while editing and `uploads/{random-session-uuid}/{random-uuid}.{ext}` before creation. Only strict managed paths on the configured Supabase origin are eligible for cleanup; external/shared URLs are preserved.
- Property PATCH and DELETE now remove orphaned managed Storage objects after database changes; create failures clean up the property and managed uploads. `featured_image` remains synchronized for PropertyCard, while the public detail gallery now respects `display_order` exactly.
- Added the existing `next-themes` dependency to the root layout with persistent Light/Dark support, Light as the default, legacy `system` preferences migrated to Light, and no-flash class injection. Added accessible keyboard-operable two-option theme controls to public and admin navigation.
- Registered the existing shadcn semantic CSS variables with Tailwind 4's `@theme` namespace and added a class-based `dark` variant. Dark now uses a premium near-black/charcoal surface hierarchy, restrained gold primary and focus accents, warm off-white text, neutral borders, elevated inputs, and opaque Select content; the original Light palette remains unchanged.
- Verification: TypeScript PASS; ESLint PASS; production build PASS; direct anonymous app upload/delete return 401; direct anonymous Storage upload returns RLS 403; explicit Light/Dark persistence PASS; public horizontal-overflow checks PASS at 360/390/430/768/1024/1366/1440/1920; real PropertyCard cover and three-image detail gallery verified.
- Remaining verification: saving/reloading booleans and uploaded files through the project owner's existing authenticated browser session. Phase 6 remains active until that write walkthrough is complete.

### Targeted UI fixes (2026-08-18)

- Shared Select now defaults to Radix popper positioning with start alignment, collision padding, trigger-matched width, available-height/width constraints, opaque token-based styling, truncated long labels, and a scrollable viewport.
- PropertyCard now keeps equal-height grid cards, a consistent clipped 4:3 image region, non-overlapping image actions, constrained badges/text, and a compact overflow-safe feature row.
- Verified the five PropertyForm selects and PropertyCard at 360, 390, 430, 768, 1024, 1366, 1440, and 1920px; TypeScript, ESLint, and the production build pass.

### Phase 6 — Admin Dashboard (2026-08-15)

#### Architecture
- Full admin dashboard under `/admin` built on the existing Supabase SSR architecture — every admin query runs through the session client, so the existing admin RLS policies (migration 016, `is_admin()` SECURITY DEFINER) act as a second authorization layer even if a page guard were ever missed
- Three-layer authorization: (1) `app/admin/layout.tsx` server gate — anonymous → `redirect('/login?next=/admin')`, authenticated non-admin → minimal `AccessDenied` screen with zero admin data/structure; (2) `adminApiGuard()` as the first line of every `/api/admin/*` handler (401 anon / 403 non-admin); (3) database RLS admin policies
- No `SUPABASE_SERVICE_ROLE_KEY` anywhere; admin identity always derived from the authenticated session (`getUser()`/`isAdmin()`), never from client input
- Public Navbar/Footer hidden on `/admin` via an `x-current-path` header set unconditionally by the middleware (client-spoofable header is always overwritten server-side)
- New migration `018_protect_profile_role.sql`: BEFORE UPDATE trigger on `profiles` that blocks non-admin role changes (closes the self-promotion hole where any user could set their own `role = 'admin'` through the open profile UPDATE policy). **Applied to the live database on 2026-08-15 via `supabase db query --linked`; function + trigger existence verified afterwards**

#### Added — Pages
- ✅ `/admin` — dashboard overview: 8 live stat cards (published + draft properties, active agents, locations, new inquiries, pending viewing requests, new contact submissions, published blog posts) all from real HEAD-count queries, registered-users line, recent inquiries + viewing requests activity feeds
- ✅ `/admin/properties` (+ `/new`, `/[id]/edit`) — list with search/status filter/count-first pagination; create/edit form with basics, pricing, location/agent assignment, amenities checkboxes grouped by category, gallery rows with single-cover enforcement, SEO fields; inline featured toggle; delete with FK-behavior warning
- ✅ `/admin/agents` (+ `/new`, `/[id]/edit`) — list with search, property counts, active toggle, display order; full create/edit
- ✅ `/admin/locations` (+ `/new`, `/[id]/edit`) — list with search, property counts, featured toggle, display order; full create/edit
- ✅ `/admin/inquiries` — status pipeline `new/contacted/qualified/negotiation/won/lost` (actual CHECK constraint), status filter, detail dialog with message + editable internal notes; no delete by design (RLS grants SELECT+UPDATE only)
- ✅ `/admin/viewing-requests` — statuses `requested/confirmed/completed/cancelled`, detail dialog with preferred date/time + notes
- ✅ `/admin/contact-submissions` — statuses `new/read/replied/archived`, detail dialog
- ✅ `/admin/blog` (+ `/new`, `/[id]/edit`) — post list with search and inline status select; create/edit with category assignment, excerpt, featured image URL, SEO title/description; `author_id` always session-derived; `published_at` handled by the DB trigger
- ✅ `/admin/categories` — create/edit/delete dialog manager with post counts (delete leaves posts uncategorised via ON DELETE SET NULL)
- ✅ `/admin/users` — read-only registered profile list (name, phone, role, joined); role editing intentionally not exposed (protected by migration 018; managed in the database)
- ✅ `app/admin/loading.tsx` — admin loading skeleton; admin layout metadata is `noindex`

#### Added — API routes (all guarded by `adminApiGuard()`)
- ✅ `POST/PATCH/DELETE /api/admin/properties[/[id]]` — Zod validation mirroring migration 006/007/008; gallery replace keeps at most one featured image (DB partial unique index) and syncs `featured_image`; amenities replaced atomically; 409 duplicate slug, 400 FK, explicit 404 existence checks (Supabase `.update()` on a missing row does not error by itself)
- ✅ `POST/PATCH/DELETE /api/admin/agents[/[id]]`, `/api/admin/locations[/[id]]`
- ✅ `PATCH /api/admin/inquiries/[id]` (status + notes), `/api/admin/viewing-requests/[id]` (status + notes), `/api/admin/contact-submissions/[id]` (status) — every status validated against the exact CHECK-constraint enum, UUID-validated ids
- ✅ `POST/PATCH/DELETE /api/admin/blog-posts[/[id]]`, `/api/admin/blog-categories[/[id]]`

#### Added — Infrastructure & components
- ✅ `lib/auth.ts` — `adminApiGuard()` (now server-only)
- ✅ `lib/redirects.ts` — `getSafeRedirectPath()` moved here so the module stays client-safe (fixes the client/server split broken by adding server imports to `lib/auth.ts`)
- ✅ `lib/admin-schemas.ts` — single source of truth for every enum mirroring the DB CHECK constraints + `statusVariant()` badge helper
- ✅ `lib/supabase/queries.ts` — +20 typed admin queries (dashboard stats, recent activity, paginated property list, single-row fetches, option lists, lead lists, blog lists, users) with explicit row interfaces
- ✅ `components/admin/` — AdminSidebar (desktop fixed + mobile slide-over, current-section indicator, sign out, back-to-site), AccessDenied, AdminPageHeader, StatusSelect (optimistic + rollback + toast), ToggleCell, DeleteButton, AdminFilterBar, PropertyForm, AgentForm, LocationForm, BlogPostForm, BlogCategoriesManager, InquiriesTable, ViewingRequestsTable, ContactSubmissionsTable
- ✅ shadcn/ui additions: table, textarea, label, switch, dialog, sonner
- ✅ `supabase/migrations/018_protect_profile_role.sql` + MIGRATION_ORDER.md updated

#### Modified
- `app/layout.tsx` — hides public Navbar/Footer on `/admin` routes
- `lib/supabase/middleware.ts` — sets the `x-current-path` header for the layout
- `components/auth/LoginForm.tsx`, `SignupForm.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/auth/callback/route.ts` — import `getSafeRedirectPath` from `lib/redirects`

#### Security decisions
- Admin mutations use the session client + existing admin RLS — service_role deliberately NOT used
- Inquiries are never deletable (schema/RLS lifecycle via statuses); blog posts and categories support delete because the schema allows it (category delete uses ON DELETE SET NULL)
- Gallery images managed via URL inputs — the storage buckets exist (migration 017) but no upload endpoint exists yet; documented as missing infrastructure instead of inventing an incompatible upload system
- `blog_posts.author_id` and every `user_id` come from the session, never from request bodies

#### Verification
- TypeScript: PASS (0 errors) · ESLint: PASS (0 errors, 0 warnings) · Production build: PASS (51 routes registered incl. 18 `/admin` routes and 13 `/api/admin` route files — 18 mutation handlers, all guarded)
- Route tests (anonymous, live server): all 10 `/admin/*` pages redirect to `/login?next=/admin`; all `/api/admin/*` mutations return 401 `Authentication required`
- Live database verified via Supabase CLI: `prevent_role_escalation()` + `protect_profile_role` trigger exist (migration 018 applied); the real owner account (`abdullahog915@gmail.com`) has `profiles.role = 'admin'` with matching `user_id`
- Regression: `/`, `/properties`, `/agents`, `/locations`, `/blog`, `/contact`, `/compare`, `/login`, `/signup` all 200; `/favorites` redirects to login when signed out (Phase 5 behavior preserved)
- No service_role usage anywhere in app code (grep-verified)

#### Testing limitations
- Live database is completely empty (seed never run) — every list exercises its empty-state path; no fake records created per project rules
- Authenticated non-admin and authenticated admin scenarios are verified by code inspection (layout gate + adminApiGuard) with RLS as the enforced backstop; the signed-in admin dashboard walkthrough is performed manually by the project owner (no test accounts are created)

#### Fix — Login session handoff (2026-08-15)
- `lib/supabase/client.ts` was creating the browser Supabase client with `@supabase/supabase-js` `createClient`, which stores auth sessions in `localStorage`. The server-side client and middleware use `@supabase/ssr` `createServerClient`, which reads sessions from HTTP cookies. After `signInWithPassword`, the session existed only in `localStorage` — no cookie was set — so the middleware's `getUser()` returned `null` and `/admin` redirected back to `/login`. Fixed by switching to `createBrowserClient` from `@supabase/ssr`, which persists sessions in cookies that the middleware reads on the next request.
- Testing note: `next start` is incompatible with `output: 'standalone'` (causes `ChunkLoadError` — client JS never loads). Use `next dev` for local testing or `node .next/standalone/server.js` for production-like testing.

### Phase 5 — Favorites (2026-08-15)

#### Architecture
- Authenticated favorite storage on the existing `favorites` table (migration 009) and its RLS policy (`Users can manage own favorites`, `user_id = auth.uid()`) — no migrations, no schema/RLS changes, no service_role
- `user_id` is always derived from the session server-side — never accepted from the client
- Favorited state resolved server-side (`getFavoritePropertyIds()`) and passed down through pages → `PropertyCard` → `FavoriteButton` — correct first paint, no per-button client fetches
- Unauthenticated favorite attempts are redirected to `/login?next=<current page>` so users return where they were after signing in

#### Added
- ✅ `app/api/favorites/route.ts` — GET (favorited property ids), POST (add), DELETE (remove); Zod-validated `property_id`, 401 when unauthenticated, published/featured visibility check before insert, idempotent on the `UNIQUE(user_id, property_id)` constraint (23505 → success) and on removing non-favorited properties
- ✅ `components/favorites/FavoriteButton.tsx` — heart toggle with `card` (circular overlay, filled rose heart when saved) and `detail` (full-width sidebar button) variants; pending spinner, `aria-pressed`, `preventDefault`/`stopPropagation` against the stretched card link, 401 → login redirect with `next`
- ✅ `components/favorites/FavoritesGrid.tsx` — client grid for `/favorites`; cards removed instantly on un-favorite, live saved-count, EmptyState when the list empties
- ✅ `app/favorites/page.tsx` — auth-gated favorites page (`redirect('/login?next=/favorites')` when signed out), newest-favorite-first ordering, noindex metadata
- ✅ `app/favorites/loading.tsx` — favorites loading skeleton
- ✅ `lib/supabase/queries.ts` — `getFavoritePropertyIds()` (empty for signed-out visitors) and `getFavoriteProperties(userId)` (inner join + published/featured filter drops favorites pointing at unpublished/removed listings; shared `PROPERTY_CARD_COLUMNS`)

#### Modified
- `components/properties/PropertyCard.tsx` — optional `isFavorited` / `onFavoriteToggle` props; favorite heart overlaid bottom-right of the card image (mirrors the bottom-left compare toggle)
- `app/page.tsx`, `app/properties/page.tsx`, `app/properties/[slug]/page.tsx`, `app/locations/[slug]/page.tsx`, `app/agents/[slug]/page.tsx` — fetch favorite ids in parallel and pass `isFavorited` to every card; property detail sidebar gains an "Add to Favorites / Remove from Favorites" button above the compare button

#### Security decisions
- No `user_id` ever accepted from the client; session-derived only (RLS enforces ownership as a second layer)
- POST validates the property exists and is published/featured before insert — drafts can never be favorited
- `/favorites` gating implemented at page level (server `redirect`); no global middleware protection added

#### Verification
- TypeScript: PASS (0 errors) · ESLint: PASS (0 errors) · Production build: PASS (`/favorites`, `/api/favorites` registered)
- Routes: `GET /favorites` signed out → redirect to `/login?next=/favorites` (streamed `__next-page-redirect` meta refresh due to the `loading.tsx` Suspense boundary; no favorites data leaked before the redirect)
- API: `GET`, `POST`, `DELETE` all 401 "Authentication required" when signed out; `POST` with non-UUID `property_id` → 400 with fieldErrors
- Supabase REST confirmed reachable; current project has no published properties, so empty-state rendering is the exercised path (no fake data per project rules)

#### Testing limitations
- Signed-in end-to-end toggling could not be exercised without creating test accounts (prohibited); the auth-gate, validation, and redirect paths were verified server-side instead
- Heart-button interactivity not click-tested in the automated browser (same streamed-Suspense hydration limitation documented for `/compare`); the button reuses the shipped CompareButton overlay pattern exactly

### Phase 5 — Auth Foundation (2026-08-15)

#### Architecture
- Supabase Email/Password auth on the existing `@supabase/ssr` plumbing — no new auth libraries, no migrations, no schema/RLS changes, no service_role
- Email confirmation architecture: ON — `app/auth/callback` exchanges the emailed one-time `code` for a session (`exchangeCodeForSession`); signup forms never report a logged-in state without a real session
- Signed-in user detected server-side via the existing `getUser()` helper and passed to the navbar as a prop — no hydration mismatch, no loading flash
- Open-redirect defense: shared `getSafeRedirectPath()` accepts only internal relative paths (rejects `//host`, `/\host`, absolute URLs, control chars) and is applied on server pages, client forms, and the callback route

#### Added
- ✅ `app/login/page.tsx` — Sign-in page (SEO metadata, callback-error banner from an allowlist of keys, signed-in users redirected away, `?next=` support)
- ✅ `components/auth/LoginForm.tsx` — RHF + Zod login form (email validation, password required, inline errors, pending state, friendly mapping of `invalid_credentials` / `email not confirmed` errors, redirect to validated `next`)
- ✅ `app/signup/page.tsx` — Create-account page (`?next=` support, signed-in users redirected away)
- ✅ `components/auth/SignupForm.tsx` — RHF + Zod signup form (email, 8–72 char password, confirmation match, duplicate-account detection incl. the empty-identities edge case, `emailRedirectTo` = `/auth/callback`, honest "Check Your Email" state when confirmation is required, immediate redirect when confirmation is disabled)
- ✅ `app/auth/callback/route.ts` — GET handler: exchanges `code` for a session via the SSR client; missing/invalid code → `/login?error=callback` (generic key, no Supabase error text leaked); validated `next` preserved
- ✅ `app/auth/actions.ts` — `signOut` server action (swallows remote errors, always redirects to `/`)
- ✅ `components/auth/SignOutButton.tsx` — reusable client sign-out button (`useTransition` pending state)
- ✅ `components/layout/NavbarClient.tsx` — existing navbar markup moved to a client component with auth areas: signed-out → Login + Sign Up; signed-in → Favorites link, truncated email indicator, Sign Out (desktop + mobile menu)
- ✅ `lib/auth.ts` — `getSafeRedirectPath()` open-redirect guard

#### Modified
- `components/layout/Navbar.tsx` — converted to an async Server Component wrapper: `getUser()` → `<NavbarClient userEmail=... />`

#### Security decisions
- No `user_id` ever accepted from the client; session-derived only
- `?next=` validated in three layers (login/signup server pages, client forms re-validate, callback route)
- Auth errors mapped to generic user-facing messages; raw Supabase error text never rendered or reflected into URLs
- No routes globally protected yet — `/favorites` gating ships with the Favorites feature
- Existing session-refresh middleware untouched; all public routes remain public

#### Verification
- TypeScript: PASS (0 errors) · ESLint: PASS (0 errors) · Production build: PASS (`/login`, `/signup`, `/auth/callback` registered)
- Routes: `/login` 200, `/signup` 200, `/auth/callback` 307 → `/login?error=callback`; regressions `/`, `/properties`, `/agents`, `/locations`, `/blog`, `/contact`, `/compare` all 200
- Callback: missing code, invalid code, and invalid code + `next=//example.com` all redirect to `/login?error=callback` with the malicious `next` dropped; invalid code + valid `next=/favorites` preserves `next`
- Open redirect: `/login?next=%2F%2Fexample.com` renders the signup cross-link as plain `/signup`; `/login?next=%2Ffavorites` propagates to `/signup?next=%2Ffavorites`
- Supabase Auth Email provider confirmed live: password grant with nonexistent credentials returns HTTP 400 `invalid_credentials` / "Invalid login credentials" — exactly the message LoginForm maps (no account created)
- Server-rendered HTML verified complete for login (form, banner, links) and signup (email + password + confirm fields)

#### Testing limitations
- Client-side form validation and auth-error UI could not be click-tested in the automated browser: streamed Suspense page content never hydrates in that environment (affects previously shipped pages too, e.g. `/compare`); layout/navbar client hydration confirmed working. Zod schemas and error mappings verified by code review + live API error-shape check.
- Signup was intentionally never submitted with valid data (no fake accounts per project rules), so confirmation-email delivery was not exercised.
- Favorites still pending — second commit.

### Phase 5 — Property Comparison (2026-08-15)

#### Architecture
- Client-side comparison: selections stored in localStorage as property slugs, mirrored into the `/compare?ids=slug1,slug2` URL so the page stays a Server Component with SEO metadata
- No new database table, no migration, no RLS change — comparison is a transient browsing feature (schema only contains the `enable_comparison` site_settings flag)
- State hook built on `useSyncExternalStore` (React 19 idiom) — syncs across components via a custom window event and across tabs via the native storage event
- Maximum 3 properties; duplicates prevented; invalid/corrupt localStorage and URL ids ignored safely

#### Added
- ✅ `lib/compare.ts` — storage key, `MAX_COMPARE_PROPERTIES` (3), safe localStorage read/write, `parseCompareIds()`, `buildCompareUrl()`, `ComparePropertyView` view model
- ✅ `hooks/useCompare.ts` — shared comparison selection state (toggle/remove/clear/isFull) via `useSyncExternalStore`
- ✅ `components/compare/CompareButton.tsx` — add/remove toggle, `card` (overlay pill on PropertyCard) and `detail` (full-width sidebar button) variants, `aria-pressed`, disabled + tooltip when maximum reached
- ✅ `components/compare/CompareBar.tsx` — floating selection bar ("N of 3 selected", Clear, Compare link built from current selection)
- ✅ `components/compare/CompareTable.tsx` — responsive side-by-side table (horizontal scroll + sticky label column on mobile) comparing price, transaction/property type, location, bedrooms, bathrooms, toilets, area, year built, parking, furnishing, amenities, agent — all real schema fields; per-column remove button updates localStorage and the `?ids=` URL
- ✅ `app/compare/page.tsx` — comparison page with SEO metadata and three states: no selection, stale/invalid selection, active comparison (with single-property encouragement note)
- ✅ `app/compare/loading.tsx` — comparison loading skeleton
- ✅ `lib/supabase/queries.ts` — Added `getPropertiesForComparison(slugs)` (anon client, reuses `PROPERTY_DETAIL_COLUMNS` + amenities join, published/featured visibility, preserves requested order, no DB call for empty input)

#### Modified
- `components/properties/PropertyCard.tsx` — Restructured to stretched-link pattern; compare toggle overlaid bottom-left of the card image (no button-inside-anchor)
- `app/properties/page.tsx` — CompareBar mounted on the listing page
- `app/properties/[slug]/page.tsx` — "Add to Compare / Remove from Compare" button at top of sidebar + CompareBar; inquiry, viewing-request, WhatsApp, gallery, and agent sections unchanged

#### Database / RLS
- No schema changes, no migration, no RLS changes, no service_role

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings — `hooks/` now linted too)
- Production build: PASS (`/compare` route registered)
- Routes 200: `/`, `/properties`, `/properties?page=2`, `/properties/nonexistent-property-slug` (not-found UI), `/compare`, `/compare?ids=fake-slug-one,fake-slug-two`, `/agents`, `/locations`, `/contact`, `/blog`
- Browser-verified: localStorage selection survives reload (`2 of 3 selected` bar with correct `/compare?ids=` link); stale ids → "No Longer Available" state; Clear empties storage and hides the bar instantly; corrupt localStorage JSON ignored without errors; zero console errors/warnings
- Server console clean — no Supabase permission/PostgREST errors

#### Remaining Limitations
- With zero properties in the database, selecting real properties and rendering a populated table could not be live-tested (no fake data per project rules); table rendering verified via build/typecheck + stale-state paths
- `CompareButton` card variant not visually rendered yet (no property cards on screen) — same convention as earlier empty-DB phases

### Phase 5 — Viewing Request System (2026-08-15)

#### Added
- ✅ `app/api/viewing-requests/route.ts` — Public `POST /api/viewing-requests` route with server-side Zod validation (name, email, phone, preferred_date YYYY-MM-DD, preferred_time HH:MM, optional message), past-date rejection, inserts into `viewing_requests` via the anon server client with `status = 'requested'`
- ✅ `components/forms/ViewingRequestForm.tsx` — Client viewing request form (React Hook Form + Zod) with date input (`min` = today), time input, pre-filled message, inline validation, loading, success, and server-error states — mirrors the established `InquiryForm` idiom
- ✅ `app/properties/[slug]/page.tsx` — Viewing request form added to the property detail sidebar above the inquiry form

#### Security / RLS
- Relies on existing RLS (`"Anyone can submit viewing requests"` public INSERT with `WITH CHECK (true)`; SELECT restricted to agents/admins) — no policy, schema, or migration changes
- Server re-validates every submission; client schema only drives inline UX
- No service_role used; anon server client only

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS (`/api/viewing-requests` route registered)
- Invalid payload → 400 with field-level errors; past date → 400; valid payload with nonexistent property → 500 caused by FK violation `viewing_requests_property_id_fkey` (proves anon INSERT privilege + RLS INSERT policy work end-to-end; the only blocker is zero properties in the database)
- Regression: `/`, `/blog`, `/properties`, `/agents`, `/locations`, `/contact` all 200
- `viewing_requests` table verified empty via anon REST SELECT (RLS hides rows; no test rows leaked)

#### Notes
- A fully successful live INSERT requires at least one real property row (FK constraint). No fake properties were created per project rules; the FK error path fully proves the submission pipeline
- Form UI live-render test deferred until a property exists (same convention as inquiry form verification)

### Phase 4 — Blog (2026-08-15)

#### Added
- ✅ `app/blog/page.tsx` — Blog listing page with SEO metadata, article count, URL-driven category filter chips (`?category=<slug>`), count-first pagination (9 per page) preserving query params, and empty state handling
- ✅ `app/blog/loading.tsx` — Blog listing loading skeleton with category chip placeholders
- ✅ `app/blog/[slug]/page.tsx` — Blog detail page with breadcrumbs, category badge linking back to filtered listing, published date, featured image, excerpt lead, full content (whitespace-preserving), back-to-blog button, related articles (same category preferred), and dynamic `generateMetadata()` using `meta_title`/`meta_description`/`featured_image`
- ✅ `app/blog/[slug]/loading.tsx` — Blog detail loading skeleton
- ✅ `app/blog/[slug]/not-found.tsx` — Professional "Article Not Found" page
- ✅ `components/blog/BlogCard.tsx` — Blog card with featured image (placeholder fallback), category badge, published date, title, excerpt, read-more link
- ✅ `lib/supabase/queries.ts` — Added `getBlogPosts()` (published-only, category slug → id resolution, count-first pagination), `getBlogCategories()`, `getBlogPostBySlug()` (`maybeSingle()`, PGRST116 tolerated), and `getRelatedBlogPosts()` (same category → recent posts fallback)
- ✅ `lib/utils.ts` — Added `formatDate()` display helper

#### SEO
- ✅ Static metadata for `/blog`; dynamic `generateMetadata()` for `/blog/[slug]` with meta_title/meta_description fallbacks, canonical URL, and Open Graph featured image

#### Empty / Not-Found Handling
- No blog posts → "No Articles Published Yet" empty state with browse CTA
- Unknown category filter → empty result with category-specific empty state
- Unknown post slug → custom not-found page (no database errors leaked)
- Drafts/archived posts never exposed (RLS + explicit `status = 'published'` filter)

#### Security / RLS
- Relies on existing RLS (`"Anyone can view published blog posts"`, `"Anyone can view blog categories"`) plus explicit status filtering
- `author_id` references `auth.users` and is intentionally not exposed/joined (no public author name available in the schema)
- No service_role used; anon server client only; no schema, migration, or policy changes

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS (`/blog` and `/blog/[slug]` routes registered)
- `/blog`, `/blog?page=2`, `/blog?category=nonexistent-cat`, `/blog/nonexistent-post-slug`, `/`, `/properties`, `/agents`, `/locations`, `/contact` all return 200 with correct content
- Database verified empty of posts and categories (seed never run) — empty states tested per project rules; no Supabase errors in server console

#### Notes
- Blog content is rendered as whitespace-preserving plain text (`whitespace-pre-line`) — no markdown dependency added
- Phase 4 (Public Website) is now fully complete: Homepage, Property Listing, Property Detail, Agents, Locations, Contact, Blog

### Phase 4 — Contact Page (2026-08-15)

#### Added
- ✅ `app/contact/page.tsx` — Contact page with SEO metadata, direct contact channels (phone, WhatsApp, email from `CONTACT_INFO`), office hours card, and the contact form. Static (no database reads), prerendered at build time
- ✅ `app/api/contact/route.ts` — Public `POST /api/contact` route with server-side Zod validation, inserts into `contact_submissions` via the anon server client (RLS allows public inserts; reads admin-only). `status` defaults to `'new'` at the database level
- ✅ `components/forms/ContactForm.tsx` — Client contact form (React Hook Form + Zod) with inline validation, loading, success, and error states — mirrors the established `InquiryForm` idiom

#### SEO
- ✅ Static metadata with title, description, and canonical URL

#### Security / RLS
- Server re-validates every submission; client schema only drives inline UX
- Relies on existing RLS (`"Anyone can submit contact forms"` public INSERT, `"Admins can manage contact submissions"` for reads) — no policy, schema, or migration changes
- No service_role used; anon server client only

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS (`/contact` prerendered static, `/api/contact` registered)
- `/contact` renders header, form, and office hours (200); `/`, `/properties`, `/agents`, `/locations` regression checks pass (all 200)
- API returns 400 on invalid input (Zod validation working)
- Live valid submission returned `{"success":true}` — verified anon INSERT privilege and RLS policy end-to-end (the single labeled verification row was deleted afterwards; `contact_submissions` is empty again)

### Phase 4 — Locations (2026-08-15)

#### Added
- ✅ `app/locations/page.tsx` — Location listing page with SEO metadata, location count, responsive 4-column grid reusing the new `LocationCard`, and empty state handling
- ✅ `app/locations/loading.tsx` — Locations listing loading skeleton
- ✅ `app/locations/[slug]/page.tsx` — Location detail page with breadcrumbs, featured badge, city/state/country, full description, CTA linking to `/properties?location=<slug>` (compatible with the existing listing location filter), and the location's properties via reused `PropertyCard`
- ✅ `app/locations/[slug]/loading.tsx` — Location detail loading skeleton
- ✅ `app/locations/[slug]/not-found.tsx` — Professional "Location Not Found" page with links to `/locations` and `/properties`
- ✅ `components/locations/LocationCard.tsx` — Location card with featured badge, city/state, description snippet, and live property count
- ✅ `lib/supabase/queries.ts` — Added `getLocations()` (all locations with embedded published/featured property count), `getLocationBySlug()` (`maybeSingle()`, PGRST116 tolerated), and `getLocationProperties()` (published/featured properties in a location)

#### SEO
- ✅ Static metadata for `/locations`; dynamic `generateMetadata()` for `/locations/[slug]` (name, city/state title, description or generated fallback, canonical URL)

#### Empty / Not-Found Handling
- No locations in database → "No Locations Listed Yet" empty state with browse CTA
- Unknown location slug → custom not-found page (no database errors leaked)
- Location with no properties → EmptyState linking to `/properties`

#### Security / RLS
- Queries rely on existing RLS (`"Anyone can view locations"` public SELECT); `locations` has no status column — all rows are public by design
- Property visibility restricted to `published`/`featured` via existing RLS + explicit filters
- No service_role used; anon server client only; no schema, migration, or policy changes

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS (`/locations` and `/locations/[slug]` routes registered)
- `/`, `/properties`, `/agents`, `/locations`, `/locations/lagos`, `/locations/nonexistent-location-slug`, `/properties/this-property-does-not-exist` all return 200 with correct content
- Database verified empty of locations (seed never run) — empty states tested per project rules

#### Notes
- Homepage and footer already link to `/locations` and `/locations/[slug]` — those links now resolve to real pages
- Property count on each card uses an embedded resource filter (`properties.status in (published,featured)`), which filters joined rows only — locations with zero properties still render

### Phase 4 — Agents (2026-08-14)

#### Added
- ✅ `app/agents/page.tsx` — Agent listing page with SEO metadata, agent count, name search, responsive 4-column grid reusing `AgentCard`, and empty state handling
- ✅ `app/agents/loading.tsx` — Agents listing loading skeleton
- ✅ `app/agents/[slug]/page.tsx` — Agent detail page with breadcrumbs, photo, specialization badges, covered locations, full bio, contact sidebar (WhatsApp CTA, phone, email), and the agent's property listings via reused `PropertyCard`
- ✅ `app/agents/[slug]/loading.tsx` — Agent detail loading skeleton
- ✅ `app/agents/[slug]/not-found.tsx` — Professional "Agent Not Found" page with links to `/agents` and `/properties`
- ✅ `components/agents/AgentSearch.tsx` — Client name search driving the `?q=` URL parameter
- ✅ `lib/supabase/queries.ts` — Added `getAgents()` (active agents, ordered by display_order/name, optional name search), `getAgentBySlug()` (active-only, `maybeSingle()`), and `getAgentProperties()` (published/featured properties for an agent)

#### SEO
- ✅ Static metadata for `/agents`; dynamic `generateMetadata()` for `/agents/[slug]` (name, truncated bio, canonical URL, Open Graph photo)

#### Empty / Not-Found Handling
- No agents in database → "No Agents Listed Yet" empty state with contact CTA
- Search with no matches → "No Agents Found" with clear-search action
- Unknown agent slug → custom not-found page (no database errors leaked)
- Agent with no listings → EmptyState linking to `/properties`
- No contact details → explanatory fallback text

#### Security / RLS
- Queries rely on existing RLS (public SELECT only exposes `is_active = true` agents) plus an explicit `is_active` filter
- No service_role used; anon server client only; no schema, migration, or policy changes

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS (`/agents` and `/agents/[slug]` routes registered)
- `/`, `/properties`, `/properties?page=2`, `/agents`, `/agents?q=chioma`, `/agents/nonexistent-agent-slug`, `/properties/this-property-does-not-exist` all return 200 with correct content
- Database verified empty of agents (seed never run) — empty states tested per project rules

#### Notes
- Fixed initial PostgREST error `operator does not exist: text[] ~~* unknown` — `ilike` cannot target `text[]` columns (`specialization`, `locations`), so agent search filters on `name` only

### Phase 4 — Property Detail (2026-08-14)

#### Added
- ✅ `app/properties/[slug]/page.tsx` — Property detail page with breadcrumbs, image gallery, property header (title/location/price/badges), features grid, full description, amenities, location section with map placeholder, agent sidebar, WhatsApp CTA, inquiry form, and related properties
- ✅ `app/properties/[slug]/not-found.tsx` — Professional "Property Not Found" page with links back to `/properties` and `/contact`
- ✅ `app/properties/[slug]/loading.tsx` — Detail page loading skeleton matching the two-column layout
- ✅ `app/api/inquiries/route.ts` — Public `POST /api/inquiries` route with server-side Zod validation, inserts into `inquiries` via the anon server client (RLS allows public inserts)
- ✅ `components/properties/PropertyGallery.tsx` — Client gallery with main image, thumbnails, prev/next controls, image counter, and graceful placeholder when no images exist
- ✅ `components/forms/InquiryForm.tsx` — Client inquiry form (React Hook Form + Zod) with inline validation, loading, success, and error states
- ✅ `lib/supabase/queries.ts` — Added `getPropertyBySlug()` (full detail relations: locations, agents, property_images, property_amenities) and `getRelatedProperties()` (same location → same transaction type fallback)

#### SEO
- ✅ Dynamic `generateMetadata()` builds per-property title, description, canonical URL, and Open Graph image
- ✅ Uses `meta_title`/`meta_description`/`og_image` columns when present, falling back to property fields

#### Empty / Not-Found Handling
- Unknown slugs render the custom not-found page (no database errors leaked)
- No amenities → "No amenities listed" state
- No images → professional placeholder
- No assigned agent → agent card omitted, WhatsApp CTA falls back to site contact number
- Related properties section hidden when empty (no seed properties currently)

#### Verification
- TypeScript: PASS (0 errors)
- ESLint: PASS (0 errors, 0 warnings)
- Production build: PASS
- `/` and `/properties` render correctly
- Nonexistent slug renders not-found page; no Supabase permission errors or unhandled exceptions
- Inquiry API returns 400 on invalid input (Zod validation working)

#### Notes
- Next.js returns HTTP 200 with the not-found UI for streamed dynamic responses (documented Next.js behavior); static unknown routes still return 404
- PropertyCard `View Details` already links to `/properties/[slug]` — no change needed

### Phase 4 — Property Listing (2026-08-14)

#### Added
- ✅ `app/properties/page.tsx` — Property listing page with SEO metadata, URL-driven filters (transaction type, property type, location, keyword, bedrooms, price range), server-side sorting, pagination, active filter chips, and empty state handling
- ✅ `app/properties/loading.tsx` — Property listing loading skeleton with header + 8-card grid placeholders
- ✅ `components/properties/PropertyFilters.tsx` — Client filter component with keyword search, transaction type, property type, location dropdowns, collapsible advanced section (bedrooms, min/max price, sort), and clear all filters
- ✅ `components/shared/Pagination.tsx` — Reusable URL-based pagination component with page numbers, ellipsis, and prev/next navigation
- ✅ `lib/supabase/queries.ts` — Added `getProperties()` query with `PropertyListFilters` interface supporting full filter/sort/pagination pipeline

#### Compatibility
- Homepage SearchBar (`type`, `property_type`, `location`, `q` params) fully compatible with listing page URL parameters
- Homepage category links (`/properties?type=sale`, `/properties?property_type=apartment`) route correctly to listing page

### Phase 4 — Homepage (2026-08-14)

#### Added
- ✅ `app/page.tsx` — Full homepage with hero section, property search, transaction categories, featured properties grid, property types, popular locations, featured agents, "why choose us" features, and CTA section
- ✅ `app/loading.tsx` — Homepage loading skeleton with proper layout matching each section
- ✅ `app/error.tsx` — Homepage error boundary with retry and reload options
- ✅ `components/properties/PropertyCard.tsx` — Property card with image, badges, price, location, beds/baths/area
- ✅ `components/agents/AgentCard.tsx` — Agent card with photo, name, specialization, location, bio, phone
- ✅ `components/shared/SearchBar.tsx` — Client component with keyword, transaction type, property type, and location filters (hero and compact variants)
- ✅ `components/shared/EmptyState.tsx` — Reusable empty state with icon, title, description, and optional action
- ✅ `components/shared/SectionHeading.tsx` — Reusable section heading with subtitle, title, description, alignment
- ✅ `lib/supabase/queries.ts` — Supabase query layer: getFeaturedProperties, getLatestProperties, getPropertyCountByTransactionType, getFeaturedLocations, getPropertyCountByCity, getActiveAgents, getTotalPropertyCount, getAllLocations
- ✅ shadcn/ui primitives installed: button, card, badge, input, select, skeleton, separator
- ✅ Homepage SEO metadata (title, description, canonical URL)

#### Changed
- `components/layout/Footer.tsx` — Replaced removed brand icons (Facebook, Instagram, Twitter, Linkedin) with available lucide-react generic icons (Globe, Camera, MessageCircle, Briefcase)
- `lib/supabase/queries.ts` — Fixed TypeScript type casts for Supabase joined relations
- `package.json` — Added lucide-react, class-variance-authority, radix-ui dependencies

#### Empty States
- Homepage gracefully handles no properties (no seed data exists)
- Locations and agents sections show appropriate empty states

### Integration Fixes (2026-08-13)

#### Added
- ✅ `PROJECT_RULES.md` - Permanent project rules and guidelines
  - New session protocol
  - Token/context limit protocol
  - Technology stack rules
  - Architecture rules (Next.js, Supabase, Database)
  - Security rules (RLS, Authentication, Storage)
  - Database migration rules
  - Feature requirements (Properties, Agents, Leads, etc.)
  - Responsive & mobile rules
  - SEO requirements
  - Reusability architecture
  - Git rules
  - Coding standards
  - Development phases overview
  - Project memory system
  - Rules against duplication
  - Cloudflare deployment rules
  - Quality requirements
  - Prohibited actions

### Phase 3 — Supabase Backend (2026-08-13)

#### Added - Database Migrations
- ✅ 17 SQL migration files for complete database schema
- `001_initial_schema.sql` - PostgreSQL extensions (uuid-ossp, pgcrypto)
- `002_profiles.sql` - User profiles with auto-create trigger
- `003_locations.sql` - Nigerian cities and neighborhoods
- `004_agents.sql` - Real estate agents
- `005_amenities.sql` - Property amenities
- `006_properties.sql` - Main property listings with full-text search
- `007_property_images.sql` - Property gallery with ordering
- `008_property_amenities.sql` - Property-amenity junction table
- `009_favorites.sql` - User favorite properties
- `010_inquiries.sql` - Customer inquiries and leads
- `011_viewing_requests.sql` - Property viewing appointments
- `012_contact_submissions.sql` - General contact forms
- `013_blog_categories.sql` - Blog categories
- `014_blog_posts.sql` - Blog posts with full-text search
- `015_site_settings.sql` - Configurable site settings + social links
- `016_rls_policies.sql` - Row Level Security for all tables
- `017_storage_buckets.sql` - Storage buckets + policies

#### Added - Row Level Security
- ✅ RLS enabled on all 15 tables
- ✅ Helper functions: `is_admin()`, `is_agent()`
- ✅ Public policies for viewing published content
- ✅ Customer policies for favorites and profile management
- ✅ Agent policies for assigned properties and leads
- ✅ Admin policies for full data access
- ✅ Secure inquiry and viewing request submission

#### Added - Storage
- ✅ 4 storage buckets created
  - `property-images` - Property photos and galleries
  - `agent-images` - Agent profile photos
  - `blog-images` - Blog featured images
  - `site-assets` - Logos, favicons, general assets
- ✅ Storage policies: Public read, Admin write/delete
- ✅ File size and MIME type validation ready

#### Added - Supabase Clients
- ✅ `lib/supabase/client.ts` - Browser/client-side Supabase client
- ✅ `lib/supabase/server.ts` - Server-side Supabase client with helpers
- ✅ `lib/supabase/middleware.ts` - Authentication middleware helper
- ✅ User helper functions (getUser, getUserProfile, isAdmin, isAgent)

#### Added - TypeScript Types
- ✅ `types/database.types.ts` - Complete database TypeScript types
- ✅ All 15 table types with Row/Insert/Update interfaces
- ✅ Enum types for property_type, transaction_type, status, role, etc.
- ✅ JSON type for flexible data

#### Added - Seed Data
- ✅ `supabase/seed.sql` - Comprehensive demo data
- ✅ 18 Nigerian locations (Lagos, Abuja, Port Harcourt)
- ✅ 20 amenities (Pool, Gym, Security, Generator, BQ, etc.)
- ✅ 6 demo agents with realistic profiles
- ✅ 5 blog categories
- ✅ Site settings (company info, contact details)
- ✅ Social media links

#### Added - Documentation
- ✅ `docs/SUPABASE_SETUP.md` - Complete 16-step setup guide
- ✅ `supabase/MIGRATION_ORDER.md` - Migration execution order
- ✅ Database schema documentation
- ✅ RLS policy explanations
- ✅ Storage configuration guide
- ✅ Troubleshooting section
- ✅ Production checklist

#### Added - Dependencies
- ✅ `@supabase/ssr` for server-side rendering support

#### Database Features
- Auto-create profile on user signup (trigger function)
- Auto-set published_at when status changes
- Updated_at triggers on all relevant tables
- Full-text search on properties and blog posts
- Unique constraints on critical fields
- Proper foreign key relationships
- Cascading deletes where appropriate

### Phase 2 — Foundation (2026-08-13)

#### Added
- ✅ Next.js 16.3.0 with App Router
- ✅ TypeScript strict mode configuration
- ✅ Tailwind CSS 4 with custom design tokens
- ✅ React 19.2.8
- ✅ Project folder structure (components, lib, types, hooks)
- ✅ Navbar component with mobile menu
- ✅ Footer component with links and contact info
- ✅ Root layout with metadata and SEO
- ✅ Homepage placeholder
- ✅ Global styles with CSS variables for theming
- ✅ Utility functions (formatPrice, slugify, generateWhatsAppUrl, etc.)
- ✅ Constants file (property types, transaction types, Nigerian locations)
- ✅ Supabase client dependencies
- ✅ React Hook Form + Zod for form validation
- ✅ lucide-react for icons
- ✅ .env.example with all required variables
- ✅ Comprehensive README.md
- ✅ components.json for shadcn/ui

#### Configured
- Next.js for Cloudflare compatibility (unoptimized images, standalone output)
- TypeScript with strict mode and path aliases
- Tailwind CSS with custom color palette (green primary for trust)
- Package.json with project metadata and dependencies

#### Verified
- ✅ Build successful (npm run build)
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ Navbar and Footer render correctly
- ✅ Responsive layout working

### Phase 1 — Architecture & Planning (2026-08-13)

#### Added
- ✅ Initialized Git repository
- ✅ Created project directory structure
- ✅ Created `PROJECT_STATUS.md` — Project tracking and session management
- ✅ Created `ARCHITECTURE.md` — Complete system architecture documentation
  - Technology stack definition
  - System architecture diagrams
  - Complete PostgreSQL database schema (15 tables)
  - Row Level Security (RLS) strategy
  - Storage architecture (4 buckets)
  - Application folder structure
  - Complete route map (30+ routes)
  - Component architecture
  - SEO architecture
  - Cloudflare + Supabase deployment architecture
  - Security architecture
  - Nigerian market localization requirements
- ✅ Created `CHANGELOG.md` — This file

#### Defined
- Complete database schema with relationships
  - profiles, agents, properties, property_images
  - amenities, property_amenities, locations
  - favorites, inquiries, viewing_requests
  - blog_posts, blog_categories, contact_submissions
  - site_settings, social_links
- RLS policies for all tables
- Storage buckets and policies
- Nigerian market requirements (NGN currency, locations, property types)
- Cloudflare-first deployment strategy
- Reusability strategy for multiple clients

#### Decisions
- **Hosting:** Cloudflare Pages (NOT Vercel)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Frontend:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Currency:** NGN (₦)
- **Primary Communication:** WhatsApp integration
- **Authorization:** Row Level Security (RLS)
- **Image Strategy:** Unoptimized or Cloudflare Images (NOT Vercel)

---

## Phase Status

### Completed Phases
- ✅ **Phase 1** — Architecture & Planning (2026-08-13)
- ✅ **Phase 2** — Foundation (2026-08-13)
- ✅ **Phase 3** — Supabase Backend (2026-08-13)
- ✅ **Phase 4** — Homepage + Property Listing + Property Detail Complete (2026-08-14)

### Pending Phases
- ⏳ **Phase 4** — Remaining Pages (Agents, Locations, Contact, Blog)
- ⏳ **Phase 5** — Conversion Features (WhatsApp, Inquiries, Viewings, Favorites)
- ⏳ **Phase 6** — Admin Dashboard (Authentication, CRUD, Management)
- ⏳ **Phase 7** — SEO & Performance (Metadata, Schema, Optimization)
- ⏳ **Phase 8** — Security Review (RLS verification, Testing)
- ⏳ **Phase 9** — Cloudflare Production (Deployment, Domain, SSL)

---

## Development Guidelines

### Git Commit Format

```
feat: add feature description
fix: fix bug description
docs: update documentation
refactor: refactor code
test: add tests
chore: update dependencies
```

### Update Protocol

After each significant change:
1. Update `CHANGELOG.md` with changes
2. Update `PROJECT_STATUS.md` with progress
3. Update `ARCHITECTURE.md` if architecture changes
4. Commit changes with descriptive message

---

## Notes

- This is a commercial product designed to be sold to Nigerian real estate agencies
- Target price: $500–$1,000
- Must look premium, not like a template
- Must be production-ready
- Must be reusable for multiple clients
- Must be Cloudflare-compatible (NOT Vercel-dependent)

---

**Changelog Started:** 2026-08-13  
**Project Status:** Phase 4 — Homepage + Property Listing + Property Detail Complete, Remaining Pages Pending
