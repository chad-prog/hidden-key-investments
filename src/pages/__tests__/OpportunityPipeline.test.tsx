/**
 * Tests for OpportunityPipeline Page
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import OpportunityPipeline from '../OpportunityPipeline';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OpportunityPipeline', () => {
  it('renders page header', () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    expect(screen.getByText('Opportunity Pipeline')).toBeInTheDocument();
    expect(
      screen.getByText('Track and manage investment opportunities through your sales funnel')
    ).toBeInTheDocument();
  });

  it('renders pipeline stats cards', () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
    expect(screen.getByText('Average Deal Size')).toBeInTheDocument();
    expect(screen.getByText('Active Investors')).toBeInTheDocument();
  });

  it('renders pipeline stages', async () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Qualified')).toBeInTheDocument();
      expect(screen.getByText('Proposal')).toBeInTheDocument();
      expect(screen.getByText('Negotiation')).toBeInTheDocument();
      expect(screen.getByText('Closing')).toBeInTheDocument();
      expect(screen.getByText('Closed Won')).toBeInTheDocument();
    });
  });

  it('displays demo mode notice', () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    expect(screen.getByText(/Demo Mode:/)).toBeInTheDocument();
  });

  it('renders opportunities in demo mode', async () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('123 Main Street Investment')).toBeInTheDocument();
      expect(screen.getByText('Downtown Commercial Property')).toBeInTheDocument();
    });
  });

  it('renders action buttons', () => {
    render(
      <BrowserRouter>
        <OpportunityPipeline />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new opportunity/i })).toBeInTheDocument();
  });
});
