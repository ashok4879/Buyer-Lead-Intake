'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  CitySchema,
  PropertyTypeSchema,
  BHKSchema,
  PurposeSchema,
  TimelineSchema,
  SourceSchema,
  StatusSchema,
} from '@/lib/validations/buyer';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BuyerFiltersProps {
  search?: string;
  city?: string;
  propertyType?: string;
  bhk?: string;
  purpose?: string;
  timeline?: string;
  source?: string;
  status?: string;
  minBudget?: string;
  maxBudget?: string;
}

export function BuyerFilters({
  search = '',
  city,
  propertyType,
  bhk,
  purpose,
  timeline,
  source,
  status,
  minBudget,
  maxBudget,
}: BuyerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState({
    search,
    city,
    propertyType,
    bhk,
    purpose,
    timeline,
    source,
    status,
    minBudget,
    maxBudget,
  });

  useEffect(() => {
    setFilters({
      search,
      city,
      propertyType,
      bhk,
      purpose,
      timeline,
      source,
      status,
      minBudget,
      maxBudget,
    });
  }, [
    search,
    city,
    propertyType,
    bhk,
    purpose,
    timeline,
    source,
    status,
    minBudget,
    maxBudget,
  ]);

  const handleChange = (name: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    params.set('page', '1'); // reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      city: undefined,
      propertyType: undefined,
      bhk: undefined,
      purpose: undefined,
      timeline: undefined,
      source: undefined,
      status: undefined,
      minBudget: undefined,
      maxBudget: undefined,
    });
    router.push(pathname);
  };

  const renderSelect = (
  label: string,
  value: string | undefined,
  schema: any,
  name: string,
  placeholder: string
) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    <Select
      value={value}
      onValueChange={(val) => handleChange(name, val || undefined)}
    >
      <SelectTrigger id={name} className="mt-1">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.values(schema.enum).map((item) => {
          const val = item as string; // ← cast unknown → string
          return (
            <SelectItem key={val} value={val}>
              {val.replace('_', ' ')}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  </div>
);


  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-4">
      <h2 className="text-lg font-semibold mb-2">Filters</h2>

      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name, email, phone..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="minBudget">Min Budget</Label>
          <Input
            id="minBudget"
            type="number"
            placeholder="Min"
            value={filters.minBudget || ''}
            onChange={(e) => handleChange('minBudget', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxBudget">Max Budget</Label>
          <Input
            id="maxBudget"
            type="number"
            placeholder="Max"
            value={filters.maxBudget || ''}
            onChange={(e) => handleChange('maxBudget', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {renderSelect('City', filters.city, CitySchema, 'city', 'All Cities')}
      {renderSelect('Property Type', filters.propertyType, PropertyTypeSchema, 'propertyType', 'All Types')}
      {renderSelect('BHK', filters.bhk, BHKSchema, 'bhk', 'All BHKs')}
      {renderSelect('Purpose', filters.purpose, PurposeSchema, 'purpose', 'All Purposes')}
      {renderSelect('Timeline', filters.timeline, TimelineSchema, 'timeline', 'All Timelines')}
      {renderSelect('Source', filters.source, SourceSchema, 'source', 'All Sources')}
      {renderSelect('Status', filters.status, StatusSchema, 'status', 'All Statuses')}

      <div className="flex space-x-2 pt-2">
        <Button variant="outline" onClick={resetFilters} className="flex-1">
          Reset
        </Button>
        <Button onClick={applyFilters} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
}
