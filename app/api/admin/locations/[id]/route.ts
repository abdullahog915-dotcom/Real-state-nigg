import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/** Partial update schema for locations (migration 003). */
const updateLocationSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  slug: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  state: z.string().trim().min(2).max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(3000).optional().or(z.literal('')),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
});

const uuidSchema = z.string().uuid();

/**
 * PATCH /api/admin/locations/[id]
 * Partial location update (full edit form and the is_featured toggle
 * share this endpoint).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid location id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateLocationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('locations')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { ...data };
  if (data.slug !== undefined) update.slug = slugify(data.slug);
  if (update.description === '') update.description = null;

  const { error } = await supabase.from('locations').update(update).eq('id', id);
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    console.error('Error updating location:', error.message);
    return NextResponse.json({ error: 'Unable to update the location right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/locations/[id]
 * Deletes the location. Properties assigned to it keep existing — their
 * location_id is set to NULL by the schema (ON DELETE SET NULL).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid location id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from('locations').delete().eq('id', id).select('id');

  if (error) {
    console.error('Error deleting location:', error.message);
    return NextResponse.json({ error: 'Unable to delete the location right now' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
