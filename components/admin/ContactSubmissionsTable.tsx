'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { StatusSelect } from '@/components/admin/StatusSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CONTACT_SUBMISSION_STATUSES } from '@/lib/admin-schemas';
import { formatDate } from '@/lib/utils';

export interface AdminContactSubmissionRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

/**
 * Admin contact submission list with inline status updates and a
 * detail dialog for the full message.
 */
export function ContactSubmissionsTable({ rows }: { rows: AdminContactSubmissionRow[] }) {
  const [selected, setSelected] = useState<AdminContactSubmissionRow | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-[200px]">
                <p className="line-clamp-1 font-medium">{row.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{row.email}</p>
              </TableCell>
              <TableCell className="max-w-[320px]">
                <p className="line-clamp-2 text-sm text-muted-foreground">{row.message}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell>
                <StatusSelect
                  apiPath={`/api/admin/contact-submissions/${row.id}`}
                  value={row.status}
                  options={[...CONTACT_SUBMISSION_STATUSES]}
                  ariaLabel={`Update status for message from ${row.name}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(row)}
                  aria-label={`View message from ${row.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={selected != null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
            <DialogDescription>
              Received {selected ? formatDate(selected.created_at) : ''}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <a href={`mailto:${selected.email}`} className="hover:underline">
                    {selected.email}
                  </a>
                </p>
                {selected.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {selected.phone}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Message
                </p>
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {selected.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
