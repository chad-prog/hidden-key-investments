/**
 * Environment Validation Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateEnv,
  isDemoMode,
  isServiceConfigured,
  getConfigStatus,
} from '../envValidation';

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset environment mocks before each test
    vi.stubGlobal('import', {
      meta: {
        env: {
          MODE: 'test',
          DEV: false,
          PROD: false,
        },
      },
    });
  });

  describe('validateEnv', () => {
    it('should pass validation with minimal config', () => {
      const result = validateEnv();
      expect(result.success).toBe(true);
    });

    it('should detect demo mode when Supabase not configured', () => {
      const result = validateEnv();
      expect(result.demoMode).toBe(true);
      expect(result.warnings).toContain('Running in DEMO MODE - Supabase not configured');
    });
  });

  describe('isDemoMode', () => {
    it('should return true when Supabase not configured', () => {
      expect(isDemoMode()).toBe(true);
    });
  });

  describe('isServiceConfigured', () => {
    it('should return false for unconfigured services', () => {
      expect(isServiceConfigured('supabase')).toBe(false);
      expect(isServiceConfigured('mailchimp')).toBe(false);
      expect(isServiceConfigured('airtable')).toBe(false);
      expect(isServiceConfigured('sentry')).toBe(false);
    });
  });

  describe('getConfigStatus', () => {
    it('should return complete configuration status', () => {
      const status = getConfigStatus();
      expect(status).toHaveProperty('demoMode');
      expect(status).toHaveProperty('services');
      expect(status).toHaveProperty('environment');
      expect(status.services).toHaveProperty('supabase');
      expect(status.services).toHaveProperty('mailchimp');
      expect(status.services).toHaveProperty('airtable');
      expect(status.services).toHaveProperty('sentry');
    });
  });
});
