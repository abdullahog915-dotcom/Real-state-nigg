import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BannersManager } from '@/components/admin/BannersManager';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Homepage Banners' };

export default async function BannersPage() {
  const supabase = await createClient();
  const [{ data, error }, videoSchema] = await Promise.all([
    supabase.from('homepage_banners').select('*').order('display_order').order('created_at'),
    supabase.from('homepage_banners').select('media_type').limit(1),
  ]);
  const migrationReady = !error && !videoSchema.error;
  if (error && !['42P01', 'PGRST205'].includes(error.code)) {
    console.error('Admin banners could not be loaded.', { code: error.code });
  }
  return <div className="space-y-6"><AdminPageHeader title="Homepage Banners" description="Create, order, and publish responsive homepage hero banners." /><BannersManager rows={data ?? []} migrationReady={migrationReady} /></div>;
}
