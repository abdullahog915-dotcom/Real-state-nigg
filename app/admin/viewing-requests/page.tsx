import type { Metadata } from 'next';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  ViewingRequestsTable,
  type AdminViewingRequestRow,
} from '@/components/admin/ViewingRequestsTable';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { VIEWING_REQUEST_STATUSES } from '@/lib/admin-schemas';
import { getAdminViewingRequests } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Viewing Requests',
};

interface AdminViewingRequestsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminViewingRequestsPage({
  searchParams,
}: AdminViewingRequestsPageProps) {
  const params = await searchParams;

  const status = (VIEWING_REQUEST_STATUSES as readonly string[]).includes(params.status ?? '')
    ? params.status
    : undefined;

  const requests = await getAdminViewingRequests(status);

  const rows: AdminViewingRequestRow[] = requests.map((request) => {
    const property = Array.isArray(request.properties)
      ? request.properties[0]
      : request.properties;
    const agent = Array.isArray(request.agents) ? request.agents[0] : request.agents;
    return {
      id: request.id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      preferred_date: request.preferred_date,
      preferred_time: request.preferred_time,
      message: request.message ?? null,
      status: request.status ?? 'requested',
      notes: request.notes ?? null,
      created_at: request.created_at,
      propertyTitle: property?.title ?? null,
      propertySlug: property?.slug ?? null,
      agentName: agent?.name ?? null,
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Viewing Requests"
        description="Property viewing appointments requested through the website."
      />

      <AdminFilterBar
        basePath="/admin/viewing-requests"
        statusValue={status}
        statusOptions={[...VIEWING_REQUEST_STATUSES]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="search"
          title="No viewing requests found"
          description={
            status
              ? 'No viewing requests with this status yet.'
              : 'No viewing requests have been submitted yet.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ViewingRequestsTable rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
