import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = { title: 'Site Settings' };

export default async function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Site Settings" description="Manage public branding, contact details, social links, homepage fallback, and SEO defaults." />
      <SiteSettingsManager initial={await getSiteSettings()} />
    </div>
  );
}
