#!/usr/bin/env node

/**
 * Smoke Test Runner for Hidden Key Investments
 * 
 * Validates critical API endpoints after deployment.
 * Requires Node.js 22+
 * No external dependencies.
 * 
 * Usage:
 *   node scripts/smoke-run.mjs --base=<url> --origin=<origin> [--campaign=<id>]
 *   
 * Environment Variables:
 *   SMOKE_BASE - Base URL of deployment
 *   SMOKE_ORIGIN - Origin header for CORS validation
 *   MAUTIC_CAMPAIGN_INVESTOR_WELCOME - Campaign ID (optional)
 */

import { createWriteStream } from 'fs';
import { randomUUID } from 'crypto';

// Parse CLI arguments
const args = process.argv.slice(2);
const cliArgs = {};
for (const arg of args) {
  const match = arg.match(/^--(\w+)=(.+)$/);
  if (match) {
    cliArgs[match[1]] = match[2];
  }
}

// Configuration
const config = {
  base: cliArgs.base || process.env.SMOKE_BASE,
  origin: cliArgs.origin || process.env.SMOKE_ORIGIN,
  campaign: cliArgs.campaign || process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME,
};

// Validation
if (!config.base) {
  console.error('❌ ERROR: SMOKE_BASE is required (--base or env var)');
  process.exit(1);
}

if (!config.origin) {
  console.error('❌ ERROR: SMOKE_ORIGIN is required (--origin or env var)');
  process.exit(1);
}

// Ensure base URL doesn't end with slash
config.base = config.base.replace(/\/$/, '');

