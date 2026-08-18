import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Server-side Supabase client
// Use this in Server Components and Server Actions
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handle cookie setting errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handle cookie removal errors in Server Components
          }
        },
      },
    }
  );
}

// Get current user from server
export const getUser = cache(async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

// Get user profile with role
export const getUserProfile = cache(async function getUserProfile() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
});

// Check if current user is admin
export const isAdmin = cache(async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === 'admin';
});

// Check if current user is agent or admin
export const isAgent = cache(async function isAgent() {
  const profile = await getUserProfile();
  return profile?.role === 'agent' || profile?.role === 'admin';
});
