import { z } from 'zod';

export const CamelDealInput = z.object({
  address: z.string().min(1),
  purchasePrice: z.number(),
  downPaymentPct: z.number(),        // 0..1
  interestRatePct: z.number(),       // APR, e.g., 6.5
  amortYears: z.number().int(),
  grossRentsMonthly: z.number(),
  vacancyPct: z.number(),            // 0..1
  opExMonthly: z.number()
});

export const SnakeDealInput = z.object({
  address: z.string().min(1),
  purchase_price: z.number(),
  down_payment: z.number(),
  interest_rate: z.number(),
  term_years: z.number().int(),
  rent_monthly: z.number(),
  vacancy_pct: z.number(),
  op_ex_monthly: z.number()
});
