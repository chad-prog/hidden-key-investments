/**
 * Email marketing integration with Mailchimp API
 * Handles subscriber management for different investor segments
 */

interface SubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  investorType?: 'accredited' | 'firstTime' | 'passive' | 'texas' | 'general';
  tags?: string[];
}

interface SubscribeResult {
  success: boolean;
  message: string;
  data?: any;
}

class EmailMarketingService {
  private _env = (import.meta as any).env || {};
  private apiKey = this._env.VITE_MAILCHIMP_API_KEY || 'demo-key';
  private serverPrefix = this._env.VITE_MAILCHIMP_SERVER_PREFIX || 'us8';
  private audienceIds = {
    accredited: this._env.VITE_MAILCHIMP_AUDIENCE_ACCREDITED || 'c662ef0af5',
    firstTime: this._env.VITE_MAILCHIMP_AUDIENCE_FIRST_TIME || 'cc891b6526',
    passive: this._env.VITE_MAILCHIMP_AUDIENCE_PASSIVE || '825140d12f',
    texas: this._env.VITE_MAILCHIMP_AUDIENCE_TEXAS || '0b1df5453e',
    general: this._env.VITE_MAILCHIMP_AUDIENCE_GENERAL || 'a47056c160'
  };

  /**
   * Subscribe user to Mailchimp audience
   */
  async subscribeUser(data: SubscribeData): Promise<SubscribeResult> {
    // Prefer server-side Netlify function for subscriptions
    try {
      const resp = await fetch('/.netlify/functions/mailchimp-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!resp.ok) {
        throw new Error('mailchimp server function error');
      }

      const json = await resp.json();
      if (json && json.demo) {
        return { success: true, message: 'Demo mode: serverless function simulated subscribe', data: json };
      }

      return { success: true, message: 'Subscription processed via serverless function', data: json };
    } catch (err) {
      console.warn('Serverless Mailchimp failed, falling back to client/demo mode', err);
      console.log('Demo mode: Would subscribe', data.email, 'to', data.investorType);
      return { success: true, message: 'Demo mode: fallback', data: null };
    }
  }

  /**
   * Get appropriate audience ID based on investor type
   */
  private getAudienceId(investorType?: string): string {
    switch (investorType) {
      case 'accredited':
        return this.audienceIds.accredited;
      case 'firstTime':
        return this.audienceIds.firstTime;
      case 'passive':
        return this.audienceIds.passive;
      case 'texas':
        return this.audienceIds.texas;
      default:
        return this.audienceIds.general;
    }
  }

  /**
   * Get subscriber count for dashboard (demo mode)
   */
  async getSubscriberCounts(): Promise<{ [key: string]: number }> {
    // Demo mode counts
    return {
      accredited: 124,
      firstTime: 89,
      passive: 67,
      texas: 156,
      general: 342,
      total: 778
    };
  }
}

// Create singleton instance
export const emailMarketing = new EmailMarketingService();

// React hook for email marketing
import { useState } from 'react';
export const useEmailMarketing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SubscribeResult | null>(null);

  const subscribe = async (data: SubscribeData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const result = await emailMarketing.subscribeUser(data);
      setResult(result);
      return result;
    } catch (error) {
      const errorResult: SubscribeResult = {
        success: false,
        message: 'Unexpected error occurred'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribe,
    isLoading,
    result
  };
};
