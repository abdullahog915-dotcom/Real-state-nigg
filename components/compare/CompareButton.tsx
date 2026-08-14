'use client';

import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompare } from '@/hooks/useCompare';

interface CompareButtonProps {
  slug: string;
  title: string;
  /** card = compact overlay pill; detail = full-width sidebar button */
  variant?: 'card' | 'detail';
  className?: string;
}

/**
 * Add-to-compare toggle for a single property.
 * Disabled (with explanation) when the maximum selection is reached.
 */
export function CompareButton({ slug, title, variant = 'card', className }: CompareButtonProps) {
  const { isInCompare, isFull, toggle } = useCompare();

  const selected = isInCompare(slug);
  const disabled = !selected && isFull;

  const label = selected
    ? variant === 'detail' ? 'Remove from Compare' : 'Added'
    : variant === 'detail' ? 'Add to Compare' : 'Compare';

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // Prevent the surrounding property link from navigating
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) toggle(slug);
  }

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${title} from comparison` : `Add ${title} to comparison`}
        title={disabled ? `You can compare up to 3 properties` : undefined}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          selected && 'border-primary text-primary',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <Scale className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${title} from comparison` : `Add ${title} to comparison`}
      title={disabled ? 'You can compare up to 3 properties' : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-background/95 text-foreground hover:bg-background',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <Scale className="h-3.5 w-3.5" aria-hidden="true" />
      {selected ? 'Added' : 'Compare'}
    </button>
  );
}
