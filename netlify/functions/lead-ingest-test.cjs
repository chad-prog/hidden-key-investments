// Automated tests for lead-ingest function
const assert = require('assert');
const { handler } = require('./lead-ingest.cjs');

async function testPostValidLead() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', phone: '555-0000', source: 'test' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 201, 'Should return 201 for valid lead');
  const body = JSON.parse(res.body);
  assert.strictEqual(body.lead.name, 'Test User');
  assert.strictEqual(body.lead.email, 'test@example.com');
  console.log('testPostValidLead passed');
}

async function testPostMissingEmail() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ name: 'No Email' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 400, 'Should return 400 for missing email');
  const body = JSON.parse(res.body);
  assert.ok(body.error, 'Should return error for missing email');
  console.log('testPostMissingEmail passed');
}

async function testGetLeads() {
  const event = { httpMethod: 'GET' };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 200, 'Should return 200 for GET');
  const body = JSON.parse(res.body);
  assert.ok(Array.isArray(body.leads), 'Should return leads array');
  console.log('testGetLeads passed');
}

async function runTests() {
  await testPostValidLead();
  await testPostMissingEmail();
  await testGetLeads();
  console.log('All tests passed');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
