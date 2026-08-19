import 'server-only';

import { createClient } from '@supabase/supabase-js';

interface ContactSubmissionInput {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface InquiryInput extends ContactSubmissionInput {
  propertyId: string;
}

interface ViewingRequestInput {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string | null;
}

function createTrustedLeadClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Trusted lead submission is not configured.');
  }

  // This client is deliberately isolated from cookie/session-aware SSR clients.
  // It is used only after route-level rate limiting, validation, and Turnstile.
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function performTrustedInsert(
  table: 'contact_submissions' | 'inquiries' | 'viewing_requests',
  values: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await createTrustedLeadClient().from(table).insert(values);
    if (error) {
      console.error('Trusted lead submission was rejected by the database.', {
        errorCode: error.code,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('Trusted lead submission could not be completed.', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    return false;
  }
}

export function submitContactSubmission(input: ContactSubmissionInput): Promise<boolean> {
  return performTrustedInsert('contact_submissions', {
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    status: 'new',
  });
}

export function submitInquiry(input: InquiryInput): Promise<boolean> {
  return performTrustedInsert('inquiries', {
    property_id: input.propertyId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    source: 'website',
    status: 'new',
    assigned_agent_id: null,
    notes: null,
  });
}

export function submitViewingRequest(input: ViewingRequestInput): Promise<boolean> {
  return performTrustedInsert('viewing_requests', {
    property_id: input.propertyId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    preferred_date: input.preferredDate,
    preferred_time: input.preferredTime,
    message: input.message,
    status: 'requested',
    agent_id: null,
    notes: null,
  });
}
