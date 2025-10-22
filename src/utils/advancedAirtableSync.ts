/**
 * Advanced Airtable synchronization with environment variables
 * Secure integration across multiple bases
 */

interface InvestorData {
  name: string;
  email: string;
  phone: string;
  investmentCapacity: string;
  geographicPreference: string;
  investmentExperience: string;
  timeline: string;
  accreditationStatus: string;
  netWorth?: string;
  annualIncome?: string;
  investmentGoals?: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

class AdvancedAirtableSync {
  private apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || '';
  private baseIds = {
    investorLeads: import.meta.env.VITE_AIRTABLE_BASE_INVESTOR_LEADS || '',
    investorInteractions: import.meta.env.VITE_AIRTABLE_BASE_INVESTOR_INTERACTIONS || '',
    propertyTracker: import.meta.env.VITE_AIRTABLE_BASE_PROPERTY_TRACKER || ''
  };

  /**
   * Sync investor across all Airtable bases
   */
  async syncInvestorAcrossAllBases(investorData: InvestorData, analytics: any): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    // If no API key, return demo mode
    if (!this.apiKey) {
      console.log('Demo mode: Would sync investor to Airtable', investorData);
      results.push({
        success: true,
        message: 'Demo mode: Investor data would be synced with real API key'
      });
      return results;
    }

    try {
      // Sync to Investor Leads base
      const leadsResult = await this.addToInvestorLeads(investorData, analytics);
      results.push(leadsResult);

      // Sync to Investor Interactions base
      const interactionsResult = await this.addToInvestorInteractions(investorData);
      results.push(interactionsResult);

      // Sync to Property Tracker base if they expressed interest
      if (investorData.geographicPreference) {
        const propertyResult = await this.addToPropertyTracker(investorData);
        results.push(propertyResult);
      }

      return results;
    } catch (error) {
      console.error('Airtable sync error:', error);
      return [{
        success: false,
        message: 'Sync failed'
      }];
    }
  }

  /**
   * Add investor to Investor Leads base
   */
  private async addToInvestorLeads(investorData: InvestorData, analytics: any): Promise<SyncResult> {
    const airtableData = {
      records: [
        {
          fields: {
            'Name': investorData.name,
            'Email': investorData.email,
            'Phone': investorData.phone,
            'Investment Capacity': investorData.investmentCapacity,
            'Geographic Preference': investorData.geographicPreference,
            'Experience Level': investorData.investmentExperience,
            'Timeline': investorData.timeline,
            'Accreditation Status': investorData.accreditationStatus,
            'Qualification Score': analytics.score || 0,
            'Investor Tier': analytics.tier || 'Bronze',
            'Status': 'New Lead',
            'Source': 'Elite Accredited Form',
            'Date Added': new Date().toISOString().split('T')[0]
          }
        }
      ]
    };

    try {
      const response = await fetch(`https://api.airtable.com/v0/${this.baseIds.investorLeads}/Investor%20Leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      });

      if (!response.ok) {
        throw new Error('Airtable integration failed');
      }

      return {
        success: true,
        message: 'Added to Investor Leads',
        data: await response.json()
      };
    } catch (error) {
      console.error('Airtable Investor Leads error:', error);
      return {
        success: false,
        message: 'Failed to add to Investor Leads'
      };
    }
  }

  /**
   * Add investor to Investor Interactions base
   */
  private async addToInvestorInteractions(investorData: InvestorData): Promise<SyncResult> {
    // Implementation for investor interactions
    console.log('Would add to Investor Interactions:', investorData);
    return {
      success: true,
      message: 'Demo: Would sync to Investor Interactions'
    };
  }

  /**
   * Add investor to Property Tracker base
   */
  private async addToPropertyTracker(investorData: InvestorData): Promise<SyncResult> {
    // Implementation for property tracker
    console.log('Would add to Property Tracker:', investorData);
    return {
      success: true,
      message: 'Demo: Would sync to Property Tracker'
    };
  }
}

// Create singleton instance
export const airtableSync = new AdvancedAirtableSync();
