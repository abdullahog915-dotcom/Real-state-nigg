import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/** Partial update schema for blog categories (migration 013). */
const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().max(150).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  display_order: z.number().int().min(0).max(10000).optional(),
});

const uuidSchema = z.string().uuid();

/**
 * PATCH /api/admin/blog-categories/[id]
 * Partial blog category update.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateCategorySchema.safeParse(body);
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
    .from('blog_categories')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { ...data };
  if (data.slug !== undefined) update.slug = slugify(data.slug);
  if (update.description === '') update.description = null;

  const { error } = await supabase.from('blog_categories').update(update).eq('id', id);
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    console.error('Error updating blog category:', error.message);
    return NextResponse.json({ error: 'Unable to update the category right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/blog-categories/[id]
 * Deletes the category. Posts assigned to it keep existing — their
 * category_id is set to NULL by the schema (ON DELETE SET NULL).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from('blog_categories').delete().eq('id', id).select('id');

  if (error) {
    console.error('Error deleting blog category:', error.message);
    return NextResponse.json({ error: 'Unable to delete the category right now' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
