import type { Handler } from "@netlify/functions";
import { AnalysisResultZ, DealZ } from "../../src/maya/zodSchemas";

// Import crypto at the module level for efficiency
import * as nodeCrypto from "node:crypto";

// Helper to get the crypto object, preferring globalThis.crypto if available
function getCrypto() {
  return globalThis.crypto ?? nodeCrypto;
}

// Minimal stub: replace computeDealAnalysis with your real compute
async function computeDealAnalysis(deal: any) {
  const now = new Date().toISOString();
  return {
    id: getCrypto().randomUUID(),
    metrics: { roi: 0.15, irr: 0.12, npv: 10000, cash_flow: [8000, 8000, 8000] },
    risk: { score: 0.42, category: "Medium", vector: { leverage: 0.3 }, mitigations: ["Increase down payment"] },
    explainability: { scoring_logic: "Score = Σ(w_i * f_i)", feature_attribution: [], inputs_used: { deal } },
    created_at: now
  };
}

export const handler: Handler = async (event) => {
  try {
    const raw = event.body || "{}";
    // helpful server logs
    console.log("[analyzeDeal] incoming body:", raw);
    const input = DealZ.parse(JSON.parse(raw));
    const result = await computeDealAnalysis(input);
    const safe = AnalysisResultZ.parse(result); // server-side guard
    return { statusCode: 200, body: JSON.stringify(safe) };
  } catch (err: any) {
    // expose Zod issues during dev so we can fix fast
    const zodIssues = err?.issues ?? undefined;
    const msg = err?.message || "Bad Request";
    console.error("[analyzeDeal] error:", msg, zodIssues ?? "");
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: msg, issues: zodIssues }, null, 2)
    };
  }
};
