/**
 * InvestorCard Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvestorCard } from '../InvestorCard';
import { createMockInvestor } from '@/lib/testFixtures';
import { BrowserRouter } from 'react-router';

describe('InvestorCard', () => {
  it('renders investor name', () => {
    const investor = createMockInvestor({
      firstName: 'Jane',
      lastName: 'Smith',
    });

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays total invested amount', () => {
    const investor = createMockInvestor({
      totalInvested: 500000,
    });

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('$500K')).toBeInTheDocument();
  });

  it('shows active deals count', () => {
    const investor = createMockInvestor({
      activeDeals: 5,
    });

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays accreditation status', () => {
    const investor = createMockInvestor({
      accreditation: {
        isAccredited: true,
      },
    });

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('Accredited Investor')).toBeInTheDocument();
  });

  it('calls onSelect when select button is clicked', () => {
    const investor = createMockInvestor();
    const onSelect = vi.fn();

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} onSelect={onSelect} />
      </BrowserRouter>
    );

    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith(investor);
  });

  it('does not show select button when onSelect is not provided', () => {
    const investor = createMockInvestor();

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
  });

  it('displays contact information', () => {
    const investor = createMockInvestor({
      contact: {
        email: 'investor@test.com',
        phone: '+1555123456',
        preferredContact: 'email',
        doNotContact: false,
      },
    });

    render(
      <BrowserRouter>
        <InvestorCard investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('investor@test.com')).toBeInTheDocument();
    expect(screen.getByText('+1555123456')).toBeInTheDocument();
  });
});
