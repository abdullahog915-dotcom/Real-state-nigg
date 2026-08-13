# SUPABASE SETUP GUIDE

Complete guide for setting up Supabase backend for the Nigerian Real Estate Platform.

---

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Project created in previous phases (Phase 1 & 2 complete)

---

## 1. CREATE SUPABASE PROJECT

### Step 1: Create New Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name:** `nigerian-real-estate-platform` (or your choice)
   - **Database Password:** Generate a strong password and save it securely
   - **Region:** Choose closest to Nigeria (e.g., `Europe (West) - Ireland` or `US East`)
4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (safe to use in client-side code)
   - **service_role key** (NEVER expose to client, server-only)

### Step 3: Update Environment Variables

Update `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ IMPORTANT:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## 2. RUN DATABASE MIGRATIONS

Migrations are located in `supabase/migrations/` and must be run in order.

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find project ref in Project Settings → General)

4. **Run migrations:**
   ```bash
   supabase db push
   ```

### Option B: Using SQL Editor (Manual)

1. Go to **SQL Editor** in Supabase Dashboard
2. Run migrations **in numerical order** (001, 002, 003...):
   - `001_initial_schema.sql`
   - `002_profiles.sql`
   - `003_locations.sql`
   - `004_agents.sql`
   - `005_amenities.sql`
   - `006_properties.sql`
   - `007_property_images.sql`
   - `008_property_amenities.sql`
   - `009_favorites.sql`
   - `010_inquiries.sql`
   - `011_viewing_requests.sql`
   - `012_contact_submissions.sql`
   - `013_blog_categories.sql`
   - `014_blog_posts.sql`
   - `015_site_settings.sql`
   - `016_rls_policies.sql`
   - `017_storage_buckets.sql`

3. Copy and paste each file's content into SQL Editor
4. Click "Run" for each migration
5. Verify no errors before proceeding to next migration

---

## 3. VERIFY DATABASE SCHEMA

After running migrations, verify tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 15 tables:
   - ✅ profiles
   - ✅ agents
   - ✅ locations
   - ✅ properties
   - ✅ property_images
   - ✅ amenities
   - ✅ property_amenities
   - ✅ favorites
   - ✅ inquiries
   - ✅ viewing_requests
   - ✅ contact_submissions
   - ✅ blog_categories
   - ✅ blog_posts
   - ✅ site_settings
   - ✅ social_links

3. Check RLS is enabled on all tables (🛡️ icon should be present)

---

## 4. SETUP STORAGE BUCKETS

### Verify Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. You should see 4 buckets created by migration `017_storage_buckets.sql`:
   - ✅ property-images
   - ✅ agent-images
   - ✅ blog-images
   - ✅ site-assets

### Configure Bucket Settings (Optional)

For each bucket, you can configure:
- **File size limit:** Recommended 10MB for property images, 5MB for others
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

To configure via Dashboard:
1. Click on bucket name
2. Click "Edit bucket"
3. Set size limit and allowed MIME types

---

## 5. SEED DEMO DATA

Run the seed file to populate database with demo data.

### Using SQL Editor

1. Go to **SQL Editor**
2. Open `supabase/seed.sql`
3. Copy entire content
4. Paste into SQL Editor
5. Click "Run"

This will populate:
- ✅ 18 Locations (Lagos, Abuja, Port Harcourt areas)
- ✅ 20 Amenities (Pool, Gym, Security, etc.)
- ✅ 6 Demo Agents
- ✅ 5 Blog Categories
- ✅ Site Settings (company info, contact details)
- ✅ Social Links

### Verify Seed Data

Check Table Editor for:
- `locations` table: Should have ~18 rows
- `amenities` table: Should have ~20 rows
- `agents` table: Should have 6 rows
- `site_settings` table: Should have ~15 rows

---

## 6. CREATE FIRST ADMIN USER

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Fill in:
   - **Email:** admin@realestate.com (or your email)
   - **Password:** Create strong password
   - **Auto Confirm User:** ✅ Check this
4. Click "Create user"
5. Note the User ID (UUID)

### Option B: Via Sign Up Page (After deployment)

1. Use the signup page on your website
2. Sign up with your admin email

### Set User as Admin

After creating user, you must set their role to `admin`:

1. Go to **SQL Editor**
2. Run this query (replace `USER_ID` with actual UUID):

```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'USER_ID';
```

3. Verify:
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

---

## 7. AUTHENTICATION SETUP

Authentication is already configured via migrations. Verify settings:

1. Go to **Authentication** → **Settings**
2. **Site URL:** Set to your domain (or `http://localhost:3000` for development)
3. **Redirect URLs:** Add allowed redirect URLs:
   - `http://localhost:3000/**` (development)
   - `https://yourdomain.com/**` (production)

