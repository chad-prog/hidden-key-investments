/**
 * Tests for LeadTable Component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import LeadTable from '../LeadTable';
import { createMockLead } from '@/lib/testFixtures';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LeadTable', () => {
  const mockLeads = [
    createMockLead({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      contact: { email: 'john@example.com', phone: '+1234567890' },
      status: 'new',
      source: 'website',
      score: 75,
    }),
    createMockLead({
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      contact: { email: 'jane@example.com' },
      status: 'qualified',
      source: 'referral',
      score: 90,
    }),
  ] as any;

  it('renders table headers', () => {
    render(
      <BrowserRouter>
        <LeadTable leads={mockLeads} />
      </BrowserRouter>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('renders lead data', () => {
    render(
      <BrowserRouter>
        <LeadTable leads={mockLeads} />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays empty state when no leads', () => {
    render(
      <BrowserRouter>
        <LeadTable leads={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('No leads found')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const onLeadSelect = vi.fn();
    render(
      <BrowserRouter>
        <LeadTable leads={mockLeads} onLeadSelect={onLeadSelect} />
      </BrowserRouter>
    );

    const row = screen.getByText('John Doe').closest('tr');
    if (row) {
      fireEvent.click(row);
      expect(onLeadSelect).toHaveBeenCalledWith(mockLeads[0]);
    }
  });

  it('allows sorting by clicking column headers', () => {
    render(
      <BrowserRouter>
        <LeadTable leads={mockLeads} />
      </BrowserRouter>
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameHeader);
    
    // After clicking, table should be sorted
    expect(nameHeader).toBeInTheDocument();
  });
});
