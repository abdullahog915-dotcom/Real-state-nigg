import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AgentForm, type AgentFormValues } from '@/components/admin/AgentForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Button } from '@/components/ui/button';
import { getAdminAgentById } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Edit Agent',
};

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;

  const agent = await getAdminAgentById(id);
  if (!agent) {
    notFound();
  }

  const initialValues: Partial<AgentFormValues> = {
    name: agent.name ?? '',
    slug: agent.slug ?? '',
    email: agent.email ?? '',
    phone: agent.phone ?? '',
    whatsapp: agent.whatsapp ?? '',
    photo_url: agent.photo_url ?? '',
    bio: agent.bio ?? '',
    specialization: Array.isArray(agent.specialization)
      ? agent.specialization.join(', ')
      : '',
    locations: Array.isArray(agent.locations) ? agent.locations.join(', ') : '',
    is_active: Boolean(agent.is_active),
    display_order: String(agent.display_order ?? 0),
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit Agent"
        description={agent.name}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/agents/${agent.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" /> View Public Page
              </Link>
            </Button>
            <DeleteButton
              apiPath={`/api/admin/agents/${agent.id}`}
              confirmText={`Delete "${agent.name}"? Their assigned properties remain but become unassigned.`}
              label="Delete"
              redirectTo="/admin/agents"
            />
          </>
        }
      />
      <AgentForm mode="edit" agentId={agent.id} initialValues={initialValues} />
    </div>
  );
}
