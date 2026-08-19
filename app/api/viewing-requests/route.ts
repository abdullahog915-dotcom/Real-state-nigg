import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * Server-side validation schema for viewing requests.
 * Matches the viewing_requests table constraints (migration 011).
 */
const viewingRequestSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().trim().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(255),
  phone: z.string().trim().min(7, 'Phone number is too short').max(20, 'Phone number is too long'),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)'),
  preferred_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Enter a valid time (HH:MM)'),
  message: z
    .string()
    .trim()
    .max(2000, 'Message is too long')
    .optional()
    .or(z.literal('')),
  turnstile_token: z.string().max(2048).optional(),
});

/**
 * POST /api/viewing-requests
 * Public viewing request submission. Inserts into the viewing_requests table
 * using the anon/server client — RLS allows public inserts and blocks reads.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = viewingRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(request, parsed.data.turnstile_token, 'viewing'))) {
    return NextResponse.json(
      { error: 'Please complete the security check and try again.' },
      { status: 400 }
    );
  }

  // Reject past dates — viewers should only request future viewings
  const preferredDate = new Date(`${parsed.data.preferred_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(preferredDate.getTime()) || preferredDate < today) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { preferred_date: ['Choose today or a future date'] } },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', parsed.data.property_id)
    .in('status', ['published', 'featured'])
    .maybeSingle();
  if (propertyError) {
    console.error('Error validating viewing property:', propertyError.message);
    return NextResponse.json(
      { error: 'Unable to submit your viewing request right now. Please try again.' },
      { status: 500 }
    );
  }
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const { error } = await supabase.from('viewing_requests').insert({
    property_id: parsed.data.property_id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    preferred_date: parsed.data.preferred_date,
    preferred_time: parsed.data.preferred_time,
    message: parsed.data.message || null,
    status: 'requested',
  });

  if (error) {
    console.error('Error submitting viewing request:', error.message);
    return NextResponse.json(
      { error: 'Unable to submit your viewing request right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
