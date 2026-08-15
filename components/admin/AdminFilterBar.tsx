'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL = '__all__';

interface AdminFilterBarProps {
  /** Route the filters apply to, e.g. /admin/properties */
  basePath: string;
  searchValue?: string;
  statusValue?: string;
  /** When provided, renders a status filter with these options. */
  statusOptions?: string[];
  searchPlaceholder?: string;
}

/**
 * Server-driven list filters for admin pages. Submits q/status as URL
 * search params; the server component re-queries on navigation.
 */
export function AdminFilterBar({
  basePath,
  searchValue,
  statusValue,
  statusOptions,
  searchPlaceholder = 'Search...',
}: AdminFilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchValue ?? '');

  const push = (nextSearch: string, nextStatus?: string) => {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set('q', nextSearch.trim());
    if (nextStatus && nextStatus !== ALL) params.set('status', nextStatus);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
      <form
        className="relative flex-1 sm:max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          push(search, statusValue);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label="Search"
        />
      </form>

      {statusOptions && (
        <Select
          value={statusValue ?? ALL}
          onValueChange={(value) => push(search, value)}
        >
          <SelectTrigger className="w-full sm:w-44 capitalize" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
