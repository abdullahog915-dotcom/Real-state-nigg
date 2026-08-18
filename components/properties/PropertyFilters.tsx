'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  NIGERIAN_CITIES,
} from '@/lib/constants';

interface PropertyFiltersProps {
  locations?: { id: string; name: string; city: string }[];
  defaultTransactionType?: string;
}

export function PropertyFilters({ locations, defaultTransactionType = '' }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filter values from URL
  const currentType = searchParams.get('type') || defaultTransactionType;
  const currentPropertyType = searchParams.get('property_type') || '';
  const currentLocation = searchParams.get('location') || '';
  const currentKeyword = searchParams.get('q') || '';
  const currentBedrooms = searchParams.get('bedrooms') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Local state mirrors URL for immediate responsiveness
  const [keyword, setKeyword] = useState(currentKeyword);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const buildUrl = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams();

      const values: Record<string, string> = {
        type: currentType,
        property_type: currentPropertyType,
        location: currentLocation,
        q: currentKeyword,
        bedrooms: currentBedrooms,
        min_price: currentMinPrice,
        max_price: currentMaxPrice,
        sort: currentSort,
        ...overrides,
      };

      // Always reset page to 1 when filters change
      if (!('page' in overrides)) {
        // Don't carry page forward — filter changes should reset
      }

      for (const [key, value] of Object.entries(values)) {
        if (value && value !== 'newest') {
          params.set(key, value);
        }
      }

      // Keep sort in URL only if non-default
      if (values.sort && values.sort !== 'newest') {
        params.set('sort', values.sort);
      }

      const href = `/properties${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(href);
    },
    [
      router,
      currentType,
      currentPropertyType,
      currentLocation,
      currentKeyword,
      currentBedrooms,
      currentMinPrice,
      currentMaxPrice,
      currentSort,
    ]
  );

  function handleKeywordSubmit(e: React.FormEvent) {
    e.preventDefault();
    buildUrl({ q: keyword });
  }

  function handleClear() {
    setKeyword('');
    router.push('/properties');
  }

  const hasActiveFilters =
    currentType || currentPropertyType || currentLocation || currentBedrooms || currentMinPrice || currentMaxPrice || currentKeyword;

  return (
    <div className="space-y-4">
      {/* Primary filters row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Keyword search */}
        <form onSubmit={handleKeywordSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
          />
        </form>

        {/* Transaction type */}
        <Select
          value={currentType || '_all'}
          onValueChange={(v) => buildUrl({ type: v === '_all' ? '' : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Buy / Rent / Short Let" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Types</SelectItem>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Property type */}
        <Select
          value={currentPropertyType || '_all'}
          onValueChange={(v) => buildUrl({ property_type: v === '_all' ? '' : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Properties</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location */}
        <Select
          value={currentLocation || '_all'}
          onValueChange={(v) => buildUrl({ location: v === '_all' ? '' : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Locations</SelectItem>
            {(locations && locations.length > 0 ? locations : []).map((loc) => (
              <SelectItem key={loc.id} value={loc.name.toLowerCase()}>
                {loc.name}, {loc.city}
              </SelectItem>
            ))}
            {/* Fallback to NIGERIAN_CITIES if no DB locations */}
            {(!locations || locations.length === 0) &&
              NIGERIAN_CITIES.map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced filters toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-1 text-muted-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
          {showAdvanced ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Advanced filters (collapsible) */}
      {showAdvanced && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Bedrooms */}
          <Select
            value={currentBedrooms || '_any'}
            onValueChange={(v) => buildUrl({ bedrooms: v === '_any' ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_any">Any Bedrooms</SelectItem>
              {BEDROOM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Min Price */}
          <Input
            type="number"
            placeholder="Min Price (₦)"
            value={currentMinPrice}
            onChange={(e) => buildUrl({ min_price: e.target.value })}
            min={0}
          />

          {/* Max Price */}
          <Input
            type="number"
            placeholder="Max Price (₦)"
            value={currentMaxPrice}
            onChange={(e) => buildUrl({ max_price: e.target.value })}
            min={0}
          />

          {/* Sort */}
          <Select
            value={currentSort}
            onValueChange={(v) => buildUrl({ sort: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
