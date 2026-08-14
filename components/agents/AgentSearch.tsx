'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Compact keyword search for the agents listing page.
 * Drives the `?q=` URL parameter so results are shareable.
 * Filters agents by name only.
 */
export function AgentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    router.push(`/agents${qs ? `?${qs}` : ''}`);
  }

  function handleClear() {
    setValue('');
    router.push('/agents');
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full max-w-md gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search agents by name"
          aria-label="Search agents"
          className="pl-9"
        />
      </div>
      {value && (
        <Button type="button" variant="outline" size="icon" aria-label="Clear search" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button type="submit">Search</Button>
    </form>
  );
}
