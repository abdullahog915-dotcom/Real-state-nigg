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
import { getAdminAgents } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Agents',
};

interface AdminAgentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminAgentsPage({ searchParams }: AdminAgentsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;

  const agents = await getAdminAgents(search);

  return (
    <div>
      <AdminPageHeader
        title="Agents"
        description={`${agents.length} agent${agents.length === 1 ? '' : 's'} in total`}
        actions={
          <Button asChild>
            <Link href="/admin/agents/new">
              <Plus className="h-4 w-4" /> Add Agent
            </Link>
          </Button>
        }
      />

      <AdminFilterBar
        basePath="/admin/agents"
        searchValue={search}
        searchPlaceholder="Search by name..."
      />

      {agents.length === 0 ? (
        <EmptyState
          title="No agents found"
          description={
            search
              ? 'Try adjusting your search.'
              : 'Create your first agent to start assigning listings.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => {
                  const propertyCount = Array.isArray(agent.properties)
                    ? agent.properties.length
                    : 0;
                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="max-w-[220px]">
                        <Link
                          href={`/admin/agents/${agent.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          <span className="line-clamp-1">{agent.name}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          <Link
                            href={`/agents/${agent.slug}`}
                            target="_blank"
                            className="hover:underline"
                          >
                            View public page
                          </Link>
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-sm">
                        {agent.email && <p className="line-clamp-1">{agent.email}</p>}
                        {agent.phone && (
                          <p className="text-muted-foreground">{agent.phone}</p>
                        )}
                        {!agent.email && !agent.phone && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{propertyCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <ToggleCell
                          apiPath={`/api/admin/agents/${agent.id}`}
                          field="is_active"
                          value={agent.is_active}
                          ariaLabel={`Toggle active for ${agent.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {agent.display_order}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(agent.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/agents/${agent.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            apiPath={`/api/admin/agents/${agent.id}`}
                            confirmText={`Delete "${agent.name}"? Their assigned properties remain but become unassigned.`}
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
