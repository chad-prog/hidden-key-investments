/**
 * LeadFilters Component
 * 
 * Advanced filtering component for leads with:
 * - Status filter
 * - Source filter
 * - Score range filter
 * - Date range filter
 * - Search by name/email
 */

import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface LeadFilterOptions {
  search?: string;
  status?: string;
  source?: string;
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

interface LeadFiltersProps {
  filters: LeadFilterOptions;
  onFilterChange: (filters: LeadFilterOptions) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'event', label: 'Event' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'partner', label: 'Partner' },
];

export default function LeadFilters({ filters, onFilterChange }: LeadFiltersProps) {
  const [localFilters, setLocalFilters] = useState<LeadFilterOptions>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (key: keyof LeadFilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LeadFilterOptions = {};
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof LeadFilterOptions] !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={localFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 h-5 min-w-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Advanced Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={localFilters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Source</Label>
                <Select
                  value={localFilters.source || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('source', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <Label className="text-xs">Lead Score Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={localFilters.scoreMin || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'scoreMin',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={localFilters.scoreMax || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'scoreMax',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs">Created Date Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {STATUS_OPTIONS.find((s) => s.value === localFilters.status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('status', undefined)}
              />
            </Badge>
          )}
          {localFilters.source && (
            <Badge variant="secondary" className="gap-1">
              Source: {SOURCE_OPTIONS.find((s) => s.value === localFilters.source)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('source', undefined)}
              />
            </Badge>
          )}
          {(localFilters.scoreMin !== undefined || localFilters.scoreMax !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Score: {localFilters.scoreMin || 0} - {localFilters.scoreMax || 100}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('scoreMin', undefined);
                  handleFilterChange('scoreMax', undefined);
                }}
              />
            </Badge>
          )}
          {(localFilters.dateFrom || localFilters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              Date: {localFilters.dateFrom || 'Start'} - {localFilters.dateTo || 'End'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('dateFrom', undefined);
                  handleFilterChange('dateTo', undefined);
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
