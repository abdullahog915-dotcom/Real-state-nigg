import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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
});

/**
 * POST /api/inquiries
 * Public inquiry submission. Inserts into the inquiries table using the
 * anon/server client — RLS allows public inserts and blocks reads.
 */
export async function POST(request: Request) {
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

  const supabase = await createClient();

  const { error } = await supabase.from('inquiries').insert({
    property_id: parsed.data.property_id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
    source: 'website',
  });

  if (error) {
    console.error('Error submitting inquiry:', error.message);
    return NextResponse.json(
      { error: 'Unable to submit your inquiry right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
