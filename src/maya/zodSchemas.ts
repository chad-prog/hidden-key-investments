import * as z from "zod";
export const DealZ = z.object({
  purchase_price: z.number().nonnegative(),
  down_payment: z.number().nonnegative(),
  interest_rate: z.number().min(0).max(1),
  term_years: z.number().int().min(1),
  rent_monthly: z.number().nonnegative(),
  vacancy_rate: z.number().min(0).max(1).optional(),
  operating_expenses_annual: z.number().nonnegative().optional(),
  capex_annual: z.number().nonnegative().optional(),
  exit_year: z.number().int().min(1).optional(),
  exit_cap_rate: z.number().min(0).max(1).optional(),
  comparables: z.array(z.object({ price: z.number(), rent: z.number() })).optional()
});
export const AnalysisResultZ = z.object({
  id: z.string(),
  metrics: z.object({
    roi: z.number(),
    irr: z.number(),
    npv: z.number(),
    cash_flow: z.array(z.number()).optional()
  }),
  risk: z.object({
    score: z.number(),
    category: z.enum(["Low","Medium","High"]),
    vector: z.record(z.number()).optional(),
    mitigations: z.array(z.string()).optional()
  }),
  comps: z.object({ zscore: z.number().optional(), percentile: z.number().optional() }).partial().optional(),
  explainability: z.object({
    scoring_logic: z.string(),
    feature_attribution: z.array(z.object({
      feature: z.string(),
      weight: z.number(),
      value: z.number(),
      contribution: z.number(),
      why: z.string().optional()
    })).optional(),
    inputs_used: z.record(z.any()).optional()
  }),
  created_at: z.string().optional()
});
