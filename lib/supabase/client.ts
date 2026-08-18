import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Browser-side Supabase client using @supabase/ssr's createBrowserClient.
// Sessions are persisted in cookies (NOT localStorage) so the SSR
// middleware (createServerClient) can read the same session on the
// next request. Using @supabase/supabase-js here would store sessions
// in localStorage, breaking the client/server session handoff.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper to get user profile with role
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper to check if user is admin
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const profile = await getUserProfile(user.id);
    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

// Helper to check if user is agent or admin
export async function isAgent() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const profile = await getUserProfile(user.id);
    return profile?.role === 'agent' || profile?.role === 'admin';
  } catch {
    return false;
  }
}
