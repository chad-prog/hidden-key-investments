import type { Handler } from "@netlify/functions";
import { normalizeDealInput } from "../../src/maya/schemaAdapter";

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
    console.log("Analyzing deal...", { incoming_body: raw });
    const input = normalizeDealInput(raw);
    const result = await computeDealAnalysis(input);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err: any) {
    console.error("Deal analysis error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to analyze deal",
        message: err.message || "Unknown error"
      })
    };
  }
};
