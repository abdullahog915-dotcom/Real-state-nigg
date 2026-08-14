import { cn } from '@/lib/utils';
import { Home, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'home' | 'search';
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = 'home',
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : Home;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
