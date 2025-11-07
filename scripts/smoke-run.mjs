#!/usr/bin/env node
/**
 * smoke-run.mjs - Self-contained smoke test runner for HKI investor onboard endpoints
 * Node 22+ required, no external dependencies
 * 
 * Usage:
 *   node scripts/smoke-run.mjs --base=https://staging.example.com --origin=https://app.example.com --campaign=123
 *   SMOKE_BASE=https://... node scripts/smoke-run.mjs
 * 
 * Exit codes:
 *   0 = all required steps passed
 *   1 = one or more required steps failed
 */

import { randomUUID } from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import fs from 'node:fs';

// Parse CLI args and environment
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  
  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      parsed[match[1]] = match[2];
    }
  }
  
  return {
    base: parsed.base || process.env.SMOKE_BASE || '',
    origin: parsed.origin || process.env.SMOKE_ORIGIN || '',
    campaign: parsed.campaign || process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME || ''
  };
}

// HTTP/HTTPS request helper
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 30000
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Log helpers
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Append to smoke.log
  try {
    fs.appendFileSync('smoke.log', logEntry + '\n');
    if (data) {
      fs.appendFileSync('smoke.log', JSON.stringify(data, null, 2) + '\n');
    }
  } catch (err) {
    // Ignore write errors
  }
}

function logPass(step) {
  log(`✅ PASS: ${step}`);
}

function logFail(step, error) {
  log(`❌ FAIL: ${step}`, { error: error.message || error });
}

// Test steps
async function testCorsOptions(base, origin) {
  log('Step 1: Testing CORS OPTIONS request to investor-onboard');
  
  const url = `${base}/.netlify/functions/investor-onboard`;
  
  try {
    const response = await request(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Expected 200/204, got ${response.status}`);
    }
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    if (!allowOrigin || (allowOrigin !== origin && allowOrigin !== '*')) {
      throw new Error(`CORS header missing or invalid: ${allowOrigin}`);
    }
    
    logPass('CORS OPTIONS');
    return true;
  } catch (error) {
    logFail('CORS OPTIONS', error);
    return false;
  }
}

async function testMauticPing(base) {
  log('Step 2: Testing POST ping to mautic-sync');
  
  const url = `${base}/.netlify/functions/mautic-sync`;
  const payload = JSON.stringify({ action: 'ping' });
  
  try {
    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    logPass('Mautic ping');
    return true;
  } catch (error) {
    logFail('Mautic ping', error);
    return false;
  }
}

async function testInvestorUpsert(base, origin) {
  log('Step 3: Testing POST investor upsert to investor-onboard');
  
  const url = `${base}/.netlify/functions/investor-onboard`;
  const stableUUID = randomUUID();
  const timestamp = Date.now();
  
  const payload = JSON.stringify({
    email: `smoke-test-${timestamp}@example.com`,
    firstName: 'Smoke',
    lastName: 'Test',
    phone: '+15555550123',
    investorType: 'individual',
    investmentInterest: 'real-estate',
    uuid: stableUUID
  });
  
  try {
    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Origin': origin
      },
      body: payload
    });
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected 200/201, got ${response.status}`);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      throw new Error('Response body is not valid JSON');
    }
    
    // Try to extract contactId from various possible response shapes
    let contactId = null;
    if (responseData.contactId) {
      contactId = responseData.contactId;
    } else if (responseData.data && responseData.data.contactId) {
      contactId = responseData.data.contactId;
    } else if (responseData.contact && responseData.contact.id) {
      contactId = responseData.contact.id;
    }
    
    log('Investor upsert response', { contactId, status: response.status });
    logPass('Investor upsert');
    return contactId;
  } catch (error) {
    logFail('Investor upsert', error);
    return null;
  }
}

async function testAddToCampaign(base, contactId, campaignId) {
  log(`Step 4: Testing add contact ${contactId} to campaign ${campaignId}`);
  
  const url = `${base}/.netlify/functions/mautic-sync`;
  const payload = JSON.stringify({
    action: 'add_to_campaign',
    contactId: contactId,
    campaignId: campaignId
  });
  
  try {
    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    logPass('Add to campaign');
    return true;
  } catch (error) {
    logFail('Add to campaign', error);
    return false;
  }
}

// Main execution
async function main() {
  log('=== HKI Smoke Test Runner ===');
  
  const config = parseArgs();
  log('Configuration', config);
  
  // Validate required config
  if (!config.base) {
    log('❌ ERROR: BASE URL is required (--base or SMOKE_BASE)');
    process.exit(1);
  }
  
  if (!config.origin) {
    log('⚠️  WARNING: ORIGIN not provided, using BASE as fallback');
    config.origin = config.base;
  }
  
  const results = {
    corsOptions: false,
    mauticPing: false,
    investorUpsert: false,
    addToCampaign: 'skipped'
  };
  
  // Required tests
  results.corsOptions = await testCorsOptions(config.base, config.origin);
  results.mauticPing = await testMauticPing(config.base);
  
  const contactId = await testInvestorUpsert(config.base, config.origin);
  results.investorUpsert = contactId !== null;
  
  // Optional test (only if campaign ID provided)
  if (config.campaign && contactId) {
    results.addToCampaign = await testAddToCampaign(config.base, contactId, config.campaign);
  } else if (config.campaign && !contactId) {
    log('⚠️  WARNING: Skipping campaign test (no contactId from upsert)');
    results.addToCampaign = false;
  } else {
    log('⚠️  INFO: Skipping campaign test (no campaign ID provided)');
    results.addToCampaign = 'skipped';
  }
  
  // Summary
  log('=== Test Results ===');
  log(`CORS OPTIONS: ${results.corsOptions ? 'PASS' : 'FAIL'}`);
  log(`Mautic Ping: ${results.mauticPing ? 'PASS' : 'FAIL'}`);
  log(`Investor Upsert: ${results.investorUpsert ? 'PASS' : 'FAIL'}`);
  log(`Add to Campaign: ${results.addToCampaign === 'skipped' ? 'SKIPPED' : (results.addToCampaign ? 'PASS' : 'FAIL')}`);
  
  // Exit with appropriate code
  const requiredPassed = results.corsOptions && results.mauticPing && results.investorUpsert;
  
  if (requiredPassed) {
    log('✅ All required smoke tests PASSED');
    process.exit(0);
  } else {
    log('❌ One or more required smoke tests FAILED');
    process.exit(1);
  }
}

main().catch(error => {
  log('❌ FATAL ERROR', { error: error.message, stack: error.stack });
  process.exit(1);
});
