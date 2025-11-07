#!/usr/bin/env node

/**
 * Smoke Test Runner for Hidden Key Investments
 * 
 * Self-contained Node.js 22+ smoke test runner that validates critical API endpoints.
 * No external dependencies required.
 * 
 * Usage:
 *   node scripts/smoke-run.mjs [--base=URL] [--origin=URL] [--campaign=ID]
 * 
 * Environment Variables:
 *   SMOKE_BASE - Base URL of the deployment to test
 *   SMOKE_ORIGIN - Frontend origin for CORS validation
 *   MAUTIC_CAMPAIGN_INVESTOR_WELCOME - Mautic campaign ID (optional)
 * 
 * Exit Codes:
 *   0 - All tests passed
 *   1 - One or more tests failed
 */

import { writeFileSync } from 'fs';
import { createWriteStream } from 'fs';

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    base: process.env.SMOKE_BASE,
    origin: process.env.SMOKE_ORIGIN,
    campaign: process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME
  };

  args.forEach(arg => {
    const match = arg.match(/--([^=]+)=(.+)/);
    if (match) {
      const [, key, value] = match;
      config[key] = value;
    }
  });

  return config;
}

// Logger that writes to both console and file
class Logger {
  constructor(filename = 'smoke.log') {
    this.filename = filename;
    this.logs = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    console.log(logLine);
    this.logs.push(logLine);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ERROR: ${message}`;
    console.error(logLine);
    this.logs.push(logLine);
  }

  success(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ✓ ${message}`;
    console.log(logLine);
    this.logs.push(logLine);
  }

  save() {
    try {
      writeFileSync(this.filename, this.logs.join('\n') + '\n');
      console.log(`\nLog saved to ${this.filename}`);
    } catch (err) {
      console.error(`Failed to save log: ${err.message}`);
    }
  }
}

// HTTP client for making requests
async function makeRequest(url, options = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': `smoke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...options.headers
      }
    });

    const duration = Date.now() - startTime;
    const body = await response.text();
    
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      duration
    };
  }
}

// Test CORS preflight
async function testCORSPreflight(logger, baseUrl, origin) {
  logger.log('\n=== Testing CORS Preflight ===');
  const url = `${baseUrl}/.netlify/functions/investor-onboard`;
  
  logger.log(`OPTIONS ${url}`);
  logger.log(`Origin: ${origin}`);

  const response = await makeRequest(url, {
    method: 'OPTIONS',
    headers: {
      'Origin': origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, X-Correlation-ID'
    }
  });

  logger.log(`Status: ${response.status} ${response.statusText}`);
  logger.log(`Duration: ${response.duration}ms`);

  if (response.error) {
    logger.error(`CORS preflight failed: ${response.error}`);
    return false;
  }

  if (!response.ok) {
    logger.error(`CORS preflight returned non-OK status: ${response.status}`);
    return false;
  }

  const allowOrigin = response.headers['access-control-allow-origin'];
  const allowMethods = response.headers['access-control-allow-methods'];
  
  logger.log(`Access-Control-Allow-Origin: ${allowOrigin || 'NOT SET'}`);
  logger.log(`Access-Control-Allow-Methods: ${allowMethods || 'NOT SET'}`);

  if (!allowOrigin) {
    logger.error('CORS preflight missing Access-Control-Allow-Origin header');
    return false;
  }

  logger.success('CORS preflight passed');
  return true;
}

// Test Mautic sync health check
async function testMauticSyncPing(logger, baseUrl) {
  logger.log('\n=== Testing Mautic Sync Ping ===');
  const url = `${baseUrl}/.netlify/functions/mautic-sync`;
  
  logger.log(`POST ${url}`);

  const response = await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'ping'
    })
  });

  logger.log(`Status: ${response.status} ${response.statusText}`);
  logger.log(`Duration: ${response.duration}ms`);

  if (response.error) {
    logger.error(`Mautic sync ping failed: ${response.error}`);
    return false;
  }

  if (!response.ok) {
    logger.error(`Mautic sync ping returned non-OK status: ${response.status}`);
    if (response.data) {
      logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
    return false;
  }

  logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  logger.success('Mautic sync ping passed');
  return true;
}

// Test investor onboarding
async function testInvestorOnboard(logger, baseUrl, origin) {
  logger.log('\n=== Testing Investor Onboard ===');
  const url = `${baseUrl}/.netlify/functions/investor-onboard`;
  
  // Use a stable UUID for smoke testing
  const stableUUID = '00000000-0000-4000-8000-000000000001';
  
  const payload = {
    email: `smoke-test-${Date.now()}@example.com`,
    firstName: 'Smoke',
    lastName: 'Test',
    phone: '+1234567890',
    investorType: 'individual',
    investmentAmount: 25000,
    accreditationStatus: 'accredited',
    metadata: {
      source: 'smoke-test',
      testId: stableUUID,
      timestamp: new Date().toISOString()
    }
  };

  logger.log(`POST ${url}`);
  logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

  const response = await makeRequest(url, {
    method: 'POST',
    headers: {
      'Origin': origin
    },
    body: JSON.stringify(payload)
  });

  logger.log(`Status: ${response.status} ${response.statusText}`);
  logger.log(`Duration: ${response.duration}ms`);

  if (response.error) {
    logger.error(`Investor onboard failed: ${response.error}`);
    return { success: false, contactId: null };
  }

  if (!response.ok) {
    logger.error(`Investor onboard returned non-OK status: ${response.status}`);
    if (response.data) {
      logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
    return { success: false, contactId: null };
  }

  logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);

  // Extract contact ID from common response shapes
  let contactId = null;
  if (response.data) {
    // Try various possible locations for contact ID
    contactId = response.data.contactId 
      || response.data.contact_id 
      || response.data.id
      || response.data.mauticContactId
      || response.data.mautic_contact_id
      || (response.data.contact && response.data.contact.id)
      || (response.data.data && response.data.data.contactId)
      || (response.data.data && response.data.data.id);
  }

  if (contactId) {
    logger.log(`Contact ID: ${contactId}`);
  } else {
    logger.log('Warning: Could not extract contact ID from response');
  }

  logger.success('Investor onboard passed');
  return { success: true, contactId };
}

