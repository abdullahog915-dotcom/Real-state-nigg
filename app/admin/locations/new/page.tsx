import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LocationForm } from '@/components/admin/LocationForm';

export const metadata: Metadata = {
  title: 'Add Location',
};

export default function NewLocationPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Location"
        description="Create a city or neighbourhood that properties can be listed in."
      />
      <LocationForm mode="create" />
    </div>
  );
}
