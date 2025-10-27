/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at startup to fail fast
 * with clear error messages rather than mysterious runtime errors.
 * 
 * Usage:
 *   import { validateEnv } from '@/lib/envValidation';
 *   validateEnv(); // Call at app startup
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase Configuration (Optional in demo mode)
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  
  // API Keys (Optional - graceful degradation)
  VITE_MAILCHIMP_API_KEY: z.string().optional(),
  VITE_AIRTABLE_API_KEY: z.string().optional(),
  
  // Feature Flags (Optional - defaults provided)
  VITE_FEATURE_LEADCAPTURE: z.string().optional(),
  VITE_FEATURE_CRMPIPELINE: z.string().optional(),
  VITE_FEATURE_WORKFLOWAUTOMATION: z.string().optional(),
  VITE_FEATURE_MLSCORING: z.string().optional(),
  VITE_FEATURE_AIASSISTANTS: z.string().optional(),
  
  // Observability (Optional)
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),
  
  // Environment
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

// Server-side only environment variables (for Netlify functions)
const serverEnvSchema = z.object({
  // Supabase Service Role (server-side only)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Email Service
  SENDGRID_API_KEY: z.string().optional(),
  MAILCHIMP_API_KEY: z.string().optional(),
  
  // SMS Service
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // API Keys
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),
  
  // Document Services
  DOCUSIGN_API_KEY: z.string().optional(),
  HELLOSIGN_API_KEY: z.string().optional(),
  
  // Enrichment Services
  CLEARBIT_API_KEY: z.string().optional(),
  ZILLOW_API_KEY: z.string().optional(),
  
  // Observability
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

interface ValidationResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  demoMode?: boolean;
}

/**
 * Validates client-side environment variables
 */
export function validateEnv(): ValidationResult {
  const result = envSchema.safeParse(import.meta.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    console.error('Environment validation failed:', errors);
    return { success: false, errors };
  }
  
  const warnings: string[] = [];
  let demoMode = false;
  
  // Check for demo mode conditions
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    warnings.push('Running in DEMO MODE - Supabase not configured');
    demoMode = true;
  }
  
  if (!import.meta.env.VITE_MAILCHIMP_API_KEY) {
    warnings.push('Mailchimp not configured - email features will use demo mode');
  }
  
  if (!import.meta.env.VITE_AIRTABLE_API_KEY) {
    warnings.push('Airtable not configured - sync features will use demo mode');
  }
  
  // Log warnings in development
  if (import.meta.env.DEV && warnings.length > 0) {
    console.warn('Environment warnings:', warnings);
  }
  
  return {
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    demoMode,
  };
}

/**
 * Validates server-side environment variables (for use in Netlify functions)
 */
export function validateServerEnv(env: NodeJS.ProcessEnv): ValidationResult {
  const result = serverEnvSchema.safeParse(env);
  
  if (!result.success) {
    const errors = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    console.error('Server environment validation failed:', errors);
    return { success: false, errors };
  }
  
  const warnings: string[] = [];
  let demoMode = false;
  
  // Check for critical missing configuration
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('Supabase not configured - database operations will fail');
    demoMode = true;
  }
  
  if (!env.SENDGRID_API_KEY && !env.MAILCHIMP_API_KEY) {
    warnings.push('No email service configured');
  }
  
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    warnings.push('Twilio not configured - SMS features disabled');
  }
  
  return {
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    demoMode,
  };
}

/**
 * Gets a typed environment variable with fallback
 */
export function getEnv<K extends keyof Env>(
  key: K,
  fallback?: Env[K]
): Env[K] | undefined {
  const value = import.meta.env[key];
  return value ?? fallback;
}

/**
 * Checks if running in demo mode (no API keys configured)
 */
export function isDemoMode(): boolean {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

/**
 * Checks if a specific service is configured
 */
export function isServiceConfigured(service: 'supabase' | 'mailchimp' | 'airtable' | 'sentry'): boolean {
  switch (service) {
    case 'supabase':
      return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    case 'mailchimp':
      return !!import.meta.env.VITE_MAILCHIMP_API_KEY;
    case 'airtable':
      return !!import.meta.env.VITE_AIRTABLE_API_KEY;
    case 'sentry':
      return !!import.meta.env.VITE_SENTRY_DSN;
    default:
      return false;
  }
}

/**
 * Gets configuration status for all services
 */
export function getConfigStatus() {
  return {
    demoMode: isDemoMode(),
    services: {
      supabase: isServiceConfigured('supabase'),
      mailchimp: isServiceConfigured('mailchimp'),
      airtable: isServiceConfigured('airtable'),
      sentry: isServiceConfigured('sentry'),
    },
    environment: import.meta.env.MODE,
  };
}
