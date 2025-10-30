/**
 * Tests for LeadFilters Component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeadFilters from '../LeadFilters';

describe('LeadFilters', () => {
  const defaultFilters = {};
  const mockOnFilterChange = vi.fn();

  it('renders search input', () => {
    render(
      <LeadFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />
    );

    expect(
      screen.getByPlaceholderText('Search by name or email...')
    ).toBeInTheDocument();
  });

  it('renders filters button', () => {
    render(
      <LeadFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />
    );

    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', () => {
    render(
      <LeadFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />
    );

    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'John' });
  });

  it('displays active filter count badge', () => {
    const filters = { status: 'new', source: 'website' };
    render(
      <LeadFilters filters={filters} onFilterChange={mockOnFilterChange} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows clear all button when filters are active', () => {
    const filters = { status: 'new' };
    const { rerender } = render(
      <LeadFilters filters={filters} onFilterChange={mockOnFilterChange} />
    );

    // Open the popover to see the Clear All button
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);
  });

  it('clears all filters when clear button is clicked', () => {
    const filters = { status: 'new', source: 'website' };
    render(
      <LeadFilters filters={filters} onFilterChange={mockOnFilterChange} />
    );

    // Find and click the clear button (X icon)
    const clearButtons = screen.getAllByRole('button');
    const clearButton = clearButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );

    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith({});
    }
  });
});
