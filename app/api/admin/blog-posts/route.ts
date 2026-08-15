import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient, getUser } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { BLOG_POST_STATUSES } from '@/lib/admin-schemas';

/** Validation for blog post creation — mirrors migration 014. */
const createBlogPostSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(250, 'Title is too long'),
  slug: z.string().trim().max(250).optional().or(z.literal('')),
  content: z.string().trim().min(1, 'Content is required'),
  excerpt: z.string().trim().max(1000).optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  featured_image: z.string().trim().max(2048).optional().or(z.literal('')),
  status: z.enum(BLOG_POST_STATUSES).default('draft'),
  meta_title: z.string().trim().max(200).optional().or(z.literal('')),
  meta_description: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * POST /api/admin/blog-posts
 * Admin-only blog post creation. author_id always comes from the
 * authenticated session — never from client input.
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

  const parsed = createBlogPostSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { title: ['Enter a title that can be turned into a slug'] } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const user = await getUser();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      category_id: data.category_id || null,
      author_id: user?.id ?? null,
      featured_image: data.featured_image || null,
      status: data.status,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      // The set_blog_published_at trigger only fires on UPDATE, so a post
      // created directly as published needs an explicit timestamp.
      published_at: data.status === 'published' ? new Date().toISOString() : null,
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
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'The selected category no longer exists' },
        { status: 400 }
      );
    }
    console.error('Error creating blog post:', error.message);
    return NextResponse.json({ error: 'Unable to create the blog post right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: post.id, slug: post.slug }, { status: 201 });
}
