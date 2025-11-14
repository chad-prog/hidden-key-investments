// Node 22+ script: uses schemaAdapter to normalize camelCase -> snake_case
// Usage: node scripts/verify-analyze.js https://deploy-preview-XX--hidden-key-investments.netlify.app
import { normalizeDealInput } from '../src/maya/schemaAdapter.js';

const base = process.argv[2];
if (!base) {
  console.error('Usage: node scripts/verify-analyze.js <DEPLOY_PREVIEW_BASE_URL>');
  process.exit(1);
}
const url = `${base.replace(/\/$/, '')}/.netlify/functions/analyzeDeal`;

const input = {
  address: "123 Test St",
  purchasePrice: 350000,
  downPaymentPct: 0.25,
  interestRatePct: 6.5,
  amortYears: 30,
  grossRentsMonthly: 4200,
  vacancyPct: 0.05,
  opExMonthly: 1200
};

const payload = normalizeDealInput(input);
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
const text = await res.text();
try { console.log(JSON.stringify(JSON.parse(text), null, 2)); }
catch { console.log(text); }
