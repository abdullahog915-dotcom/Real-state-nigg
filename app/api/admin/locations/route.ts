import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/** Validation for location creation — mirrors migration 003. */
const createLocationSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(150, 'Name is too long'),
  slug: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is too short').max(100, 'City is too long'),
  state: z.string().trim().min(2, 'State is too short').max(100, 'State is too long'),
  country: z.string().trim().min(2).max(100).default('Nigeria'),
  description: z.string().trim().max(3000).optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).max(10000).default(0),
});

/**
 * POST /api/admin/locations
 * Admin-only location creation.
 */
export async function POST(request: Request) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { name: ['Enter a name that can be turned into a slug'] } },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: location, error } = await supabase
    .from('locations')
    .insert({
      name: data.name,
      slug,
      city: data.city,
      state: data.state,
      country: data.country,
      description: data.description || null,
      is_featured: data.is_featured,
      display_order: data.display_order,
    })
    .select('id, slug')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    console.error('Error creating location:', error.message);
    return NextResponse.json({ error: 'Unable to create the location right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: location.id, slug: location.slug }, { status: 201 });
}
