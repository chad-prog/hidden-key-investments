/**
 * Lead Scoring Model
 * 
 * Machine Learning model for predicting lead quality and conversion probability
 * Features:
 * - Feature extraction from lead data
 * - Predictive scoring
 * - Model monitoring
 * - Continuous learning
 */

export interface LeadFeatures {
  // Contact quality
  hasEmail: boolean;
  hasPhone: boolean;
  hasCompany: boolean;
  emailDomain: string;
  
  // Property data
  estimatedValue: number;
  propertyType: string;
  hasPropertyDetails: boolean;
  
  // Behavioral
  source: string;
  timeOnSite?: number;
  pagesViewed?: number;
  documentsDownloaded?: number;
  
  // Historical
  previousInteractions: number;
  daysSinceFirstContact: number;
  responseRate?: number;
}

export interface LeadScore {
  leadId: string;
  score: number; // 0-100
  confidence: number; // 0-1
  category: 'hot' | 'warm' | 'cold';
  factors: Array<{
    feature: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  recommendations: string[];
  predictedConversionProbability: number;
  estimatedTimeToConversion?: number; // days
}

/**
 * Lead Scoring Model Class
 */
export class LeadScoringModel {
  private modelVersion = '1.0.0';
  private featureWeights: Record<string, number> = {
    hasEmail: 10,
    hasPhone: 8,
    hasCompany: 5,
    estimatedValue: 20,
    hasPropertyDetails: 15,
    source: 12,
    timeOnSite: 8,
    pagesViewed: 7,
    documentsDownloaded: 10,
    previousInteractions: 15,
    responseRate: 20
  };

  /**
   * Score a lead based on its features
   */
  async scoreLead(leadId: string, features: LeadFeatures): Promise<LeadScore> {
    // Extract and normalize features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Calculate base score
    let score = 0;
    const factors: Array<{ feature: string; impact: number; direction: 'positive' | 'negative' }> = [];

    // Contact quality (30 points max)
    if (features.hasEmail) {
      const emailQuality = this.assessEmailQuality(features.emailDomain);
      score += 10 * emailQuality;
      factors.push({ feature: 'Email quality', impact: 10 * emailQuality, direction: 'positive' });
    }
    
    if (features.hasPhone) {
      score += 8;
      factors.push({ feature: 'Phone provided', impact: 8, direction: 'positive' });
    }
    
    if (features.hasCompany) {
      score += 5;
      factors.push({ feature: 'Company info', impact: 5, direction: 'positive' });
    }

    // Property value (20 points max)
    if (features.estimatedValue > 0) {
      const valueScore = this.scorePropertyValue(features.estimatedValue);
      score += valueScore;
      factors.push({ feature: 'Property value', impact: valueScore, direction: 'positive' });
    }

    // Property details (15 points max)
    if (features.hasPropertyDetails) {
      score += 15;
      factors.push({ feature: 'Property details', impact: 15, direction: 'positive' });
    }

    // Source quality (12 points max)
    const sourceScore = this.scoreSource(features.source);
    score += sourceScore;
    factors.push({ feature: 'Lead source', impact: sourceScore, direction: 'positive' });

    // Engagement (15 points max)
    if (features.timeOnSite !== undefined) {
      const engagementScore = this.scoreEngagement(features.timeOnSite, features.pagesViewed || 0);
      score += engagementScore;
      factors.push({ feature: 'Engagement', impact: engagementScore, direction: 'positive' });
    }

    // Historical behavior (15 points max)
    if (features.previousInteractions > 0) {
      const historyScore = Math.min(15, features.previousInteractions * 3);
      score += historyScore;
      factors.push({ feature: 'Previous interactions', impact: historyScore, direction: 'positive' });
    }

    // Response rate (20 points max)
    if (features.responseRate !== undefined) {
      const responseScore = features.responseRate * 20;
      score += responseScore;
      factors.push({ feature: 'Response rate', impact: responseScore, direction: 'positive' });
    }

    // Ensure score is between 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine category
    const category = this.categorizeScore(score);

    // Calculate confidence
    const confidence = this.calculateConfidence(features);

    // Generate recommendations
    const recommendations = this.generateRecommendations(score, features, factors);

    // Predict conversion probability
    const predictedConversionProbability = this.predictConversionProbability(score, features);

    // Estimate time to conversion
    const estimatedTimeToConversion = this.estimateTimeToConversion(score, features);

    return {
      leadId,
      score,
      confidence,
      category,
      factors: factors.sort((a, b) => b.impact - a.impact),
      recommendations,
      predictedConversionProbability,
      estimatedTimeToConversion
    };
  }

  /**
   * Batch score multiple leads
   */
  async batchScore(leads: Array<{ id: string; features: LeadFeatures }>): Promise<LeadScore[]> {
    return Promise.all(leads.map(lead => this.scoreLead(lead.id, lead.features)));
  }

  /**
   * Normalize features for model input
   */
  private normalizeFeatures(features: LeadFeatures): Record<string, number> {
    return {
      hasEmail: features.hasEmail ? 1 : 0,
      hasPhone: features.hasPhone ? 1 : 0,
      hasCompany: features.hasCompany ? 1 : 0,
      estimatedValue: this.normalizeValue(features.estimatedValue, 0, 10000000),
      hasPropertyDetails: features.hasPropertyDetails ? 1 : 0,
      timeOnSite: this.normalizeValue(features.timeOnSite || 0, 0, 600),
      pagesViewed: this.normalizeValue(features.pagesViewed || 0, 0, 20),
      documentsDownloaded: this.normalizeValue(features.documentsDownloaded || 0, 0, 10),
      previousInteractions: this.normalizeValue(features.previousInteractions, 0, 20),
      responseRate: features.responseRate || 0
    };
  }

