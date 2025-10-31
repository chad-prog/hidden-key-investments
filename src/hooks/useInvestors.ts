/**
 * useInvestors Hook
 * 
 * Custom hook for managing investor data fetching and state management
 * Provides CRUD operations and filtering for investors
 */

import { useState, useEffect } from 'react';
import type { Investor, InvestorCreate, InvestorUpdate } from '@/lib/schemas/crm';
import { isDemoMode } from '@/lib/envValidation';
import { createMockInvestor } from '@/lib/testFixtures';

interface UseInvestorsResult {
  investors: Investor[];
  isLoading: boolean;
  error: Error | null;
  getInvestor: (id: string) => Investor | undefined;
  createInvestor: (data: InvestorCreate) => Promise<Investor>;
  updateInvestor: (data: InvestorUpdate) => Promise<Investor>;
  deleteInvestor: (id: string) => Promise<void>;
  refreshInvestors: () => Promise<void>;
}

/**
 * Hook for managing investor data
 */
export function useInvestors(): UseInvestorsResult {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch investors on mount
  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode()) {
        // Demo mode: return mock data
        const mockInvestors = Array.from({ length: 5 }, (_, i) => 
          createMockInvestor({ 
            firstName: `Investor${i + 1}`,
            totalInvested: 100000 * (i + 1),
            activeDeals: i + 1,
            completedDeals: i * 2
          })
        );
        setInvestors(mockInvestors);
      } else {
        // Production mode: fetch from API
        const response = await fetch('/.netlify/functions/investor', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch investors: ${response.statusText}`);
        }

        const data = await response.json();
        setInvestors(data.investors || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch investors');
      setError(errorMessage);
      console.error('Error fetching investors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInvestor = (id: string): Investor | undefined => {
    return investors.find(inv => inv.id === id);
  };

  const createInvestor = async (data: InvestorCreate): Promise<Investor> => {
    if (isDemoMode()) {
      // Demo mode: create mock investor
      const newInvestor = createMockInvestor(data);
      setInvestors(prev => [...prev, newInvestor]);
      return newInvestor;
    }

    // Production mode: call API
    const response = await fetch('/.netlify/functions/investor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create investor: ${response.statusText}`);
    }

    const newInvestor = await response.json();
    setInvestors(prev => [...prev, newInvestor]);
    return newInvestor;
  };

  const updateInvestor = async (data: InvestorUpdate): Promise<Investor> => {
    if (isDemoMode()) {
      // Demo mode: update mock investor
      const updated = { ...getInvestor(data.id)!, ...data, updatedAt: new Date() } as Investor;
      setInvestors(prev => prev.map(inv => inv.id === data.id ? updated : inv));
      return updated;
    }

    // Production mode: call API
    const response = await fetch(`/.netlify/functions/investor?id=${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update investor: ${response.statusText}`);
    }

    const updatedInvestor = await response.json();
    setInvestors(prev => prev.map(inv => inv.id === data.id ? updatedInvestor : inv));
    return updatedInvestor;
  };

  const deleteInvestor = async (id: string): Promise<void> => {
    if (isDemoMode()) {
      // Demo mode: remove from state
      setInvestors(prev => prev.filter(inv => inv.id !== id));
      return;
    }

    // Production mode: call API
    const response = await fetch(`/.netlify/functions/investor?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete investor: ${response.statusText}`);
    }

    setInvestors(prev => prev.filter(inv => inv.id !== id));
  };

  const refreshInvestors = async (): Promise<void> => {
    await fetchInvestors();
  };

  return {
    investors,
    isLoading,
    error,
    getInvestor,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    refreshInvestors,
  };
}
