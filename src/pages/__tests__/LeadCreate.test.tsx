/**
 * Tests for LeadCreate component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import LeadCreate from '../LeadCreate';

// Mock the router navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('LeadCreate', () => {
  it('renders the create lead form', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    expect(screen.getByText('Create New Lead')).toBeInTheDocument();
    expect(screen.getByText('Add a new lead to your CRM pipeline')).toBeInTheDocument();
    expect(screen.getByText('Lead Details')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Property Information (Optional)')).toBeInTheDocument();
  });

  it('displays form fields', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    // Check for input fields
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
  });

  it('allows filling in the form', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    const firstNameInput = screen.getByPlaceholderText('John');
    const emailInput = screen.getByPlaceholderText('john.doe@example.com');

    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(firstNameInput).toHaveValue('Test');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows cancel button', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('shows create button', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    const createButton = screen.getByRole('button', { name: /create lead/i });
    expect(createButton).toBeInTheDocument();
  });

  it('displays demo mode notice', () => {
    render(
      <BrowserRouter>
        <LeadCreate />
      </BrowserRouter>
    );

    expect(screen.getByText(/Demo Mode:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Lead will be created in demo mode only/)
    ).toBeInTheDocument();
  });
});
