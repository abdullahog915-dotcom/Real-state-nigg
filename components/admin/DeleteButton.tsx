'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface DeleteButtonProps {
  /** DELETE endpoint for the record. */
  apiPath: string;
  /** Confirmation prompt shown before deleting. */
  confirmText: string;
  /** When set, navigate here after success; otherwise refresh the page. */
  redirectTo?: string;
  /** Button label (icon is always shown). */
  label?: string;
  variant?: 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
}

/**
 * Generic admin delete action. Confirms with the user, sends DELETE to the
 * record API route, and reports the outcome with a toast.
 */
export function DeleteButton({
  apiPath,
  confirmText,
  redirectTo,
  label,
  variant = 'outline',
  size = 'sm',
}: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(confirmText)) return;

    startTransition(async () => {
      try {
        const response = await fetch(apiPath, { method: 'DELETE' });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Delete failed');
        }

        toast.success('Deleted');
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Delete failed');
      }
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleDelete}
      className={variant !== 'destructive' ? 'text-destructive hover:text-destructive' : undefined}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {label}
    </Button>
  );
}
