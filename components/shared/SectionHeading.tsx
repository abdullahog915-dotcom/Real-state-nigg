import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeading({
  title,
  subtitle,
  description,
  align = 'center',
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-8',
        align === 'center' && 'text-center',
        className
      )}
    >
      {subtitle && (
        <p className="text-sm font-medium uppercase tracking-wider text-primary mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
