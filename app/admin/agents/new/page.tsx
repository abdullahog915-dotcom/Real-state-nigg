import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AgentForm } from '@/components/admin/AgentForm';

export const metadata: Metadata = {
  title: 'Add Agent',
};

export default function NewAgentPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Agent"
        description="Create a new agent profile for the public agents directory."
      />
      <AgentForm mode="create" />
    </div>
  );
}
