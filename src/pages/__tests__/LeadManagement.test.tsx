/**
 * Tests for LeadManagement component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import LeadManagement from '../LeadManagement';

// Mock the router navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LeadManagement', () => {
  it('renders the dashboard header', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByText('Lead Management')).toBeInTheDocument();
    expect(
      screen.getByText('Manage and track your real estate investment leads')
    ).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /view all leads/i })).toBeInTheDocument();
    const newLeadButtons = screen.getAllByRole('button', { name: /new lead/i });
    expect(newLeadButtons.length).toBeGreaterThan(0);
  });

  it('displays stat cards', async () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Leads')).toBeInTheDocument();
      expect(screen.getByText('New Leads')).toBeInTheDocument();
      const qualifiedElements = screen.getAllByText('Qualified');
      expect(qualifiedElements.length).toBeGreaterThan(0);
      const convertedElements = screen.getAllByText('Converted');
      expect(convertedElements.length).toBeGreaterThan(0);
    });
  });

  it('displays quick actions section', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Common tasks and workflows')).toBeInTheDocument();
    expect(screen.getByText('Add New Lead')).toBeInTheDocument();
    expect(screen.getByText('Filter & Search')).toBeInTheDocument();
    expect(screen.getByText('View Reports')).toBeInTheDocument();
  });

  it('displays performance metrics', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByText('Lead Performance')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Health')).toBeInTheDocument();
  });

  it('displays recent leads section', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByText('Recent Leads')).toBeInTheDocument();
    expect(screen.getByText('Latest leads added to the system')).toBeInTheDocument();
  });

  it('shows demo mode notice', () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    expect(screen.getByText(/Demo Mode:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Showing mock data. Connect to a real database/)
    ).toBeInTheDocument();
  });

  it('displays recent leads after loading', async () => {
    render(
      <BrowserRouter>
        <LeadManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show some lead data
      const leads = screen.getAllByText('John Doe');
      expect(leads.length).toBeGreaterThan(0);
    });
  });
});
