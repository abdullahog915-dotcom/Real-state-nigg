import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { ToggleCell } from '@/components/admin/ToggleCell';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { getAdminLocations } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Locations',
};

interface AdminLocationsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminLocationsPage({ searchParams }: AdminLocationsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;

  const locations = await getAdminLocations(search);

  return (
    <div>
      <AdminPageHeader
        title="Locations"
        description={`${locations.length} location${locations.length === 1 ? '' : 's'} in total`}
        actions={
          <Button asChild>
            <Link href="/admin/locations/new">
              <Plus className="h-4 w-4" /> Add Location
            </Link>
          </Button>
        }
      />

      <AdminFilterBar
        basePath="/admin/locations"
        searchValue={search}
        searchPlaceholder="Search by name..."
      />

      {locations.length === 0 ? (
        <EmptyState
          title="No locations found"
          description={
            search ? 'Try adjusting your search.' : 'Create your first location to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>City / State</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const propertyCount = Array.isArray(location.properties)
                    ? location.properties.length
                    : 0;
                  return (
                    <TableRow key={location.id}>
                      <TableCell>
                        <Link
                          href={`/admin/locations/${location.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          {location.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {location.city}, {location.state}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{propertyCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <ToggleCell
                          apiPath={`/api/admin/locations/${location.id}`}
                          field="is_featured"
                          value={location.is_featured}
                          ariaLabel={`Toggle featured for ${location.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {location.display_order}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/locations/${location.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            apiPath={`/api/admin/locations/${location.id}`}
                            confirmText={`Delete "${location.name}"? Properties in this location remain but become unassigned.`}
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
    </div>
  );
}
