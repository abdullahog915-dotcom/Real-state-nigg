'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Signs the current user out and returns them to the home page.
 * Errors are swallowed — the user is always redirected so they are never
 * stranded on a broken state, and no implementation details are exposed.
 */
export async function signOut() {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
  } catch {
    // Continue to the redirect even if the remote sign-out call fails.
  }

  redirect('/');
}
