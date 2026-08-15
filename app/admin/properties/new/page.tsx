import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PropertyForm } from '@/components/admin/PropertyForm';
import {
  getAdminAgentOptions,
  getAdminAmenityOptions,
  getAdminLocationOptions,
} from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Add Property',
};

export default async function NewPropertyPage() {
  const [locations, agents, amenities] = await Promise.all([
    getAdminLocationOptions(),
    getAdminAgentOptions(),
    getAdminAmenityOptions(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Add Property"
        description="Create a new listing. New properties start as drafts unless you choose another status."
      />
      <PropertyForm mode="create" locations={locations} agents={agents} amenities={amenities} />
    </div>
  );
}
