import { z } from 'zod';

export const CamelDealInput = z.object({
  address: z.string().min(1),
  purchasePrice: z.number().positive(),
  downPaymentPct: z.number(),        // 0..1
  interestRatePct: z.number().positive().max(100),       // APR, e.g., 6.5
  amortYears: z.number().int(),
  grossRentsMonthly: z.number().nonnegative(),
  vacancyPct: z.number(),            // 0..1
  opExMonthly: z.number().nonnegative()
});

export const SnakeDealInput = z.object({
  address: z.string().min(1),
  purchase_price: z.number().nonnegative(),
  down_payment: z.number().min(0).max(1),
  interest_rate: z.number().nonnegative(),
  term_years: z.number().int().min(1),
  rent_monthly: z.number().nonnegative(),
  vacancy_pct: z.number().min(0).max(1),
  op_ex_monthly: z.number().nonnegative()
});
