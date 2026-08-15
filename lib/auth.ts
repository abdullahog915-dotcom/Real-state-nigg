/**
 * Server-only auth helpers used by the admin API routes.
 *
 * Client-safe redirect validation lives in `lib/redirects.ts` — keep it
 * there, this module imports server-only Supabase code.
 */

import { NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/supabase/server';

/**
 * Server-side guard for `/api/admin/*` route handlers.
 *
 * Returns `null` when the request comes from an authenticated admin;
 * otherwise it returns the response the handler should send back
 * (401 unauthenticated, 403 authenticated non-admin).
 *
 * Admin identity always comes from the session — never from client input.
 */
export async function adminApiGuard(): Promise<Response | null> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return null;
}
