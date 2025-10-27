/**
 * Feature Flag Management System
 * 
 * Enables gradual rollout of features and A/B testing
 * Compatible with services like LaunchDarkly or Unleash
 */

import React from 'react';

export interface FeatureFlag {
  enabled: boolean;
  variants?: Record<string, any>;
  rolloutPercentage?: number;
}

export interface FeatureFlags {
  // Core MVP Features
  leadCapture: FeatureFlag;
  crmPipeline: FeatureFlag;
  workflowAutomation: FeatureFlag;
  
  // Data & Enrichment
  leadEnrichment: FeatureFlag;
  propertyDataIntegration: FeatureFlag;
  phoneEmailValidation: FeatureFlag;
  
  // ML & Analytics
  mlScoring: FeatureFlag;
  predictiveAnalytics: FeatureFlag;
  dealProbabilityModel: FeatureFlag;
  
  // Communication & Legal
  emailAutomation: FeatureFlag;
  smsNotifications: FeatureFlag;
  eSignature: FeatureFlag;
  documentGeneration: FeatureFlag;
  
  // Assistant & Orchestration
  aiAssistants: FeatureFlag;
  empireOrchestrator: FeatureFlag;
  
  // Observability
  detailedLogging: FeatureFlag;
  performanceMonitoring: FeatureFlag;
  errorTracking: FeatureFlag;
}

// Default feature flags for development
const defaultFlags: FeatureFlags = {
  // Enable core features by default
  leadCapture: { enabled: true },
  crmPipeline: { enabled: true },
  workflowAutomation: { enabled: false }, // Experimental
  
  // Data enrichment - disabled until integrations ready
  leadEnrichment: { enabled: false },
  propertyDataIntegration: { enabled: false },
  phoneEmailValidation: { enabled: false },
  
  // ML features - disabled until models trained
  mlScoring: { enabled: false },
  predictiveAnalytics: { enabled: false },
  dealProbabilityModel: { enabled: false },
  
  // Communication - use existing integrations
  emailAutomation: { enabled: true },
  smsNotifications: { enabled: false },
  eSignature: { enabled: false },
  documentGeneration: { enabled: true },
  
  // AI features - disabled until orchestrator built
  aiAssistants: { enabled: false },
  empireOrchestrator: { enabled: false },
  
  // Observability - enable for debugging
  detailedLogging: { enabled: true },
  performanceMonitoring: { enabled: false },
  errorTracking: { enabled: true },
};

class FeatureFlagService {
  private flags: FeatureFlags;
  private overrides: Map<string, boolean> = new Map();

  constructor(initialFlags: FeatureFlags = defaultFlags) {
    this.flags = initialFlags;
    this.loadOverrides();
  }

  /**
   * Load feature flag overrides from localStorage (client-side)
   * or environment variables (server-side)
   */
  private loadOverrides(): void {
    // Client-side overrides from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('featureFlags');
        if (stored) {
          const overrides = JSON.parse(stored);
          Object.entries(overrides).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
              this.overrides.set(key, value);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load feature flag overrides:', error);
      }
    }
    
    // Server-side overrides from environment
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(this.flags).forEach(key => {
        const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
        if (process.env[envKey]) {
          this.overrides.set(key, process.env[envKey] === 'true');
        }
      });
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    // Check for override first
    if (this.overrides.has(feature)) {
      return this.overrides.get(feature) || false;
    }

    const flag = this.flags[feature];
    if (!flag) return false;

    // Check basic enabled state
    if (!flag.enabled) return false;

    // Check rollout percentage if specified
    if (flag.rolloutPercentage !== undefined) {
      return Math.random() * 100 < flag.rolloutPercentage;
    }

    return true;
  }

  /**
   * Get a feature variant (for A/B testing)
   */
  getVariant(feature: keyof FeatureFlags, defaultVariant: string = 'control'): string {
    const flag = this.flags[feature];
    if (!flag || !flag.variants) return defaultVariant;

    const variants = Object.keys(flag.variants);
    if (variants.length === 0) return defaultVariant;

    // Simple random selection (in production, use consistent hashing)
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  }

  /**
   * Set a feature flag override (for testing/development)
   */
  setOverride(feature: keyof FeatureFlags, enabled: boolean): void {
    this.overrides.set(feature, enabled);
    
    // Persist to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const overrides = Object.fromEntries(this.overrides);
        localStorage.setItem('featureFlags', JSON.stringify(overrides));
      } catch (error) {
        console.warn('Failed to persist feature flag override:', error);
      }
    }
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides.clear();
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('featureFlags');
      } catch (error) {
        console.warn('Failed to clear feature flag overrides:', error);
      }
    }
  }

  /**
   * Get all feature flags status
   */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    Object.keys(this.flags).forEach(key => {
      result[key] = this.isEnabled(key as keyof FeatureFlags);
    });
    return result;
  }

  /**
   * Update feature flags from remote source
   * (integrate with LaunchDarkly, Unleash, etc.)
   */
  async updateFromRemote(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const remoteFlags = await response.json();
      this.flags = { ...this.flags, ...remoteFlags };
    } catch (error) {
      console.error('Failed to update feature flags from remote:', error);
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagService();

// Hook for React components
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(feature);
}

// HOC for conditional rendering
export function withFeatureFlag<P extends object>(
  feature: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const enabled = featureFlags.isEnabled(feature);
    
    if (enabled) {
      return <Component {...props} />;
    }
    
    if (Fallback) {
      return <Fallback {...props} />;
    }
    
    return null;
  };
}
