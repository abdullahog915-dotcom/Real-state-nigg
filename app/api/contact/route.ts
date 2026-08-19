import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimitPublicForm } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * Server-side validation schema for contact form submissions.
 * Matches the contact_submissions table constraints.
 */
const contactSchema = z.object({
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
 * POST /api/contact
 * Public contact form submission. Inserts into the contact_submissions
 * table using the anon/server client — RLS allows public inserts and
 * blocks reads (admins only).
 */
export async function POST(request: Request) {
  const rateLimited = await rateLimitPublicForm(request, '/api/contact');
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(request, parsed.data.turnstile_token, 'contact'))) {
    return NextResponse.json(
      { error: 'Please complete the security check and try again.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.from('contact_submissions').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error('Error submitting contact form:', error.message);
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