// Logging setup
const logFile = createWriteStream('smoke.log', { flags: 'w' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(message);
  logFile.write(logMessage + '\n');
};

const logError = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${message}`;
  console.error(`❌ ${message}`);
  logFile.write(logMessage + '\n');
};

// Stable test UUID for idempotent testing
const TEST_INVESTOR_UUID = '00000000-0000-0000-0000-000000000001';

// HTTP helper
async function makeRequest(url, options = {}) {
  const correlationId = randomUUID();
  const headers = {
    'Content-Type': 'application/json',
    'X-Correlation-Id': correlationId,
    ...options.headers,
  };

  log(`\n📡 Request: ${options.method || 'GET'} ${url}`);
  log(`   Correlation-Id: ${correlationId}`);
  if (options.body) {
    const bodyPreview = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    log(`   Body: ${bodyPreview.substring(0, 100)}...`);
  }

  // Stringify body if it's an object
  const body = options.body && typeof options.body === 'object' ? 
    JSON.stringify(options.body) : options.body;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const responseCorrelationId = response.headers.get('x-correlation-id');
    log(`✅ Response: ${response.status} ${response.statusText}`);
    log(`   Correlation-Id: ${responseCorrelationId || 'NOT SET'}`);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      log(`   Data: ${JSON.stringify(data).substring(0, 200)}...`);
    } else {
      data = await response.text();
      log(`   Data: ${data.substring(0, 200)}...`);
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      correlationId: responseCorrelationId,
    };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    throw error;
  }
}

// Test functions
async function testCorsOptions() {
  log('\n🔍 Test 1: CORS Preflight (OPTIONS)');
  log('─'.repeat(60));

  const url = `${config.base}/.netlify/functions/investor-onboard`;
  
  try {
    const response = await makeRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,X-Correlation-Id',
      },
    });

    // Validate CORS headers
    const requiredHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
    ];

    const missingHeaders = requiredHeaders.filter(
      header => !response.headers[header]
    );

    if (missingHeaders.length > 0) {
      logError(`Missing CORS headers: ${missingHeaders.join(', ')}`);
      return false;
    }

    log(`✅ CORS headers present and valid`);
    log(`   Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    log(`   Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    log(`   Allow-Headers: ${response.headers['access-control-allow-headers']}`);
    
    return true;
  } catch (error) {
    logError(`CORS preflight failed: ${error.message}`);
    return false;
  }
}

async function testMauticPing() {
  log('\n🔍 Test 2: Mautic Sync Ping');
  log('─'.repeat(60));

  const url = `${config.base}/.netlify/functions/mautic-sync`;
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: { action: 'ping' },
    });

    if (!response.ok) {
      logError(`Ping failed with status ${response.status}`);
      return false;
    }

    if (response.data && response.data.status === 'ok') {
      log(`✅ Mautic sync endpoint responding`);
      return true;
    } else {
      logError(`Unexpected ping response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Mautic ping failed: ${error.message}`);
    return false;
  }
}

async function testInvestorOnboard() {
  log('\n🔍 Test 3: Investor Onboard (Upsert)');
  log('─'.repeat(60));

  const url = `${config.base}/.netlify/functions/investor-onboard`;
  
  const testData = {
    uuid: TEST_INVESTOR_UUID,
    email: 'smoke-test@hiddenkeyinvestments.com',
    firstName: 'Smoke',
    lastName: 'Test',
    phone: '+1-555-0100',
    investmentAmount: 10000,
    investmentType: 'equity',
    accreditationStatus: 'pending',
  };

  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Origin': config.origin,
      },
      body: testData,
    });

    if (!response.ok) {
      logError(`Investor onboard failed with status ${response.status}`);
      logError(`Response: ${JSON.stringify(response.data)}`);
      return { success: false, contactId: null };
    }

    const contactId = response.data?.contactId || response.data?.mauticContactId;
    
    if (!contactId) {
      logError(`No contactId returned in response`);
      return { success: false, contactId: null };
    }

    log(`✅ Investor onboarded successfully`);
    log(`   Contact ID: ${contactId}`);
    log(`   UUID: ${TEST_INVESTOR_UUID}`);
    
    return { success: true, contactId };
  } catch (error) {
    logError(`Investor onboard failed: ${error.message}`);
    return { success: false, contactId: null };
  }
}

async function testAddToCampaign(contactId) {
  if (!config.campaign) {
    log('\n⏭️  Test 4: Add to Campaign (SKIPPED - no campaign ID provided)');
    return true;
  }

  log('\n🔍 Test 4: Add to Campaign');
  log('─'.repeat(60));

  const url = `${config.base}/.netlify/functions/mautic-sync`;
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Origin': config.origin,
      },
      body: {
        action: 'add_to_campaign',
        contactId: contactId,
        campaignId: parseInt(config.campaign, 10),
      },
    });

    if (!response.ok) {
      logError(`Add to campaign failed with status ${response.status}`);
      logError(`Response: ${JSON.stringify(response.data)}`);
      return false;
    }

    log(`✅ Added to campaign successfully`);
    log(`   Contact ID: ${contactId}`);
    log(`   Campaign ID: ${config.campaign}`);
    
    return true;
  } catch (error) {
    logError(`Add to campaign failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function runSmokeTests() {
  log('🚀 Starting Smoke Tests');
  log('='.repeat(60));
  log(`Base URL: ${config.base}`);
  log(`Origin: ${config.origin}`);
  log(`Campaign: ${config.campaign || 'NOT SET'}`);
  log(`Test UUID: ${TEST_INVESTOR_UUID}`);
  log('='.repeat(60));

  const results = {
    corsOptions: false,
    mauticPing: false,
    investorOnboard: false,
    addToCampaign: false,
  };

  // Run tests sequentially
  results.corsOptions = await testCorsOptions();
  results.mauticPing = await testMauticPing();
  
  const onboardResult = await testInvestorOnboard();
  results.investorOnboard = onboardResult.success;
  
  if (onboardResult.success && onboardResult.contactId) {
    results.addToCampaign = await testAddToCampaign(onboardResult.contactId);
  }

  // Summary
  log('\n📊 Test Summary');
  log('='.repeat(60));
  log(`CORS Preflight:     ${results.corsOptions ? '✅ PASS' : '❌ FAIL'}`);
  log(`Mautic Ping:        ${results.mauticPing ? '✅ PASS' : '❌ FAIL'}`);
  log(`Investor Onboard:   ${results.investorOnboard ? '✅ PASS' : '❌ FAIL'}`);
  log(`Add to Campaign:    ${config.campaign ? (results.addToCampaign ? '✅ PASS' : '❌ FAIL') : '⏭️  SKIP'}`);
  log('='.repeat(60));

  // Determine overall success
  const requiredTests = [
    results.corsOptions,
    results.mauticPing,
    results.investorOnboard,
  ];

  // Campaign test is only required if campaign ID was provided
  if (config.campaign) {
    requiredTests.push(results.addToCampaign);
  }

  const allPassed = requiredTests.every(result => result === true);
  const passedCount = requiredTests.filter(r => r).length;
  const totalCount = requiredTests.length;

  if (allPassed) {
    log(`\n✅ ALL TESTS PASSED (${passedCount}/${totalCount})`);
    log(`\nSmoke test completed successfully!`);
    logFile.end();
    process.exit(0);
  } else {
    logError(`\n❌ TESTS FAILED (${passedCount}/${totalCount} passed)`);
    logError(`\nSmoke test failed. Check smoke.log for details.`);
    logFile.end();
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  logError(error.stack);
  logFile.end();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  logError(error.stack);
  logFile.end();
  process.exit(1);
});

// Run tests
runSmokeTests();
