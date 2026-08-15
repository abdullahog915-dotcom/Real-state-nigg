import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { INQUIRY_STATUSES } from '@/lib/admin-schemas';

/**
 * PATCH /api/admin/inquiries/[id]
 * Updates an inquiry's pipeline status and/or internal notes.
 * Status values are restricted to the CHECK constraint (migration 010).
 * Inquiries are never deleted from the admin UI — statuses cover the
 * full lifecycle and RLS provides no admin DELETE policy by design.
 */
const updateInquirySchema = z
  .object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    notes: z.string().trim().max(2000).optional().or(z.literal('')),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No valid fields to update',
  });

const uuidSchema = z.string().uuid();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid inquiry id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateInquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('inquiries')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  const update: { status?: string; notes?: string | null } = {};
  if (parsed.data.status) update.status = parsed.data.status;
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes || null;

  const { error } = await supabase.from('inquiries').update(update).eq('id', id);
  if (error) {
    console.error('Error updating inquiry:', error.message);
    return NextResponse.json({ error: 'Unable to update the inquiry right now' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
