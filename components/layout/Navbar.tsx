import { getUser } from '@/lib/supabase/server';
import { NavbarClient } from '@/components/layout/NavbarClient';
import { getSiteSettings } from '@/lib/site-settings';

/**
 * Server Component wrapper: detects the signed-in user on the server and
 * passes it down as a prop, so the client navbar renders with the correct
 * auth state immediately (no hydration mismatch, no loading flash).
 */
export async function Navbar() {
  const [user, settings] = await Promise.all([getUser(), getSiteSettings()]);

  return <NavbarClient userEmail={user?.email ?? null} settings={settings} />;
}
