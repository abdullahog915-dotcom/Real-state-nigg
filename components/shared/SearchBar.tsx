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
        className="w-full rounded-xl border bg-background p-4 shadow-lg"
      >
        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by keyword, address, or property name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="h-11 w-full">
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

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-11 w-full">
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

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-11 w-full">
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

          <Button type="submit" size="lg" className="w-full sm:w-auto">
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
