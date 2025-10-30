/**
 * Tests for InvestorDirectory Page
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import InvestorDirectory from '../InvestorDirectory';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('InvestorDirectory', () => {
  it('renders page header', () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    expect(screen.getByText('Investor Directory')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your investor relationships and track investments')
    ).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    const totalInvestedElements = screen.getAllByText('Total Invested');
    expect(totalInvestedElements.length).toBeGreaterThan(0);
    const activeInvestorsElements = screen.getAllByText('Active Investors');
    expect(activeInvestorsElements.length).toBeGreaterThan(0);
    const activeDealsElements = screen.getAllByText('Active Deals');
    expect(activeDealsElements.length).toBeGreaterThan(0);
  });

  it('renders search input', () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText('Search investors by name or email...')
    ).toBeInTheDocument();
  });

  it('displays demo mode notice', () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    expect(screen.getByText(/Demo Mode:/)).toBeInTheDocument();
  });

  it('renders investors in demo mode', async () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
    });
  });

  it('renders action buttons', () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add investor/i })).toBeInTheDocument();
  });

  it('displays investor stats correctly', async () => {
    render(
      <BrowserRouter>
        <InvestorDirectory />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for formatted currency and numbers
      expect(screen.getByText('Across all investors')).toBeInTheDocument();
      expect(screen.getByText('Ongoing investments')).toBeInTheDocument();
    });
  });
});
