'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export function ThemeControl({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={cn('h-8 rounded-md border bg-background', compact ? 'w-9' : 'w-[7.5rem]', className)}
        aria-hidden="true"
      />
    );
  }

  const activeTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <Select
      name="theme"
      value={activeTheme}
      onValueChange={(value) => setTheme(value === 'dark' ? 'dark' : 'light')}
    >
      <SelectTrigger
        size="sm"
        className={cn(compact ? 'w-9 justify-center px-2 [&>svg:last-child]:hidden' : 'w-[7.5rem]', className)}
        aria-label={`Theme preference: ${activeTheme}`}
        title="Theme preference"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="w-36">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <SelectItem key={value} value={value}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
