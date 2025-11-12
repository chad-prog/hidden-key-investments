import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.PORT || 8787);
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || "";

function verifyV3(method: string, url: string, rawBody: string, signature?: string, timestamp?: string) {
  if (!signature || !timestamp) return false;
  const source = `${method.toUpperCase()}${url}${rawBody}${timestamp}`;
  const digest = crypto.createHmac("sha256", CLIENT_SECRET).update(source, "utf8").digest("base64");
  try { return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest)); } catch { return false; }
}

http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    const sig = req.headers["x-hubspot-signature-v3"] as string | undefined;
    const ts  = req.headers["x-hubspot-request-timestamp"] as string | undefined;
    const ok = verifyV3(req.method || "POST", `http://localhost:${PORT}${req.url}`, raw, sig, ts);
    res.writeHead(ok ? 204 : 401, { "content-type": "application/json" });
    res.end(ok ? "" : JSON.stringify({ error: "invalid_signature" }));
    console.log(`[tester] ${ok ? "OK" : "FAIL"} ${req.method} ${req.url} len=${raw.length}`);
  });
}).listen(PORT, () => console.log(`[tester] listening on http://localhost:${PORT}`));
