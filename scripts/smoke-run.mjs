#!/usr/bin/env node
/**
 * smoke-run.mjs
 * 
 * Self-contained smoke test for Hidden Key Investments serverless functions.
 * Validates investor-onboard and mautic-sync functions with zero external dependencies.
 * 
 * Requirements: Node 22+
 * 
 * Usage:
 *   npm run smoke
 *   node scripts/smoke-run.mjs
 *   SMOKE_BASE=https://staging.example.com node scripts/smoke-run.mjs
 * 
 * Environment Variables:
 *   SMOKE_BASE - Base URL for testing (required)
 *   SMOKE_ORIGIN - Origin for CORS testing (defaults to SMOKE_BASE)
 *   MAUTIC_CAMPAIGN_INVESTOR_WELCOME - Campaign ID for testing (optional)
 * 
 * Exit Codes:
 *   0 - All tests passed
 *   1 - One or more tests failed
 */

import { randomUUID } from 'crypto';
import { URL } from 'url';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  base: process.env.SMOKE_BASE || process.env.BASE_URL || '',
  origin: process.env.SMOKE_ORIGIN || process.env.SMOKE_BASE || process.env.BASE_URL || '',
  campaignId: process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME || '1',
  timeout: parseInt(process.env.SMOKE_TIMEOUT || '30000', 10),
};

// Validate configuration
if (!config.base) {
  console.error('❌ SMOKE_BASE environment variable is required');
  console.error('   Example: SMOKE_BASE=https://staging.hiddenkeyinvestments.com npm run smoke');
  process.exit(1);
}

// Normalize URLs (remove trailing slashes)
config.base = config.base.replace(/\/$/, '');
config.origin = config.origin.replace(/\/$/, '');

// Validate URL format
try {
  new URL(config.base);
  new URL(config.origin);
} catch (err) {
  console.error(`❌ Invalid URL format: ${err.message}`);
  process.exit(1);
}

// ============================================================================
// Test Framework
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

class TestResult {
  constructor(name, passed, message, details = null) {
    this.name = name;
    this.passed = passed;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

function logTest(name, passed, message, details = null) {
  const emoji = passed ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${message}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2).split('\n').join('\n   ')}`);
  }
  
  testResults.push(new TestResult(name, passed, message, details));
  
  if (passed) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// ============================================================================
// HTTP Utilities
// ============================================================================

async function httpRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Get response body
    const contentType = response.headers.get('content-type') || '';
    let body;
    
    if (contentType.includes('application/json')) {
      try {
        body = await response.json();
      } catch (err) {
        body = await response.text();
      }
    } else {
      body = await response.text();
    }
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${config.timeout}ms`);
    }
    throw err;
  }
}

// ============================================================================
// Test Helpers
// ============================================================================

function validateCorsHeaders(headers, testName) {
  const corsHeaders = {
    'access-control-allow-origin': headers['access-control-allow-origin'],
    'access-control-allow-methods': headers['access-control-allow-methods'],
    'access-control-allow-headers': headers['access-control-allow-headers'],
  };
  
  const hasOrigin = !!corsHeaders['access-control-allow-origin'];
  
  logTest(
    `${testName} - CORS Headers`,
    hasOrigin,
    hasOrigin ? 'CORS headers present' : 'CORS headers missing',
    corsHeaders
  );
  
  return hasOrigin;
}

function validateResponseStructure(body, expectedFields, testName) {
  const missingFields = [];
  const presentFields = [];
  
  for (const field of expectedFields) {
    if (field in body) {
      presentFields.push(field);
    } else {
      missingFields.push(field);
    }
  }
  
  const passed = missingFields.length === 0;
  
  logTest(
    `${testName} - Response Structure`,
    passed,
    passed 
      ? `All expected fields present: ${presentFields.join(', ')}` 
      : `Missing fields: ${missingFields.join(', ')}`,
    { present: presentFields, missing: missingFields }
  );
  
  return passed;
}

// ============================================================================
// Smoke Tests
// ============================================================================

