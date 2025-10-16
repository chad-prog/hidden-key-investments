
/**
 * Elite Investor CRM integration with Airtable and advanced qualification
 */
import { useState, useEffect } from 'react';

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

interface QualificationResult {
  score: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  recommendations: string[];
  matchedDeals: string[];
}

export const useEliteInvestorCRM = () => {
  const [isLoading, setIsLoading] = useState(false);

  const qualifyInvestor = async (data: InvestorData): Promise<QualificationResult> => {
    setIsLoading(true);
    
    try {
      // Advanced ML-style qualification algorithm with weighted factors
      let score = 0;
      const recommendations: string[] = [];
      const matchedDeals: string[] = [];
      const riskFactors: string[] = [];

      // Investment capacity scoring (35% weight)
      if (data.investmentCapacity.includes('1m+')) {
        score += 35;
        matchedDeals.push('Premium Multifamily Syndication', 'Development Projects', 'Portfolio Acquisitions');
      } else if (data.investmentCapacity.includes('500k')) {
        score += 25;
        matchedDeals.push('Value-Add Multifamily', 'Commercial Redevelopment', 'Ground-Up Development');
      } else if (data.investmentCapacity.includes('250k')) {
        score += 18;
        matchedDeals.push('Stabilized Multifamily', 'Single-Family Rentals', 'Value-Add Projects');
      } else {
        score += 8;
        matchedDeals.push('REITs', 'Fractional Ownership', 'Starter Portfolio');
      }

      // Experience scoring (25% weight)
      if (data.investmentExperience.includes('institutional')) {
        score += 25;
        recommendations.push('Priority access to institutional co-investment opportunities');
        matchedDeals.push('Institutional Partnerships', 'Fund Investments');
      } else if (data.investmentExperience.includes('10+')) {
        score += 20;
        recommendations.push('Consider our advanced investment strategies and portfolio optimization');
      } else if (data.investmentExperience.includes('4-10')) {
        score += 15;
        recommendations.push('Explore our value-add and development opportunities');
      } else if (data.investmentExperience.includes('1-3')) {
        score += 10;
        recommendations.push('Build experience with our stabilized cash-flowing properties');
        riskFactors.push('Limited investment history');
      } else {
        score += 5;
        recommendations.push('Start with our educational resources and introductory webinars');
        riskFactors.push('First-time investor');
      }

      // Timeline scoring (15% weight)
      if (data.timeline === 'immediate') {
        score += 15;
        matchedDeals.push('Current Offerings', 'Quick-Close Opportunities', 'Immediate Deployment');
      } else if (data.timeline === '1-3 months') {
        score += 12;
        matchedDeals.push('Pipeline Opportunities', 'Pre-Construction', 'Upcoming Launches');
      } else if (data.timeline === '3-6 months') {
        score += 8;
        matchedDeals.push('Future Developments', 'Market Research Phase');
      } else {
        score += 5;
        recommendations.push('Join our waitlist for future opportunities matching your timeline');
      }

      // Geographic preference scoring (10% weight)
      if (data.geographicPreference.includes('multiple') || data.geographicPreference.includes('national')) {
        score += 10;
        matchedDeals.push('National Portfolio', 'Multi-Market Strategy');
      } else if (data.geographicPreference.includes('texas')) {
        score += 8;
        matchedDeals.push('Texas Market Specialists', 'Austin/Dallas/Houston');
      } else {
        score += 5;
        recommendations.push('Consider diversifying across multiple markets for better risk-adjusted returns');
      }

      // Accreditation status (15% weight)
      if (data.accreditationStatus === 'qualified') {
        score += 15;
        recommendations.push('Access to Qualified Purchaser exclusive opportunities');
      } else if (data.accreditationStatus === 'accredited') {
        score += 12;
        recommendations.push('Full access to accredited investor offerings');
      } else if (data.accreditationStatus === 'pending') {
        score += 8;
        recommendations.push('Complete accreditation verification for full platform access');
        riskFactors.push('Accreditation pending verification');
      } else {
        score += 3;
        recommendations.push('Explore 506(c) verification options or non-accredited opportunities');
        riskFactors.push('Non-accredited investor - limited deal access');
      }

      // Risk assessment and adjustment
      if (riskFactors.length > 2) {
        score = Math.max(score - 10, 0);
        recommendations.push('Consider starting with lower-risk stabilized properties');
      }

      // Determine tier with enhanced logic
      let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
      if (score >= 85) {
        tier = 'Platinum';
        matchedDeals.push('Exclusive Founder Rounds', 'Early Access Deals', 'Co-GP Opportunities');
        recommendations.push('Eligible for advisory roles and deal sponsorship');
      } else if (score >= 70) {
        tier = 'Gold';
        matchedDeals.push('Priority Access Deals', 'Preferred Equity', 'Value-Add Projects');
        recommendations.push('Consider portfolio diversification and tax optimization strategies');
      } else if (score >= 50) {
        tier = 'Silver';
        matchedDeals.push('Core-Plus Properties', 'Stabilized Assets', 'Cash-Flow Focused');
        recommendations.push('Build investment track record with proven assets');
      } else {
        tier = 'Bronze';
        matchedDeals.push('Educational Resources', 'Market Research', 'Introductory Webinars');
        recommendations.push('Focus on building investment knowledge and capital allocation strategy');
      }

      // Generate automated documents
      const documentGeneration = await import('./documentGeneration');
      await documentGeneration.generateInvestorWelcomePackage(data, tier, score);

      // Sync with all Airtable bases
      const airtableSync = await import('./advancedAirtableSync');
      await airtableSync.syncInvestorAcrossAllBases(data, { score, tier, riskFactors });

      return { 
        score, 
        tier, 
        recommendations, 
        matchedDeals,
        riskFactors
      };
    } catch (error) {
      console.error('Qualification error:', error);
      return { 
        score: 0, 
        tier: 'Bronze', 
        recommendations: ['System error - please contact support'], 
        matchedDeals: [],
        riskFactors: ['System processing error']
      };
    } finally {
      setIsLoading(false);
    }
  };

  const addToAirtable = async (data: InvestorData, score: number, tier: string) => {
    // Airtable API integration
    const airtableData = {
      records: [
        {
          fields: {
            'Name': data.name,
            'Email': data.email,
            'Phone': data.phone,
            'Investment Capacity': data.investmentCapacity,
            'Geographic Preference': data.geographicPreference,
            'Experience Level': data.investmentExperience,
            'Timeline': data.timeline,
            'Accreditation Status': data.accreditationStatus,
            'Qualification Score': score,
            'Investor Tier': tier,
            'Status': 'New Lead',
            'Source': 'Elite Accredited Form',
            'Date Added': new Date().toISOString().split('T')[0]
          }
        }
      ]
    };

    try {
      const response = await fetch(`https://api.airtable.com/v0/appsxCvXYkJF62wQc/Investor%20Leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer patBxtbH98gm3s6go.9dc34915fd3389ae45f028d68d263d45a120333e9e3e764b43c4590248df5214`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      });

      if (!response.ok) {
        throw new Error('Airtable integration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Airtable error:', error);
      // Fallback - still continue with other automations
    }
  };

  const addToCRM = async (data: InvestorData) => {
    // This would integrate with your main CRM system
    console.log('Adding to elite CRM:', data);
    return true;
  };

  return {
    qualifyInvestor,
    addToCRM,
    isLoading
  };
};