// Test adding contact to campaign
async function testAddToCampaign(logger, baseUrl, contactId, campaignId) {
  logger.log('\n=== Testing Add to Campaign ===');
  
  if (!contactId) {
    logger.log('Skipping add to campaign: no contact ID available');
    return true;
  }

  const url = `${baseUrl}/.netlify/functions/mautic-sync`;
  
  const payload = {
    action: 'add_to_campaign',
    contactId: contactId,
    campaignId: campaignId
  };

  logger.log(`POST ${url}`);
  logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

  const response = await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  logger.log(`Status: ${response.status} ${response.statusText}`);
  logger.log(`Duration: ${response.duration}ms`);

  if (response.error) {
    logger.error(`Add to campaign failed: ${response.error}`);
    return false;
  }

  if (!response.ok) {
    logger.error(`Add to campaign returned non-OK status: ${response.status}`);
    if (response.data) {
      logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
    return false;
  }

  logger.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  logger.success('Add to campaign passed');
  return true;
}

// Main smoke test runner
async function runSmokeTests() {
  const logger = new Logger();
  const config = parseArgs();

  logger.log('='.repeat(60));
  logger.log('SMOKE TEST RUNNER - Hidden Key Investments');
  logger.log('='.repeat(60));
  logger.log(`Started: ${new Date().toISOString()}`);
  logger.log('');

  // Validate configuration
  logger.log('Configuration:');
  logger.log(`  Base URL: ${config.base || 'NOT SET'}`);
  logger.log(`  Origin: ${config.origin || 'NOT SET'}`);
  logger.log(`  Campaign ID: ${config.campaign || 'NOT SET'}`);

  if (!config.base) {
    logger.error('SMOKE_BASE is required. Set via --base flag or SMOKE_BASE environment variable.');
    logger.save();
    process.exit(1);
  }

  if (!config.origin) {
    logger.error('SMOKE_ORIGIN is required. Set via --origin flag or SMOKE_ORIGIN environment variable.');
    logger.save();
    process.exit(1);
  }

  const results = {
    corsPreflight: false,
    mauticPing: false,
    investorOnboard: false,
    addToCampaign: true // Optional test, defaults to pass
  };

  let contactId = null;

  // Run tests
  try {
    // Test 1: CORS Preflight
    results.corsPreflight = await testCORSPreflight(logger, config.base, config.origin);

    // Test 2: Mautic Sync Ping
    results.mauticPing = await testMauticSyncPing(logger, config.base);

    // Test 3: Investor Onboard
    const onboardResult = await testInvestorOnboard(logger, config.base, config.origin);
    results.investorOnboard = onboardResult.success;
    contactId = onboardResult.contactId;

    // Test 4: Add to Campaign (optional)
    if (config.campaign && contactId) {
      results.addToCampaign = await testAddToCampaign(logger, config.base, contactId, config.campaign);
    } else if (config.campaign && !contactId) {
      logger.log('\n=== Skipping Add to Campaign ===');
      logger.log('Contact ID not available from investor onboard');
    }

  } catch (error) {
    logger.error(`Unexpected error during smoke tests: ${error.message}`);
    logger.error(error.stack);
  }

  // Summary
  logger.log('\n' + '='.repeat(60));
  logger.log('SMOKE TEST SUMMARY');
  logger.log('='.repeat(60));
  
  const testResults = [
    { name: 'CORS Preflight', passed: results.corsPreflight, required: true },
    { name: 'Mautic Sync Ping', passed: results.mauticPing, required: true },
    { name: 'Investor Onboard', passed: results.investorOnboard, required: true },
    { name: 'Add to Campaign', passed: results.addToCampaign, required: false }
  ];

  testResults.forEach(test => {
    const status = test.passed ? '✓ PASS' : '✗ FAIL';
    const required = test.required ? '(required)' : '(optional)';
    logger.log(`${status} ${test.name} ${required}`);
  });

  const requiredTests = testResults.filter(t => t.required);
  const passedRequired = requiredTests.filter(t => t.passed).length;
  const totalRequired = requiredTests.length;

  logger.log('');
  logger.log(`Required tests passed: ${passedRequired}/${totalRequired}`);
  logger.log(`Completed: ${new Date().toISOString()}`);
  logger.log('='.repeat(60));

  // Save log
  logger.save();

  // Exit with appropriate code
  const allRequiredPassed = requiredTests.every(t => t.passed);
  if (allRequiredPassed) {
    logger.log('\n🎉 All required smoke tests passed!');
    process.exit(0);
  } else {
    logger.log('\n❌ Some required smoke tests failed!');
    process.exit(1);
  }
}

// Run smoke tests
runSmokeTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
