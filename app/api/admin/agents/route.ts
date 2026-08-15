import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/**
 * Validation for agent creation — mirrors the agents table (migration 004).
 * specialization and locations are TEXT[] columns, supplied as string lists.
 */
const createAgentSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(150, 'Name is too long'),
  slug: z.string().trim().max(200).optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').max(255).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30).optional().or(z.literal('')),
  bio: z.string().trim().max(5000).optional().or(z.literal('')),
  photo_url: z.string().trim().url('Enter a valid photo URL').max(2048).optional().or(z.literal('')),
  specialization: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  locations: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).max(10000).default(0),
});

/**
 * POST /api/admin/agents
 * Admin-only agent creation.
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

  const parsed = createAgentSchema.safeParse(body);
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

  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      name: data.name,
      slug,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      bio: data.bio || null,
      photo_url: data.photo_url || null,
      specialization: data.specialization,
      locations: data.locations,
      is_active: data.is_active,
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
    console.error('Error creating agent:', error.message);
    return NextResponse.json({ error: 'Unable to create the agent right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: agent.id, slug: agent.slug }, { status: 201 });
}
