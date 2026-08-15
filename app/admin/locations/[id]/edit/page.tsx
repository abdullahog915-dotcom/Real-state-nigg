import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { LocationForm, type LocationFormValues } from '@/components/admin/LocationForm';
import { Button } from '@/components/ui/button';
import { getAdminLocationById } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Edit Location',
};

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;

  const location = await getAdminLocationById(id);
  if (!location) {
    notFound();
  }

  const initialValues: Partial<LocationFormValues> = {
    name: location.name ?? '',
    slug: location.slug ?? '',
    city: location.city ?? '',
    state: location.state ?? '',
    country: location.country ?? 'Nigeria',
    description: location.description ?? '',
    is_featured: Boolean(location.is_featured),
    display_order: String(location.display_order ?? 0),
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit Location"
        description={location.name}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/locations/${location.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" /> View Public Page
              </Link>
            </Button>
            <DeleteButton
              apiPath={`/api/admin/locations/${location.id}`}
              confirmText={`Delete "${location.name}"? Properties in this location remain but become unassigned.`}
              label="Delete"
              redirectTo="/admin/locations"
            />
          </>
        }
      />
      <LocationForm mode="edit" locationId={location.id} initialValues={initialValues} />
    </div>
  );
}
