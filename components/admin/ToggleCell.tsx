'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface ToggleCellProps {
  /** PATCH endpoint for the record. */
  apiPath: string;
  /** Boolean column to toggle, e.g. is_active or is_featured. */
  field: string;
  value: boolean;
  ariaLabel: string;
}

/**
 * Inline boolean toggle for admin tables (agent is_active,
 * location is_featured, property is_featured). PATCHes the flipped
 * value and refreshes server data on success.
 */
export function ToggleCell({ apiPath, field, value, ariaLabel }: ToggleCellProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(value);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (next: boolean) => {
    const previous = checked;
    setChecked(next);

    startTransition(async () => {
      try {
        const response = await fetch(apiPath, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: next }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Update failed');
        }

        toast.success('Saved');
        router.refresh();
      } catch (error) {
        setChecked(previous);
        toast.error(error instanceof Error ? error.message : 'Update failed');
      }
    });
  };

  return (
    <Switch
      checked={checked}
      disabled={isPending}
      onCheckedChange={handleToggle}
      aria-label={ariaLabel}
    />
  );
}
