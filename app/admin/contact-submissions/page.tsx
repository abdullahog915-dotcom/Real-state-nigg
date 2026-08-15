import type { Metadata } from 'next';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  ContactSubmissionsTable,
  type AdminContactSubmissionRow,
} from '@/components/admin/ContactSubmissionsTable';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { CONTACT_SUBMISSION_STATUSES } from '@/lib/admin-schemas';
import { getAdminContactSubmissions } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Contact Submissions',
};

interface AdminContactSubmissionsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminContactSubmissionsPage({
  searchParams,
}: AdminContactSubmissionsPageProps) {
  const params = await searchParams;

  const status = (CONTACT_SUBMISSION_STATUSES as readonly string[]).includes(params.status ?? '')
    ? params.status
    : undefined;

  const submissions = await getAdminContactSubmissions(status);

  const rows: AdminContactSubmissionRow[] = submissions.map((submission) => ({
    id: submission.id,
    name: submission.name,
    email: submission.email,
    phone: submission.phone ?? null,
    message: submission.message,
    status: submission.status ?? 'new',
    created_at: submission.created_at,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Contact Submissions"
        description="Messages submitted through the general contact form."
      />

      <AdminFilterBar
        basePath="/admin/contact-submissions"
        statusValue={status}
        statusOptions={[...CONTACT_SUBMISSION_STATUSES]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="search"
          title="No contact messages found"
          description={
            status
              ? 'No contact messages with this status yet.'
              : 'No contact messages have been submitted yet.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ContactSubmissionsTable rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
