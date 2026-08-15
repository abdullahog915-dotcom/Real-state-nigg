import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/** Partial update schema for agents (migration 004). */
const updateAgentSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  slug: z.string().trim().max(200).optional(),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30).optional().or(z.literal('')),
  bio: z.string().trim().max(5000).optional().or(z.literal('')),
  photo_url: z.string().trim().url().max(2048).optional().or(z.literal('')),
  specialization: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  locations: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
});

const uuidSchema = z.string().uuid();

/**
 * PATCH /api/admin/agents/[id]
 * Partial agent update (full edit form and the is_active toggle share this).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateAgentSchema.safeParse(body);
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
    .from('agents')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { ...data };
  if (data.slug !== undefined) update.slug = slugify(data.slug);
  for (const key of ['email', 'phone', 'whatsapp', 'bio', 'photo_url'] as const) {
    if (update[key] === '') update[key] = null;
  }

  const { error } = await supabase.from('agents').update(update).eq('id', id);
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    console.error('Error updating agent:', error.message);
    return NextResponse.json({ error: 'Unable to update the agent right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/agents/[id]
 * Deletes the agent. Assigned properties keep existing — their agent_id
 * is set to NULL by the schema (ON DELETE SET NULL).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from('agents').delete().eq('id', id).select('id');

  if (error) {
    console.error('Error deleting agent:', error.message);
    return NextResponse.json({ error: 'Unable to delete the agent right now' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
