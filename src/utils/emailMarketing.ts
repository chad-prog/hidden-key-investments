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
  private apiKey = import.meta.env.VITE_MAILCHIMP_API_KEY || '';
  private serverPrefix = import.meta.env.VITE_MAILCHIMP_SERVER_PREFIX || '';
  private audienceIds = {
    accredited: import.meta.env.VITE_MAILCHIMP_AUDIENCE_ACCREDITED || '',
    firstTime: import.meta.env.VITE_MAILCHIMP_AUDIENCE_FIRST_TIME || '',
    passive: import.meta.env.VITE_MAILCHIMP_AUDIENCE_PASSIVE || '',
    texas: import.meta.env.VITE_MAILCHIMP_AUDIENCE_TEXAS || '',
    general: import.meta.env.VITE_MAILCHIMP_AUDIENCE_GENERAL || ''
  };

  /**
   * Subscribe user to Mailchimp audience
   */
  async subscribeUser(data: SubscribeData): Promise<SubscribeResult> {
    // If no API key is set, return demo mode
    if (!this.apiKey || !this.serverPrefix) {
      console.log('Demo mode: Would subscribe', data.email, 'to', data.investorType);
      return {
        success: true,
        message: 'Demo mode: Subscription would be processed with real API key'
      };
    }

    try {
      const audienceId = this.getAudienceId(data.investorType);
      const url = `https://${this.serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

      const subscriberData = {
        email_address: data.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: data.firstName || '',
          LNAME: data.lastName || '',
          INVESTORTYPE: data.investorType || 'general'
        },
        tags: data.tags || ['Website Signup']
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`anystring:${this.apiKey}`)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberData)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully subscribed to investor updates',
          data: await response.json()
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.detail || 'Subscription failed'
        };
      }
    } catch (error) {
      console.error('Mailchimp subscription error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
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
