import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeRedirectPath } from '@/lib/redirects';

/**
 * Auth callback for Supabase email confirmation / session exchange.
 *
 * Supabase redirects here with a one-time `code` after the user clicks the
 * confirmation link in their email. We exchange the code for a session using
 * the standard SSR client — no service_role, no token handling of our own.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'));
  const destination = next ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  // Missing or invalid code — send the user back to login with a generic,
  // non-leaking error key (never reflect Supabase error text into the URL).
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'callback');
  if (next) {
    loginUrl.searchParams.set('next', next);
  }
  return NextResponse.redirect(loginUrl);
}
