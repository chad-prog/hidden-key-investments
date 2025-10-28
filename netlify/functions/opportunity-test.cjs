// Automated tests for opportunity endpoint
const assert = require('assert');
const { handler } = require('./opportunity.cjs');

async function testCreateOpportunity() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ title: 'Deal One', value: 50000, stage: 'new', notes: 'First deal' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 201, 'Should create opportunity');
  const body = JSON.parse(res.body);
  assert.strictEqual(body.opportunity.title, 'Deal One');
  console.log('testCreateOpportunity passed');
}

async function testDuplicateOpportunity() {
  await handler({ httpMethod: 'POST', body: JSON.stringify({ title: 'Deal One', value: 50000 }) }, {});
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ title: 'Deal One', value: 60000 })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 409, 'Should reject duplicate title');
  console.log('testDuplicateOpportunity passed');
}

async function testInvalidStage() {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ title: 'Deal Two', value: 10000, stage: 'invalid' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 400, 'Should reject invalid stage');
  console.log('testInvalidStage passed');
}

async function testStageTransition() {
  await handler({ httpMethod: 'POST', body: JSON.stringify({ title: 'Deal Three', value: 20000, stage: 'new' }) }, {});
  const event = {
    httpMethod: 'PATCH',
    body: JSON.stringify({ id: 2, stage: 'review' })
  };
  const res = await handler(event, {});
  assert.strictEqual(res.statusCode, 200, 'Should update stage');
  const body = JSON.parse(res.body);
  assert.strictEqual(body.opportunity.stage, 'review');
  console.log('testStageTransition passed');
}

async function runTests() {
  await testCreateOpportunity();
  await testDuplicateOpportunity();
  await testInvalidStage();
  await testStageTransition();
  console.log('All opportunity tests passed');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
