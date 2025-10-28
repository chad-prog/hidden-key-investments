// Automated tests for investor endpoint
const assert = require('assert');
const { handler } = require('./investor.cjs');

async function testCreateInvestor() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ name: 'Investor Alpha', email: 'alpha@example.com', accredited: true })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 201, 'Should create investor');
  const body = JSON.parse(res.body);
  assert.strictEqual(body.investor.name, 'Investor Alpha');
  assert.strictEqual(body.investor.accredited, true);
  console.log('testCreateInvestor passed');
}

async function testDuplicateInvestor() {
  await handler({ httpMethod: 'POST', body: JSON.stringify({ name: 'Investor Alpha', email: 'alpha@example.com' }) }, {});
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ name: 'Investor Beta', email: 'alpha@example.com' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 409, 'Should reject duplicate email');
  console.log('testDuplicateInvestor passed');
}

async function testInvalidAccredited() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ name: 'Investor Gamma', email: 'gamma@example.com', accredited: 'yes' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 400, 'Should reject invalid accredited value');
  console.log('testInvalidAccredited passed');
}

async function runTests() {
  await testCreateInvestor();
  await testDuplicateInvestor();
  await testInvalidAccredited();
  console.log('All investor tests passed');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
