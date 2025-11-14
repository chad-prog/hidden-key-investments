import { z } from 'zod';
import { CamelDealInput, SnakeDealInput } from './zodSchemas.js';

/**
 * normalizeDealInput
 * Accepts either camelCase (frontend-friendly) OR snake_case (backend-expected)
 * Returns snake_case validated payload for the Netlify function.
 */
export function normalizeDealInput(input: unknown) {
  // First try camelCase
  const camel = CamelDealInput.safeParse(input);
  if (camel.success) {
    const v = camel.data;
    const snake = {
      address: v.address,
      purchase_price: v.purchasePrice,
      down_payment: v.downPaymentPct,
      interest_rate: v.interestRatePct,
      term_years: v.amortYears,
      rent_monthly: v.grossRentsMonthly,
      vacancy_pct: v.vacancyPct,
      op_ex_monthly: v.opExMonthly
    };
    return SnakeDealInput.parse(snake);
  }
  // Otherwise validate snake_case directly (supports server-to-server usage)
  return SnakeDealInput.parse(input);
}
