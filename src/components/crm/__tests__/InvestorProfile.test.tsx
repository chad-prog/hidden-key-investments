/**
 * InvestorProfile Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvestorProfile } from '../InvestorProfile';
import { createMockInvestor } from '@/lib/testFixtures';
import { BrowserRouter } from 'react-router';

describe('InvestorProfile', () => {
  it('renders investor name correctly', () => {
    const investor = createMockInvestor({
      firstName: 'John',
      lastName: 'Doe',
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays company name when available', () => {
    const investor = createMockInvestor({
      companyName: 'Acme Investments',
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    // Company name appears in heading
    expect(screen.getByRole('heading', { name: 'Acme Investments' })).toBeInTheDocument();
  });

  it('shows contact information', () => {
    const investor = createMockInvestor({
      contact: {
        email: 'test@example.com',
        phone: '+1234567890',
        preferredContact: 'email',
        doNotContact: false,
      },
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('displays investor status badge', () => {
    const investor = createMockInvestor({
      status: 'active',
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows accreditation status when accredited', () => {
    const investor = createMockInvestor({
      accreditation: {
        isAccredited: true,
        verifiedAt: new Date(),
      },
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('Accredited')).toBeInTheDocument();
  });

  it('displays tags when available', () => {
    const investor = createMockInvestor({
      tags: ['VIP', 'High Net Worth'],
    });

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('High Net Worth')).toBeInTheDocument();
  });

  it('shows portfolio and history tabs', () => {
    const investor = createMockInvestor();

    render(
      <BrowserRouter>
        <InvestorProfile investor={investor} />
      </BrowserRouter>
    );

    expect(screen.getByRole('tab', { name: /portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /investment history/i })).toBeInTheDocument();
  });
});
