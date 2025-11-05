import { AnalysisResultZ, DealZ } from "../maya/zodSchemas";

export async function submitDeal(url: string, payload: unknown, cohort: "A"|"B" = "A") {
  const deal = DealZ.parse(payload); // input guard (client)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-ab-cohort": cohort },
    body: JSON.stringify(deal)
  });
  const json = await res.json();
  // ✅ one-line response validator before rendering:
  const parsed = AnalysisResultZ.parse(json);
  return parsed;
}
