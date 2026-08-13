import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
// Use this in Client Components and browser contexts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
