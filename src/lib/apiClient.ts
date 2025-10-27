/**
 * API Client Library
 * 
 * Type-safe API client for interacting with backend services
 * Handles authentication, error handling, and request/response transformation
 */

import type { Lead, LeadCreate, LeadUpdate, Opportunity, Investor, Activity } from './schemas/crm';

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  correlationId: string;
  metadata?: {
    durationMs?: number;
    page?: number;
    perPage?: number;
    total?: number;
  };
}

export interface ApiClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  source?: string;
  assignedTo?: string;
  tags?: string[];
  search?: string;
}

// ============================================================================
// API Client
// ============================================================================

export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/.netlify/functions',
      apiKey: config.apiKey || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      onError: config.onError || (() => {}),
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok && retryCount < this.config.retries) {
        // Retry on server errors
        if (response.status >= 500) {
          await this.delay(Math.pow(2, retryCount) * 1000);
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }

      return data as ApiResponse<T>;

    } catch (error) {
      clearTimeout(timeoutId);

      if (retryCount < this.config.retries) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      this.config.onError(error as Error);

      return {
        ok: false,
        error: {
          code: 'ERR_NETWORK',
          message: error instanceof Error ? error.message : 'Network error',
        },
        correlationId: 'unknown',
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  // ==========================================================================
  // Leads API
  // ==========================================================================

  async createLead(data: LeadCreate): Promise<ApiResponse<{ leadId: string }>> {
    return this.request('/lead-ingest-enhanced', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLead(leadId: string): Promise<ApiResponse<Lead>> {
    return this.request(`/leads/${leadId}`);
  }

  async updateLead(leadId: string, data: Partial<LeadUpdate>): Promise<ApiResponse<Lead>> {
    return this.request(`/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listLeads(params?: FilterParams & PaginationParams): Promise<ApiResponse<Lead[]>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/leads${query}`);
  }

  async deleteLead(leadId: string): Promise<ApiResponse<void>> {
    return this.request(`/leads/${leadId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Opportunities API
  // ==========================================================================

  async createOpportunity(data: Partial<Opportunity>): Promise<ApiResponse<{ opportunityId: string }>> {
    return this.request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOpportunity(opportunityId: string): Promise<ApiResponse<Opportunity>> {
    return this.request(`/opportunities/${opportunityId}`);
  }

  async updateOpportunity(opportunityId: string, data: Partial<Opportunity>): Promise<ApiResponse<Opportunity>> {
    return this.request(`/opportunities/${opportunityId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listOpportunities(params?: FilterParams & PaginationParams): Promise<ApiResponse<Opportunity[]>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/opportunities${query}`);
  }

  // ==========================================================================
  // Investors API
  // ==========================================================================

  async createInvestor(data: Partial<Investor>): Promise<ApiResponse<{ investorId: string }>> {
    return this.request('/investors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvestor(investorId: string): Promise<ApiResponse<Investor>> {
    return this.request(`/investors/${investorId}`);
  }

  async updateInvestor(investorId: string, data: Partial<Investor>): Promise<ApiResponse<Investor>> {
    return this.request(`/investors/${investorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listInvestors(params?: FilterParams & PaginationParams): Promise<ApiResponse<Investor[]>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/investors${query}`);
  }

  // ==========================================================================
  // Activities API
  // ==========================================================================

  async createActivity(data: Partial<Activity>): Promise<ApiResponse<{ activityId: string }>> {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActivity(activityId: string): Promise<ApiResponse<Activity>> {
    return this.request(`/activities/${activityId}`);
  }

  async listActivities(params?: {
    leadId?: string;
    opportunityId?: string;
    investorId?: string;
  } & PaginationParams): Promise<ApiResponse<Activity[]>> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request(`/activities${query}`);
  }

  // ==========================================================================
  // Workflows API
  // ==========================================================================

  async triggerWorkflow(workflowId: string, payload: any): Promise<ApiResponse<{ executionId: string }>> {
    return this.request(`/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getWorkflowExecution(executionId: string): Promise<ApiResponse<any>> {
    return this.request(`/workflow-executions/${executionId}`);
  }

  // ==========================================================================
  // Analytics API
  // ==========================================================================

  async trackEvent(eventName: string, properties: any): Promise<ApiResponse<void>> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventName, properties }),
    });
  }

  // ==========================================================================
  // ML Scoring API
  // ==========================================================================

  async scoreLead(leadId: string): Promise<ApiResponse<{ score: number; reasons: string[] }>> {
    return this.request('/ml-score', {
      method: 'POST',
      body: JSON.stringify({ leadId }),
    });
  }
}

// ============================================================================
// React Hooks
// ============================================================================

import { useState, useEffect } from 'react';

/**
 * Hook for fetching data with loading and error states
 */
export function useApiData<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      if (response.ok && response.data) {
        setData(response.data);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for mutations with loading and error states
 */
export function useApiMutation<T, P = any>(
  mutator: (payload: P) => Promise<ApiResponse<T>>
): {
  mutate: (payload: P) => Promise<T | null>;
  data: T | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (payload: P): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutator(payload);
      if (response.ok && response.data) {
        setData(response.data);
        return response.data;
      } else if (response.error) {
        setError(response.error.message);
        return null;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { mutate, data, loading, error, reset };
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const apiClient = new ApiClient();

// Export configured hooks
export function useLeads(params?: FilterParams & PaginationParams) {
  return useApiData(() => apiClient.listLeads(params), [JSON.stringify(params)]);
}

export function useLead(leadId: string) {
  return useApiData(() => apiClient.getLead(leadId), [leadId]);
}

export function useCreateLead() {
  return useApiMutation((data: LeadCreate) => apiClient.createLead(data));
}

export function useUpdateLead(leadId: string) {
  return useApiMutation((data: Partial<LeadUpdate>) => apiClient.updateLead(leadId, data));
}
