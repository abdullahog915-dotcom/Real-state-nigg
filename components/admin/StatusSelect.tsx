'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StatusSelectProps {
  /** PATCH endpoint for the record, e.g. /api/admin/inquiries/<id> */
  apiPath: string;
  value: string;
  /** Allowed status values (validated from the database schema). */
  options: string[];
  ariaLabel?: string;
  className?: string;
}

/**
 * Inline status editor for admin lead lists. PATCHes the new status to
 * the record's API route and reports the result with a toast.
 */
export function StatusSelect({ apiPath, value, options, ariaLabel, className }: StatusSelectProps) {
  const [status, setStatus] = useState(value);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    if (next === status) return;
    const previous = status;
    setStatus(next);

    startTransition(async () => {
      try {
        const response = await fetch(apiPath, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Update failed');
        }

        toast.success('Status updated');
      } catch (error) {
        setStatus(previous);
        toast.error(error instanceof Error ? error.message : 'Update failed');
      }
    });
  };

  return (
    <Select name="status" value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel ?? 'Update status'}
        className={cn('w-36 capitalize', className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="capitalize">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
