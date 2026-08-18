import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PropertyForm, type PropertyFormValues } from '@/components/admin/PropertyForm';
import { Button } from '@/components/ui/button';
import { getManagedPropertyImagePath } from '@/lib/property-image-storage';
import {
  getAdminAgentOptions,
  getAdminAmenityOptions,
  getAdminLocationOptions,
  getAdminPropertyById,
} from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Edit Property',
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  const [property, locations, agents, amenities] = await Promise.all([
    getAdminPropertyById(id),
    getAdminLocationOptions(),
    getAdminAgentOptions(),
    getAdminAmenityOptions(),
  ]);

  if (!property) {
    notFound();
  }

  // Map the database row onto the form shape (empty strings for blanks)
  const initialValues: Partial<PropertyFormValues> = {
    title: property.title ?? '',
    slug: property.slug ?? '',
    property_id: property.property_id ?? '',
    description: property.description ?? '',
    property_type: property.property_type,
    transaction_type: property.transaction_type,
    status: property.status ?? 'draft',
    price: String(property.price ?? ''),
    currency: property.currency ?? 'NGN',
    location_id: property.location_id ?? '',
    agent_id: property.agent_id ?? '',
    address: property.address ?? '',
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    toilets: property.toilets != null ? String(property.toilets) : '',
    area: property.area != null ? String(property.area) : '',
    year_built: property.year_built != null ? String(property.year_built) : '',
    parking_spaces: property.parking_spaces != null ? String(property.parking_spaces) : '',
    floors: property.floors != null ? String(property.floors) : '',
    is_furnished: Boolean(property.is_furnished),
    is_featured: Boolean(property.is_featured),
    video_url: property.video_url ?? '',
    meta_title: property.meta_title ?? '',
    meta_description: property.meta_description ?? '',
    amenity_ids: (property.property_amenities ?? []).map(
      (link: { amenity_id: string }) => link.amenity_id
    ),
    images: [...(property.property_images ?? [])]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt_text: image.alt_text ?? '',
        is_featured: Boolean(image.is_featured),
        storage_path: getManagedPropertyImagePath(image.url) ?? undefined,
      })),
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit Property"
        description={property.title}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/properties/${property.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" /> View Public Page
              </Link>
            </Button>
            <DeleteButton
              apiPath={`/api/admin/properties/${property.id}`}
              confirmText={`Delete "${property.title}"? This permanently removes the property, its images, favorites and linked inquiries.`}
              label="Delete"
              redirectTo="/admin/properties"
            />
          </>
        }
      />
      <PropertyForm
        mode="edit"
        propertyId={property.id}
        initialValues={initialValues}
        locations={locations}
        agents={agents}
        amenities={amenities}
      />
    </div>
  );
}
