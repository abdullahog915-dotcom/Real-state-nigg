'use client';

import { useTransition } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/auth/actions';

interface SignOutButtonProps {
  /** Called before sign-out starts (e.g. to close the mobile menu). */
  onBeforeSignOut?: () => void;
  className?: string;
}

export function SignOutButton({ onBeforeSignOut, className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={isPending}
      onClick={() => {
        onBeforeSignOut?.();
        startTransition(() => signOut());
      }}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Sign Out
    </Button>
  );
}
