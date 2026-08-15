import type { Metadata } from 'next';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { InquiriesTable, type AdminInquiryRow } from '@/components/admin/InquiriesTable';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { INQUIRY_STATUSES } from '@/lib/admin-schemas';
import { getAdminInquiries } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Inquiries',
};

interface AdminInquiriesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: AdminInquiriesPageProps) {
  const params = await searchParams;

  const status = (INQUIRY_STATUSES as readonly string[]).includes(params.status ?? '')
    ? params.status
    : undefined;

  const inquiries = await getAdminInquiries(status);

  const rows: AdminInquiryRow[] = inquiries.map((inquiry) => {
    const property = Array.isArray(inquiry.properties)
      ? inquiry.properties[0]
      : inquiry.properties;
    const agent = Array.isArray(inquiry.agents) ? inquiry.agents[0] : inquiry.agents;
    return {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? null,
      message: inquiry.message,
      source: inquiry.source ?? null,
      status: inquiry.status ?? 'new',
      notes: inquiry.notes ?? null,
      created_at: inquiry.created_at,
      propertyTitle: property?.title ?? null,
      propertySlug: property?.slug ?? null,
      agentName: agent?.name ?? null,
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Inquiries"
        description="Property inquiries submitted through the website. Inquiries are never deleted — use statuses to track the pipeline."
      />

      <AdminFilterBar
        basePath="/admin/inquiries"
        statusValue={status}
        statusOptions={[...INQUIRY_STATUSES]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="search"
          title="No inquiries found"
          description={
            status ? 'No inquiries with this status yet.' : 'No inquiries have been submitted yet.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <InquiriesTable rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