async function testInvestorOnboardPreflight() {
  logSection('Investor Onboard - OPTIONS Preflight');
  
  const url = `${config.base}/.netlify/functions/investor-onboard`;
  logInfo(`Testing: ${url}`);
  
  try {
    const response = await httpRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    logTest(
      'OPTIONS Request',
      response.status === 200 || response.status === 204,
      `Status ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );
    
    validateCorsHeaders(response.headers, 'Investor Onboard OPTIONS');
    
  } catch (err) {
    logTest('OPTIONS Request', false, err.message);
  }
}

async function testInvestorOnboardPost() {
  logSection('Investor Onboard - POST Request');
  
  const url = `${config.base}/.netlify/functions/investor-onboard`;
  const correlationId = randomUUID();
  const testEmail = `smoke-test-${Date.now()}@example.com`;
  
  logInfo(`Testing: ${url}`);
  logInfo(`Correlation ID: ${correlationId}`);
  logInfo(`Test Email: ${testEmail}`);
  
  const payload = {
    email: testEmail,
    firstName: 'Smoke',
    lastName: 'Test',
    phone: '+15555551234',
    source: 'smoke-test',
    utm: {
      source: 'smoke',
      medium: 'test',
      campaign: 'validation',
    },
    consent: {
      marketing_opt_in: false,
    },
  };
  
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify(payload),
    });
    
    logTest(
      'POST Request',
      response.status === 200 || response.status === 201,
      `Status ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );
    
    validateCorsHeaders(response.headers, 'Investor Onboard POST');
    
    if (typeof response.body === 'object' && response.body !== null) {
      validateResponseStructure(response.body, ['ok'], 'Investor Onboard POST');
      
      // Check for correlation ID in response
      if (response.body.correlationId) {
        logTest(
          'Correlation ID Tracking',
          true,
          'Correlation ID present in response',
          { correlationId: response.body.correlationId }
        );
      }
      
      // In demo mode, we expect a success response but no actual sync
      if (response.body.data?.demoMode) {
        logInfo('Demo mode detected - no actual sync performed');
      }
    }
    
  } catch (err) {
    logTest('POST Request', false, err.message);
  }
}

async function testInvestorOnboardValidation() {
  logSection('Investor Onboard - Validation');
  
  const url = `${config.base}/.netlify/functions/investor-onboard`;
  logInfo(`Testing: ${url}`);
  
  // Test missing email
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
      },
      body: JSON.stringify({ firstName: 'Test' }),
    });
    
    logTest(
      'Missing Email Validation',
      response.status === 400,
      response.status === 400 
        ? 'Correctly rejects missing email' 
        : `Expected 400, got ${response.status}`,
      { status: response.status }
    );
    
  } catch (err) {
    logTest('Missing Email Validation', false, err.message);
  }
  
  // Test invalid JSON
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
      },
      body: 'invalid-json{',
    });
    
    logTest(
      'Invalid JSON Validation',
      response.status === 400,
      response.status === 400 
        ? 'Correctly rejects invalid JSON' 
        : `Expected 400, got ${response.status}`,
      { status: response.status }
    );
    
  } catch (err) {
    logTest('Invalid JSON Validation', false, err.message);
  }
}

async function testMauticSyncPreflight() {
  logSection('Mautic Sync - OPTIONS Preflight');
  
  const url = `${config.base}/.netlify/functions/mautic-sync`;
  logInfo(`Testing: ${url}`);
  
  try {
    const response = await httpRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, X-Correlation-ID',
      },
    });
    
    logTest(
      'OPTIONS Request',
      response.status === 200 || response.status === 204,
      `Status ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );
    
    validateCorsHeaders(response.headers, 'Mautic Sync OPTIONS');
    
  } catch (err) {
    logTest('OPTIONS Request', false, err.message);
  }
}

async function testMauticSyncPing() {
  logSection('Mautic Sync - Ping (Health Check)');
  
  const url = `${config.base}/.netlify/functions/mautic-sync`;
  const correlationId = randomUUID();
  
  logInfo(`Testing: ${url}`);
  logInfo(`Correlation ID: ${correlationId}`);
  
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({ action: 'ping' }),
    });
    
    logTest(
      'Ping Request',
      response.status === 200,
      `Status ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );
    
    validateCorsHeaders(response.headers, 'Mautic Sync Ping');
    
    if (typeof response.body === 'object' && response.body !== null) {
      validateResponseStructure(response.body, ['ok'], 'Mautic Sync Ping');
    }
    
  } catch (err) {
    logTest('Ping Request', false, err.message);
  }
}