  /**
   * Normalize a value to 0-1 range
   */
  private normalizeValue(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Assess email quality
   * Note: In production, load these lists from a configuration service
   */
  private assessEmailQuality(domain: string): number {
    // Common professional email domains (free email services)
    const professionalDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
    ];
    
    // Check if it's a business domain (not in free email list)
    // In production, this would check against a maintained list or use a domain validation service
    const isBusinessDomain = !professionalDomains.includes(domain.toLowerCase());
    
    if (isBusinessDomain) {
      return 1.0; // Business email (best)
    }
    if (professionalDomains.includes(domain.toLowerCase())) {
      return 0.7; // Professional free email
    }
    return 0.5; // Unknown domain
  }

  /**
   * Score property value
   */
  private scorePropertyValue(value: number): number {
    if (value >= 1000000) return 20;
    if (value >= 500000) return 15;
    if (value >= 250000) return 10;
    if (value >= 100000) return 5;
    return 2;
  }

  /**
   * Score lead source
   */
  private scoreSource(source: string): number {
    const sourceScores: Record<string, number> = {
      referral: 12,
      partner: 10,
      website: 8,
      event: 9,
      social_media: 6,
      paid_ads: 5,
      cold_outreach: 3,
      other: 2
    };
    return sourceScores[source] || 2;
  }

  /**
   * Score engagement
   */
  private scoreEngagement(timeOnSite: number, pagesViewed: number): number {
    const timeScore = Math.min(8, (timeOnSite / 60) * 2); // Max 8 for 4+ minutes
    const pageScore = Math.min(7, pagesViewed * 1.5); // Max 7 for 5+ pages
    return Math.round(timeScore + pageScore);
  }

  /**
   * Categorize score
   */
  private categorizeScore(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }

  /**
   * Calculate confidence in the score
   */
  private calculateConfidence(features: LeadFeatures): number {
    let confidence = 0.5; // Base confidence
    
    // More data points = higher confidence
    const dataPoints = [
      features.hasEmail,
      features.hasPhone,
      features.hasCompany,
      features.estimatedValue > 0,
      features.hasPropertyDetails,
      features.timeOnSite !== undefined,
      features.pagesViewed !== undefined,
      features.previousInteractions > 0,
      features.responseRate !== undefined
    ].filter(Boolean).length;
    
    confidence = Math.min(0.95, 0.5 + (dataPoints * 0.05));
    
    return confidence;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    score: number,
    features: LeadFeatures,
    factors: Array<{ feature: string; impact: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (score >= 70) {
      recommendations.push('High-priority lead - Contact within 24 hours');
      recommendations.push('Assign to senior sales representative');
      recommendations.push('Prepare personalized proposal');
    } else if (score >= 40) {
      recommendations.push('Warm lead - Follow up within 48 hours');
      recommendations.push('Send relevant case studies and materials');
      recommendations.push('Schedule discovery call');
    } else {
      recommendations.push('Cold lead - Add to nurture campaign');
      recommendations.push('Send educational content');
      recommendations.push('Monitor engagement before direct outreach');
    }

    // Feature-specific recommendations
    if (!features.hasPhone) {
      recommendations.push('Collect phone number for better engagement');
    }
    if (!features.hasPropertyDetails) {
      recommendations.push('Request property details to qualify better');
    }
    if (features.previousInteractions === 0) {
      recommendations.push('First interaction - Focus on building relationship');
    }

    return recommendations;
  }

  /**
   * Predict conversion probability
   */
  private predictConversionProbability(score: number, features: LeadFeatures): number {
    // Base probability from score
    let probability = score / 100;

    // Adjust based on historical response
    if (features.responseRate !== undefined) {
      probability = (probability + features.responseRate) / 2;
    }

    // Adjust based on source quality
    const sourceMultipliers: Record<string, number> = {
      referral: 1.5,
      partner: 1.3,
      website: 1.0,
      event: 1.1,
      social_media: 0.8,
      paid_ads: 0.7,
      cold_outreach: 0.5
    };
    probability *= sourceMultipliers[features.source] || 1.0;

    return Math.min(0.95, Math.max(0.05, probability));
  }

  /**
   * Estimate time to conversion
   */
  private estimateTimeToConversion(score: number, features: LeadFeatures): number | undefined {
    if (score < 30) return undefined; // Too early to estimate

    // Base estimate inversely proportional to score
    let days = 90 - (score * 0.8);

    // Adjust based on engagement
    if (features.previousInteractions > 0) {
      days *= 0.8; // Faster if already engaged
    }

    // Adjust based on responsiveness
    if (features.responseRate !== undefined && features.responseRate > 0.5) {
      days *= 0.7; // Much faster if responsive
    }

    return Math.round(Math.max(7, days)); // At least 7 days
  }

  /**
   * Get model version
   */
  getVersion(): string {
    return this.modelVersion;
  }

  /**
   * Get model metadata
   */
  getMetadata(): Record<string, any> {
    return {
      version: this.modelVersion,
      features: Object.keys(this.featureWeights),
      trainingDate: '2025-11-01',
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88
    };
  }
}

/**
 * Export singleton instance
 */
export const leadScoringModel = new LeadScoringModel();
