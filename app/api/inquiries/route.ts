import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimitPublicForm } from '@/lib/rate-limit';
import { submitInquiry } from '@/lib/supabase/lead-writer';
import { createClient } from '@/lib/supabase/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * Server-side validation schema for property inquiries.
 * Matches the inquiries table constraints.
 */
const inquirySchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().trim().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(255),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(2000, 'Message is too long'),
  turnstile_token: z.string().max(2048).optional(),
});

/**
 * POST /api/inquiries
 * Public inquiry submission. Public property validation uses the RLS client;
 * insertion uses the dedicated server-only trusted lead writer.
 */
export async function POST(request: Request) {
  const rateLimited = await rateLimitPublicForm(request, '/api/inquiries');
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(request, parsed.data.turnstile_token, 'inquiry'))) {
    return NextResponse.json(
      { error: 'Please complete the security check and try again.' },
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
    console.error('Error validating inquiry property:', propertyError.message);
    return NextResponse.json(
      { error: 'Unable to submit your inquiry right now. Please try again.' },
      { status: 500 }
    );
  }
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const saved = await submitInquiry({
    propertyId: parsed.data.property_id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
  });

  if (!saved) {
    return NextResponse.json(
      { error: 'Unable to submit your inquiry right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
