import 'server-only';

import { cache } from 'react';
import { createPublicClient } from '@/lib/supabase/public';
import type { Database } from '@/types/database.types';

export type HomepageBanner = Database['public']['Tables']['homepage_banners']['Row'];

export const getActiveHomepageBanners = cache(async (): Promise<HomepageBanner[]> => {
  try {
    const { data, error } = await createPublicClient()
      .from('homepage_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .order('created_at')
      .order('id');

    // Before migration 021 is applied, the safe fallback hero remains available.
    if (error) {
      if (error.code !== '42P01' && error.code !== 'PGRST205') {
        console.error('Active homepage banners could not be loaded.', { code: error.code });
      }
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error('Homepage banner request failed.', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    return [];
  }
});
