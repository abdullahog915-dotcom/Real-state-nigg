import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { BLOG_POST_STATUSES, httpUrlSchema } from '@/lib/admin-schemas';

/** Partial update schema for blog posts (migration 014). */
const updateBlogPostSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(250, 'Title is too long').optional(),
  slug: z.string().trim().max(250).optional(),
  content: z.string().trim().min(1, 'Content is required').max(200_000, 'Content is too long').optional(),
  excerpt: z.string().trim().max(1000).optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  featured_image: httpUrlSchema.optional().or(z.literal('')),
  status: z.enum(BLOG_POST_STATUSES).optional(),
  meta_title: z.string().trim().max(200).optional().or(z.literal('')),
  meta_description: z.string().trim().max(500).optional().or(z.literal('')),
});

const uuidSchema = z.string().uuid();

/**
 * PATCH /api/admin/blog-posts/[id]
 * Partial blog post update (full edit form and the inline status select
 * share this endpoint). The published_at timestamp is managed by the
 * set_blog_published_at trigger on status transitions.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid blog post id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateBlogPostSchema.safeParse(body);
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
    .from('blog_posts')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { ...data };
  if (data.slug !== undefined) update.slug = slugify(data.slug);
  for (const key of ['excerpt', 'featured_image', 'meta_title', 'meta_description'] as const) {
    if (update[key] === '') update[key] = null;
  }
  if (update.category_id === '') update.category_id = null;

  const { error } = await supabase.from('blog_posts').update(update).eq('id', id);
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'The selected category no longer exists' },
        { status: 400 }
      );
    }
    console.error('Error updating blog post:', error.message);
    return NextResponse.json({ error: 'Unable to update the blog post right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/blog-posts/[id]
 * Permanently deletes the blog post. There is no soft-delete column in
 * the schema — use the "archived" status to hide a post instead.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid blog post id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from('blog_posts').delete().eq('id', id).select('id');

  if (error) {
    console.error('Error deleting blog post:', error.message);
    return NextResponse.json({ error: 'Unable to delete the blog post right now' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
