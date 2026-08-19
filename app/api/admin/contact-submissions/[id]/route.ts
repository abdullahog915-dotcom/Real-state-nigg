import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CONTACT_SUBMISSION_STATUSES } from '@/lib/admin-schemas';

/**
 * PATCH /api/admin/contact-submissions/[id]
 * Updates a contact submission's status.
 * Status values are restricted to the CHECK constraint (migration 012).
 */
const updateContactSubmissionSchema = z.object({
  status: z.enum(CONTACT_SUBMISSION_STATUSES),
});

const uuidSchema = z.string().uuid();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid contact submission id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateContactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('contact_submissions')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Contact submission not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('contact_submissions')
    .update({ status: parsed.data.status })
    .eq('id', id);
  if (error) {
    console.error('Error updating contact submission:', error.message);
    return NextResponse.json(
      { error: 'Unable to update the contact submission right now' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
