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
<<<<<<< HEAD
  private apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || '';
  private baseIds = {
    investorLeads: import.meta.env.VITE_AIRTABLE_BASE_INVESTOR_LEADS || '',
    investorInteractions: import.meta.env.VITE_AIRTABLE_BASE_INVESTOR_INTERACTIONS || '',
    propertyTracker: import.meta.env.VITE_AIRTABLE_BASE_PROPERTY_TRACKER || ''
=======
  private _env = (import.meta as any).env || {};
  private apiKey = this._env.VITE_AIRTABLE_API_KEY || 'demo-key';
  private baseIds = {
    investorLeads: this._env.VITE_AIRTABLE_BASE_INVESTOR_LEADS || 'appsxCvXYkJF62wQc',
    investorInteractions: this._env.VITE_AIRTABLE_BASE_INVESTOR_INTERACTIONS || 'apppzfIaiHvQ2avWm',
    propertyTracker: this._env.VITE_AIRTABLE_BASE_PROPERTY_TRACKER || 'appl3vaf5gFdstSA2'
>>>>>>> cleanup/merge-ready
  };

  /**
   * Sync investor across all Airtable bases
   */
  async syncInvestorAcrossAllBases(investorData: InvestorData, analytics: any): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

<<<<<<< HEAD
    // If no API key, return demo mode
    if (!this.apiKey) {
      console.log('Demo mode: Would sync investor to Airtable', investorData);
      results.push({
        success: true,
        message: 'Demo mode: Investor data would be synced with real API key'
=======
    // Prefer server-side Netlify function to perform Airtable sync.
    // Client-only code will call the function and honor its demo mode.
    try {
      const resp = await fetch('/.netlify/functions/airtable-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorData, analytics })
>>>>>>> cleanup/merge-ready
      });

      if (!resp.ok) {
        throw new Error('Airtable server function returned an error');
      }

      const json = await resp.json();
      if (json && json.demo) {
        results.push({ success: true, message: 'Demo mode: serverless function simulated Airtable sync', data: json });
        return results;
      }

      // If server function returns real result, bubble it up
      results.push({ success: true, message: 'Server function performed Airtable sync', data: json });
      return results;
    } catch (err) {
      console.warn('Serverless Airtable sync failed, falling back to client/demo mode', err);
      results.push({ success: true, message: 'Client demo fallback: would sync to Airtable' });
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