### Email Templates (Optional)

Customize email templates:
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirm signup
   - Reset password
   - Invite user
   - Magic Link

---

## 8. TEST DATABASE CONNECTION

### Test from Local Development

1. Start development server:
   ```bash
   npm run dev
   ```

2. The application should connect to Supabase automatically
3. Check browser console for any connection errors

### Test Queries

Create a test page or use browser console:

```typescript
import { supabase } from '@/lib/supabase/client';

// Test read published properties
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'published');

console.log('Properties:', data);
console.log('Error:', error);
```

---

## 9. ROW LEVEL SECURITY (RLS) VERIFICATION

RLS policies are automatically applied via `016_rls_policies.sql`.

### Test RLS Policies

1. **Public Access (Unauthenticated):**
   - ✅ Can view published properties
   - ✅ Can view active agents
   - ✅ Can view locations
   - ✅ Can submit inquiries/viewing requests
   - ❌ Cannot view draft properties
   - ❌ Cannot access admin data

2. **Customer Access (Authenticated):**
   - ✅ Can manage own favorites
   - ✅ Can view own profile
   - ❌ Cannot access admin pages

3. **Admin Access:**
   - ✅ Full access to all tables
   - ✅ Can manage all content
   - ✅ Can upload to storage

### Verify RLS in Dashboard

1. Go to **Authentication** → **Policies**
2. Select each table
3. Verify policies are enabled and showing as expected

---

## 10. STORAGE POLICIES VERIFICATION

Storage policies are set via `017_storage_buckets.sql`.

### Test Storage Upload

1. Login as admin
2. Go to admin property management
3. Try uploading an image
4. Image should upload to `property-images` bucket

### Verify Storage Policies in Dashboard

1. Go to **Storage** → Select bucket
2. Click "Policies"
3. Verify:
   - ✅ Public can SELECT (view images)
   - ✅ Admins can INSERT (upload)
   - ✅ Admins can DELETE (remove)

---

## 11. GENERATE TYPESCRIPT TYPES (Optional)

Generate TypeScript types from your live database:

```bash
supabase gen types typescript --project-id your-project-ref > types/database.types.ts
```

**Note:** We've already created `types/database.types.ts` manually based on schema. You can regenerate if schema changes.

---

## 12. TROUBLESHOOTING

### Connection Issues

**Problem:** "Failed to fetch" or connection timeout

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active (not paused)
- Check network/firewall settings

### Authentication Issues

**Problem:** "Invalid JWT" or session errors

**Solutions:**
- Clear browser cookies and localStorage
- Verify Site URL in Supabase Auth settings
- Restart development server

### RLS Policy Issues

**Problem:** "Row level security policy violation"

**Solutions:**
- Verify RLS policies were applied (`016_rls_policies.sql`)
- Check user role in `profiles` table
- Verify `is_admin()` and `is_agent()` functions exist

### Migration Errors

**Problem:** "Relation already exists" or duplicate errors

**Solutions:**
- Don't run migrations twice
- Use `DROP TABLE IF EXISTS` only in development
- Check migration order (001, 002, 003...)

---

## 13. PRODUCTION CHECKLIST

Before deploying to production:

- ✅ All migrations run successfully
- ✅ RLS enabled on all tables
- ✅ RLS policies tested and working
- ✅ Storage buckets created
- ✅ Storage policies configured
- ✅ Admin user created
- ✅ Seed data populated
- ✅ Authentication configured
- ✅ Environment variables set in production
- ✅ Database backups enabled
- ✅ API rate limits configured (if needed)

---

## 14. BACKUP & MAINTENANCE

### Enable Automatic Backups

1. Go to **Database** → **Backups**
2. Supabase free tier: Daily backups (7 days retention)
3. Paid tiers: Configure backup schedule

### Manual Backup

```bash
supabase db dump -f backup.sql
```

### Database Monitoring

1. Go to **Database** → **Performance**
2. Monitor:
   - Query performance
   - Connection pool usage
   - Disk usage

---

## 15. SECURITY BEST PRACTICES

1. **Never expose service_role key to client**
2. **Always use RLS policies** (never rely on client-side checks)
3. **Validate all user inputs** (use Zod schemas)
4. **Limit file upload sizes** in storage buckets
5. **Use HTTPS only** in production
6. **Regularly update dependencies**
7. **Monitor auth logs** for suspicious activity
8. **Enable 2FA** for admin accounts

---

## 16. HELPFUL RESOURCES

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## NEXT STEPS

After completing Supabase setup:

1. ✅ Phase 3 Complete — Supabase Backend
2. 🚀 Begin Phase 4 — Public Website (Homepage, Property Pages, etc.)

---

**Last Updated:** 2026-08-13  
**Supabase Version:** Latest  
**Status:** Phase 3 Complete
