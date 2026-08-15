'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { statusVariant } from '@/lib/admin-schemas';
import { StatusSelect } from '@/components/admin/StatusSelect';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { INQUIRY_STATUSES } from '@/lib/admin-schemas';
import { formatDate } from '@/lib/utils';

export interface AdminInquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  propertyTitle: string | null;
  propertySlug: string | null;
  agentName: string | null;
}

/**
 * Admin inquiry list with inline status updates and a detail dialog
 * for the full message and internal notes.
 */
export function InquiriesTable({ rows }: { rows: AdminInquiryRow[] }) {
  const [selected, setSelected] = useState<AdminInquiryRow | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const openDetails = (row: AdminInquiryRow) => {
    setSelected(row);
    setNotes(row.notes ?? '');
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Update failed');
      }

      toast.success('Notes saved');
      setSelected({ ...selected, notes: notes || null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Source</TableHead>
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
              <TableCell className="max-w-[200px]">
                {row.propertySlug ? (
                  <Link
                    href={`/properties/${row.propertySlug}`}
                    target="_blank"
                    className="line-clamp-1 text-sm hover:underline"
                  >
                    {row.propertyTitle}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{row.source ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell>
                <StatusSelect
                  apiPath={`/api/admin/inquiries/${row.id}`}
                  value={row.status}
                  options={[...INQUIRY_STATUSES]}
                  ariaLabel={`Update status for inquiry from ${row.name}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetails(row)}
                  aria-label={`View inquiry from ${row.name}`}
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
            <DialogTitle>Inquiry from {selected?.name}</DialogTitle>
            <DialogDescription>
              Received {selected ? formatDate(selected.created_at) : ''}
              {selected?.source ? ` via ${selected.source}` : ''}
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
                {selected.agentName && (
                  <p>
                    <span className="text-muted-foreground">Assigned agent:</span>{' '}
                    {selected.agentName}
                  </p>
                )}
                {selected.propertyTitle && (
                  <p>
                    <span className="text-muted-foreground">Property:</span>{' '}
                    {selected.propertySlug ? (
                      <Link
                        href={`/properties/${selected.propertySlug}`}
                        target="_blank"
                        className="hover:underline"
                      >
                        {selected.propertyTitle}
                      </Link>
                    ) : (
                      selected.propertyTitle
                    )}
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

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Internal notes
                </p>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Notes are only visible to admins and agents."
                />
                <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Notes
                </Button>
              </div>

              <div className="flex items-center gap-2 border-t pt-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={statusVariant(selected.status)} className="capitalize">
                  {selected.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (change it from the list view)
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
