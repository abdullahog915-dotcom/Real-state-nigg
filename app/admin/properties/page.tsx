import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { ToggleCell } from '@/components/admin/ToggleCell';
import { statusVariant } from '@/lib/admin-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { PROPERTY_STATUSES } from '@/lib/admin-schemas';
import { getAdminProperties } from '@/lib/supabase/queries';
import { formatDate, formatPrice, getPropertyTypeLabel } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Properties',
};

interface AdminPropertiesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminPropertiesPage({ searchParams }: AdminPropertiesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const status = (PROPERTY_STATUSES as readonly string[]).includes(params.status ?? '')
    ? params.status
    : undefined;
  const search = params.q?.trim() || undefined;

  const result = await getAdminProperties({ search, status, page, pageSize: 20 });

  const buildPageUrl = (nextPage: number) => {
    const url = new URLSearchParams();
    if (search) url.set('q', search);
    if (status) url.set('status', status);
    url.set('page', String(nextPage));
    return `/admin/properties?${url.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        title="Properties"
        description={`${result.count} propert${result.count === 1 ? 'y' : 'ies'} in total`}
        actions={
          <Button asChild>
            <Link href="/admin/properties/new">
              <Plus className="h-4 w-4" /> Add Property
            </Link>
          </Button>
        }
      />

      <AdminFilterBar
        basePath="/admin/properties"
        searchValue={search}
        statusValue={status}
        statusOptions={[...PROPERTY_STATUSES]}
        searchPlaceholder="Search by title..."
      />

      {result.data.length === 0 ? (
        <EmptyState
          title="No properties found"
          description={
            search || status
              ? 'Try adjusting your search or filters.'
              : 'Create your first property to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((property) => {
                  const location = Array.isArray(property.locations)
                    ? property.locations[0]
                    : property.locations;
                  return (
                    <TableRow key={property.id}>
                      <TableCell className="max-w-[260px]">
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          <span className="line-clamp-1">{property.title}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {getPropertyTypeLabel(property.property_type ?? '')} ·{' '}
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="hover:underline"
                          >
                            View public page
                          </Link>
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPrice(
                          Number(property.price),
                          property.transaction_type as 'sale' | 'rent' | 'short-let' | undefined
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(property.status)} className="capitalize">
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ToggleCell
                          apiPath={`/api/admin/properties/${property.id}`}
                          field="is_featured"
                          value={property.is_featured}
                          ariaLabel={`Toggle featured for ${property.title}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[140px]">
                        {location ? (
                          <span className="line-clamp-1">{location.name}, {location.city}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(property.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/properties/${property.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            apiPath={`/api/admin/properties/${property.id}`}
                            confirmText={`Delete "${property.title}"? This permanently removes the property, its images, favorites and linked inquiries.`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {result.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            buildPageUrl={buildPageUrl}
          />
        </div>
      )}
    </div>
  );
}
