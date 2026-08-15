import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/** Validation for blog category creation — mirrors migration 013. */
const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120, 'Name is too long'),
  slug: z.string().trim().max(150).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  display_order: z.number().int().min(0).max(10000).default(0),
});

/**
 * POST /api/admin/blog-categories
 * Admin-only blog category creation.
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

  const parsed = createCategorySchema.safeParse(body);
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

  const { data: category, error } = await supabase
    .from('blog_categories')
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
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
    console.error('Error creating blog category:', error.message);
    return NextResponse.json({ error: 'Unable to create the category right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: category.id, slug: category.slug }, { status: 201 });
}
