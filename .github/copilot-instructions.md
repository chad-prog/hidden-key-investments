# Copilot Instructions — Hidden Key Investments

Concise, repo-specific guidance for AI coding agents to be productive immediately.

## Big Picture
- React + Vite app in `src/` and Netlify serverless in `netlify/functions/` share types via Zod schemas in `src/lib/schemas/`.
- Standard API envelope across functions and client: `{ ok, data?, error?, correlationId, metadata? }` (see `netlify/functions/lead-ingest-enhanced.js`). Always return this shape.
- “Demo mode” is first-class: when env is missing, functions simulate success; UI degrades gracefully. Detect with `src/lib/envValidation.ts`.
- Data model centers on CRM entities (Lead/Opportunity/Investor/Activity) mirrored in SQL (`supabase-sql/schema.sql`) and Zod (`src/lib/schemas/crm.ts`). Keep names/types aligned.
- Observability: prefer `src/lib/observability.ts` for logging, error capture, correlation IDs, and performance metrics.

## Dev Workflows
- Frontend dev: `npm run dev` (Vite at http://localhost:3000 per `vite.config.ts`). Note: older docs may reference 5173; 3000 is canonical.
- Functions dev (options):
  - Netlify CLI (recommended, esp. for TypeScript): `netlify dev` proxies `/.netlify/functions/*` to `netlify/functions` and handles TS bundling.
  - Lightweight harness: `node dev-functions-server.cjs` then call `http://localhost:8888/.netlify/functions/health`. Harness only loads `.cjs` files; add a `.cjs` wrapper if you need to test TS/ESM via this path.
- Tests:
  - UI/unit: `npm test` (Vitest, jsdom, excludes function tests per `vitest.config.ts`).
  - Functions: `npm run test:functions` (uses `netlify/functions/vitest-config.js`).
  - Smoke: `npm run test:smoke` or `npm run smoke` for scripted flows.
- Linting: `npm run lint` / `lint:fix` (see ignores in `eslint.config.js`). CI runs lint, tests, build (`.github/workflows/ci.yml`).

## Conventions & Patterns
- Imports: use alias `@` → `src` (configured in `vite.config.ts` and `vitest.config.ts`).
- Validation: all inputs through Zod. UI forms use React Hook Form + Zod; APIs validate request bodies (see `lead-ingest-enhanced.js` + `LeadIngestSchema`).
- API client: `src/lib/apiClient.ts` targets `/.netlify/functions` and expects standard envelope + retry/backoff. If you add a function, expose an apiClient method and corresponding hook.
- Logging & IDs: include/propagate `correlationId` in function responses and client logs. Use `createLogger()` where possible.
- Feature flags and service config: query via `getConfigStatus()`; prefer `isDemoMode()` checks instead of hard-failing when keys are absent.
- Workflows: `src/lib/workflowEngine.ts` provides trigger/conditions/actions and default handlers. Functions should emit events or call workflow engine entry points (note TODO to share engine in functions bundle).

## Integration Points
- Supabase: server functions may use `@supabase/supabase-js`; env keys `SUPABASE_URL`, `SUPABASE_ANON_KEY` (service key if needed). Column naming is snake_case in SQL; map to camelCase in TS.
- Communications: SendGrid (`netlify/functions/sendgrid.ts`) supports template variable substitution and demo mode; Twilio SMS in `twilio-sms.ts` similar.
- Mautic: `mautic-sync.ts` and `mautic-webhook.ts`; `lead-ingest-enhanced.js` best-effort sync + optional campaign enrollment via `src/lib/mautic/*` deciders.

## Examples To Follow
- Serverless: `netlify/functions/lead-ingest-enhanced.js` (Zod validation, demo mode, correlationId, standardized response).
- Client data flow: `src/lib/apiClient.ts` + hooks (`useLeads`, `useCreateLead`).
- UI patterns: `src/components/crm/InvestorProfile.tsx`, `src/components/LeadCaptureForm.tsx`, shadcn in `src/components/ui/`, Tailwind tokens in `tailwind.config.js`.
- Schemas: `src/lib/schemas/crm.ts` as single source of truth aligning with `supabase-sql/schema.sql`.
- Additional functions: `netlify/functions/sendgrid.ts` (templated email + demo mode), `netlify/functions/mautic-webhook.ts` (webhook handling pattern).

## Function + Hook Example (Mini)
1) Serverless: `netlify/functions/hello.ts`
```ts
import type { Handler } from '@netlify/functions'
export const handler: Handler = async (event) => {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID()
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId },
    body: JSON.stringify({ ok: true, data: { msg: 'hello' }, correlationId })
  }
}
```
2) Client: add to `src/lib/apiClient.ts`
```ts
async hello(): Promise<ApiResponse<{ msg: string }>> {
  return this.request('/hello')
}
```
3) Hook usage in components
```ts
const { data, loading } = useApiData(() => apiClient.hello(), [])
```

## Add A Function + Hook (Checklist)
- Define/confirm Zod schema in `src/lib/schemas/` (or inline for small handlers).
- Implement serverless in `netlify/functions/` and return the standard envelope; include `correlationId`.
- Support demo mode: gracefully simulate success if required env is missing (see `lead-ingest-enhanced.js`).
- Expose client entrypoints:
  - Add method to `src/lib/apiClient.ts` targeting `/.netlify/functions/<name>`.
  - Add a React hook wrapper (`useXyz`) via `useApiData`/`useApiMutation` for components.
- Add tests:
  - Function tests in `netlify/functions/__tests__/` and opt-in via `vitest-config.js` there.
  - UI/unit tests colocated under `__tests__` next to code (see `src/lib/__tests__/`).
- Run locally with `netlify dev` (TS) or `.cjs` wrapper + `node dev-functions-server.cjs` (harness).

## Gotchas
- Local harness only loads `.cjs` files; for new TS/ESM functions use Netlify CLI or provide a `.cjs` wrapper for local testing.
- Keep the envelope stable: clients assume `ok` + `correlationId`. Don’t return raw bodies from functions.
- ESLint ignores some “corrupted” paths; don’t re-enable them without fixes (`eslint.config.js` top block).
- Netlify includes extra files in bundles (see `netlify.toml` `included_files`); import shared code from `src/` rather than duplicating.

## Testing Quicklinks
- Commands: `npm test`, `npm run test:functions`, `npm run test:smoke`.
- Functions tests: `netlify/functions/__tests__/lead-ingest-enhanced.test.js`, `netlify/functions/__tests__/sendgrid.test.ts`, `netlify/functions/vitest-config.js`.
- UI/lib tests: `src/lib/__tests__/envValidation.test.ts`, `src/lib/__tests__/testFixtures.test.ts`.

## When Adding Code
- Add Zod schemas and types first; wire UI/forms and functions to them.
- Surface new endpoints via `apiClient` with hooks for React usage.
- Respect demo mode and feature flags; prefer graceful no-op with logs over throwing.
- Add tests alongside code: UI in `__tests__` next to components; functions in `netlify/functions/__tests__/` and opt-in via that vitest config.

For deeper agent roles and standards, see `.github/agents/*.yaml` and `.github/agents/README.md`.

If present in the repo, also see `CLAUDE.md` for an extended assistant guide.