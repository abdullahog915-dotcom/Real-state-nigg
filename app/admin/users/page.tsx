import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
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
import { getAdminUsers } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Users',
};

function roleVariant(role: string | null): 'default' | 'secondary' | 'outline' {
  if (role === 'admin') return 'default';
  if (role === 'agent') return 'secondary';
  return 'outline';
}

/**
 * Read-only list of registered profiles. Role changes are intentionally
 * NOT exposed here — role is protected by the prevent_role_escalation
 * trigger (migration 018) and must be changed directly in the database.
 */
export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description={`${users.length} registered user${users.length === 1 ? '' : 's'}. This list is read-only — roles are managed directly in the database.`}
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Registered accounts will appear here once people sign up."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">{fullName || 'Unnamed user'}</span>
                        <p className="text-xs text-muted-foreground">
                          ID: {user.user_id ?? user.id}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {user.phone ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleVariant(user.role)} className="capitalize">
                          {user.role ?? 'customer'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(user.created_at)}
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