async function testMauticSyncUpsert() {
  logSection('Mautic Sync - Upsert Contact');
  
  const url = `${config.base}/.netlify/functions/mautic-sync`;
  const correlationId = randomUUID();
  const testId = randomUUID();
  const testEmail = `smoke-test-${Date.now()}@example.com`;
  
  logInfo(`Testing: ${url}`);
  logInfo(`Correlation ID: ${correlationId}`);
  logInfo(`Test ID: ${testId}`);
  logInfo(`Test Email: ${testEmail}`);
  
  const payload = {
    action: 'upsert_contact',
    payload: {
      id: testId,
      updated_at: new Date().toISOString(),
      crm_status: 'new',
      consent: {
        marketing_opt_in: false,
      },
      contact: {
        email: testEmail,
        first_name: 'Smoke',
        last_name: 'Test',
        phone: '+15555551234',
      },
      utm: {
        source: 'smoke',
        medium: 'test',
        campaign: 'validation',
      },
    },
  };
  
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify(payload),
    });
    
    logTest(
      'Upsert Request',
      response.status === 200,
      `Status ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );
    
    validateCorsHeaders(response.headers, 'Mautic Sync Upsert');
    
    if (typeof response.body === 'object' && response.body !== null) {
      validateResponseStructure(response.body, ['ok'], 'Mautic Sync Upsert');
      
      // In demo mode, we expect a success response
      if (response.body.data?.demoMode) {
        logInfo('Demo mode detected - no actual sync performed');
      }
    }
    
  } catch (err) {
    logTest('Upsert Request', false, err.message);
  }
}

async function testMauticSyncAddToCampaign() {
  logSection('Mautic Sync - Add to Campaign (Optional)');
  
  logInfo('This test is optional and may fail in demo mode or without valid contact ID');
  
  const url = `${config.base}/.netlify/functions/mautic-sync`;
  const correlationId = randomUUID();
  
  logInfo(`Testing: ${url}`);
  logInfo(`Correlation ID: ${correlationId}`);
  logInfo(`Campaign ID: ${config.campaignId}`);
  
  const payload = {
    action: 'add_to_campaign',
    mauticContactId: '1',  // Demo contact ID
    campaignId: config.campaignId,
  };
  
  try {
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.origin,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify(payload),
    });
    
    // This test is informational only - don't fail on it
    const passed = response.status === 200 || response.status === 400 || response.status === 404;
    
    logTest(
      'Add to Campaign Request',
      passed,
      `Status ${response.status} (informational only)`,
      { status: response.status, statusText: response.statusText }
    );
    
    if (response.status === 200 && typeof response.body === 'object' && response.body !== null) {
      if (response.body.data?.demoMode) {
        logInfo('Demo mode detected - no actual campaign addition performed');
      }
    }
    
  } catch (err) {
    logInfo(`Add to Campaign test encountered error (expected in demo mode): ${err.message}`);
    // Don't fail the test suite on this optional test
  }
}

async function testMethodNotAllowed() {
  logSection('Method Validation - GET Not Allowed');
  
  const url = `${config.base}/.netlify/functions/investor-onboard`;
  logInfo(`Testing: ${url}`);
  
  try {
    const response = await httpRequest(url, {
      method: 'GET',
      headers: {
        'Origin': config.origin,
      },
    });
    
    logTest(
      'GET Method Rejected',
      response.status === 405,
      response.status === 405 
        ? 'Correctly rejects GET method' 
        : `Expected 405, got ${response.status}`,
      { status: response.status }
    );
    
  } catch (err) {
    logTest('GET Method Rejected', false, err.message);
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runSmokeTests() {
  console.log('\n🔥 Hidden Key Investments - Smoke Test Suite');
  console.log('='.repeat(60));
  console.log(`Base URL: ${config.base}`);
  console.log(`Origin: ${config.origin}`);
  console.log(`Campaign ID: ${config.campaignId}`);
  console.log(`Timeout: ${config.timeout}ms`);
  console.log(`Started: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  try {
    // Required tests - these must pass
    await testInvestorOnboardPreflight();
    await testInvestorOnboardPost();
    await testInvestorOnboardValidation();
    await testMauticSyncPreflight();
    await testMauticSyncPing();
    await testMauticSyncUpsert();
    await testMethodNotAllowed();
    
    // Optional tests - informational only
    await testMauticSyncAddToCampaign();
    
  } catch (err) {
    console.error(`\n❌ Unexpected error during test execution: ${err.message}`);
    console.error(err.stack);
    testsFailed++;
  }
  
  const duration = Date.now() - startTime;
  
  // Print summary
  logSection('Test Summary');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Completed: ${new Date().toISOString()}`);
  
  // Write results to file for CI
  if (process.env.CI) {
    const fs = await import('fs');
    const resultsPath = process.env.SMOKE_RESULTS_PATH || './smoke-test-results.json';
    
    const results = {
      passed: testsPassed,
      failed: testsFailed,
      total: testsPassed + testsFailed,
      duration,
      timestamp: new Date().toISOString(),
      config: {
        base: config.base,
        origin: config.origin,
      },
      tests: testResults,
    };
    
    await fs.promises.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults written to: ${resultsPath}`);
  }
  
  // Exit with appropriate code
  if (testsFailed > 0) {
    console.log('\n❌ SMOKE TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ SMOKE TESTS PASSED');
    process.exit(0);
  }
}

// Run tests
runSmokeTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
