'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  NIGERIAN_CITIES,
} from '@/lib/constants';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
}

export function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (propertyType) params.set('property_type', propertyType);
    if (location) params.set('location', location);
    if (keyword) params.set('q', keyword);

    const transactionPath: Record<string, string> = {
      sale: '/properties/buy',
      rent: '/properties/rent',
      'short-let': '/properties/short-let',
    };
    const basePath = transactionPath[transactionType] || '/properties';
    const href = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(href);
  }

  if (variant === 'hero') {
    return (
      <form
        onSubmit={handleSearch}
        className="w-full rounded-xl border border-white/40 bg-white/85 p-2.5 shadow-xl shadow-black/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-white/10 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/75 sm:p-4 lg:rounded-2xl lg:p-3"
      >
        {/* Dedicated mobile stack, compact tablet rows, single desktop row. */}
        <div className="grid grid-cols-1 gap-1.5 sm:gap-3 lg:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(130px,0.8fr))_auto] lg:items-center lg:gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="home-search-keyword"
              name="q"
              type="text"
              placeholder="Search by keyword, address, or property name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-10 bg-white/95 pl-10 sm:h-11 dark:bg-zinc-950/90"
            />
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-3 lg:contents">
            <Select name="transaction_type" value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger id="home-search-transaction-type" aria-label="Transaction type" className="h-10 w-full bg-white/95 sm:h-11 dark:bg-zinc-950/90">
                <SelectValue placeholder="Buy / Rent / Short Let" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="property_type" value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="home-search-property-type" aria-label="Property type" className="h-10 w-full bg-white/95 sm:h-11 dark:bg-zinc-950/90">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.slice(0, 8).map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="location" value={location} onValueChange={setLocation}>
              <SelectTrigger id="home-search-location" aria-label="City or location" className="h-10 w-full bg-white/95 sm:h-11 dark:bg-zinc-950/90">
                <SelectValue placeholder="City / Location" />
              </SelectTrigger>
              <SelectContent>
                {NIGERIAN_CITIES.map((city) => (
                  <SelectItem key={city} value={city.toLowerCase()}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="h-10 w-full whitespace-nowrap sm:h-11 sm:w-auto lg:px-5">
            <Search className="h-4 w-4" />
            Search Properties
          </Button>
        </div>
      </form>
    );
  }

  // Compact variant
  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="compact-property-search"
          name="q"
          type="text"
          placeholder="Search properties..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" size="default">
        <Search className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Search</span>
      </Button>
    </form>
  );
}
