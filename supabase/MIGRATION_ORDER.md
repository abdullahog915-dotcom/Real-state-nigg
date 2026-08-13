# MIGRATION ORDER

Run Supabase migrations in this exact order:

## Order of Execution

1. `001_initial_schema.sql` - Enable extensions (UUID, pgcrypto)
2. `002_profiles.sql` - User profiles with roles + auto-create trigger
3. `003_locations.sql` - Nigerian cities and neighborhoods
4. `004_agents.sql` - Real estate agents
5. `005_amenities.sql` - Property amenities
6. `006_properties.sql` - Main property listings (depends on locations, agents)
7. `007_property_images.sql` - Property gallery (depends on properties)
8. `008_property_amenities.sql` - Property-amenity junction (depends on properties, amenities)
9. `009_favorites.sql` - User favorites (depends on properties)
10. `010_inquiries.sql` - Customer inquiries (depends on properties, agents)
11. `011_viewing_requests.sql` - Viewing appointments (depends on properties, agents)
12. `012_contact_submissions.sql` - General contact forms
13. `013_blog_categories.sql` - Blog categories
14. `014_blog_posts.sql` - Blog posts (depends on blog_categories)
15. `015_site_settings.sql` - Configurable site settings + social links
16. `016_rls_policies.sql` - Row Level Security policies (ALL tables)
17. `017_storage_buckets.sql` - Storage buckets + policies

## After Migrations

Run seed data:
- `seed.sql` - Demo data (locations, amenities, agents, settings)

## Dependencies

- Migration 006 depends on: 003, 004
- Migration 007 depends on: 006
- Migration 008 depends on: 005, 006
- Migration 009 depends on: 006
- Migration 010 depends on: 004, 006
- Migration 011 depends on: 004, 006
- Migration 014 depends on: 013
- Migration 016 depends on: ALL previous tables
- Migration 017 depends on: 016 (uses is_admin() function)

## Important Notes

1. **Never run migrations out of order** - Dependencies will fail
2. **Run 016_rls_policies.sql only after all tables exist** - It references all tables
3. **Run 017_storage_buckets.sql last** - It uses RLS helper functions from 016
4. **Seed data should run after all migrations complete**
5. **Use transactions when possible** - `BEGIN;` ... `COMMIT;` for safety
