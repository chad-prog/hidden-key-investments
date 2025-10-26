<<<<<<< HEAD
# Local Development Setup

## Prerequisites
- Node.js v22 or later (recommended: use nvm for Node version management)
- npm v10 or later
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## Environment Setup
1. (Recommended) Install nvm (Node Version Manager):
   - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
   - Unix/macOS: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`

2. Install and use Node v22:
   ```bash
   nvm install 22
   nvm use 22
   ```

## Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/chad-prog/hidden-key-investments.git
   cd hidden-key-investments
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The dev server will start at http://localhost:3000

4. Build for production:
   ```bash
   npm run build
   ```
   Output will be in the `dist` directory.

## Config Files
- `vite.config.ts` - Vite build and dev server configuration
  - Uses path alias `@` pointing to `./src` for imports like `@/lib/utils`
- `tsconfig.json` - TypeScript configuration for the app
- `tsconfig.node.json` - TypeScript configuration for build tools
- `postcss.config.js` - PostCSS configuration for CSS processing
- `tailwind.config.js` - Tailwind CSS configuration

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Troubleshooting

### Dev Server Issues
If the dev server doesn't start:
1. Check if port 3000 is in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   # Unix/macOS
   lsof -i :3000
   ```
2. Kill any existing processes or change the port in `vite.config.ts`

### Build Issues
If you encounter build errors:
1. Clear the cache and node_modules:
   ```bash
   rm -rf node_modules
   npm cache clean --force
   npm install
   ```
2. Verify Node version matches .nvmrc:
   ```bash
   node -v  # should show v22.x.x
   ```

## Project Structure
```
├── src/                # Source code
│   ├── components/     # React components
│   ├── lib/           # Utility functions and helpers
│   └── styles/        # CSS and Tailwind styles
├── public/            # Static assets
└── dist/             # Production build output
```

## Code Style and Conventions
- Use TypeScript for type safety
- Follow ESLint rules for code style
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful commit messages

## Testing
Before submitting PRs:
1. Run `npm run build` to ensure it builds
2. Test in development with `npm run dev`
3. Check for TypeScript errors
4. Verify changes in different browsers
=======
LOCAL DEVELOPMENT

This file describes local setup, security guidance, Elite flows, and testing pointers.

1) Security hardening
- Never hardcode secrets, API keys, tokens, IDs or credentials in source.
- Use environment variables for all runtime values. In Vite, expose only public values via VITE_* prefix.
- Add sensitive server-side integrations to serverless functions or separate backend — don't put real keys in client code.
- Keep `.env` out of the repo. Commit an `.env.example` with empty placeholders only (no secrets).

2) Elite-ready integrations (high level)
- The Accredited Investors form reads `VITE_FORMSPREE_ENDPOINT` from env and falls back to demo mode if missing.
- Mailchimp and Airtable utilities run in demo mode on the client (they simulate/enqueue events). Real sync should be via serverless endpoint (e.g., Netlify Functions) using server-side secrets.
- Provide clear UI feedback after submission and show an "Automation Log" sidebar for visibility. In demo mode the log shows simulated actions.

3) Netlify & environment
- Netlify environment variables (set in Netlify UI):
  - `VITE_FORMSPREE_ENDPOINT` (Formspree endpoint)
  - `AIRTABLE_BASE_ID`, `AIRTABLE_API_KEY`, `AIRTABLE_TABLE_NAME` (server-only; do not expose in VITE_ vars)
  - `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID` (server-only; do not expose in VITE_ vars)
- In Netlify's Site settings -> Build & deploy -> Environment, add the VITE_* variables only if safe; server-only secrets must be added to serverless function environment or Netlify build environment (but be mindful of public exposure).
- `netlify.toml` should use:
  [build]
  command = "npm run build"
  publish = "dist"

  [[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

4) Demo mode design
- When an env var (VITE_FORMSPREE_ENDPOINT) is missing, the client should:
  - Submit to a local demo handler that resolves successfully.
  - Add simulated automation entries to the Automation Log (Mailchimp: "Simulated subscribe", Airtable: "Simulated record created").
  - NEVER throw or fail the UI because of missing env.

5) Developer workflow (local)
- Install Node (recommended via nvm):
  nvm install 22
  nvm use 22
- Install dependencies:
  npm install
- Start dev server:
  npm run dev
- Build production bundle:
  npm run build
- Preview production:
  npm run preview

6) Troubleshooting
- If dev server doesn't respond, ensure no other process is blocking port 3000:
  netstat -ano | findstr :3000
- If build fails, clear cache:
  rm -rf node_modules dist
  npm cache clean --force
  npm install

7) Testing Elite flow (manual)
- In Netlify set only `VITE_FORMSPREE_ENDPOINT` for a live Formspree endpoint.
- Deploy, visit the Accredited Investors page, submit the form.
- Check Automation Log for Mailchimp/Airtable actions; if envs are missing, log shows simulated actions.

8) Commit checklist before PR
- No hardcoded keys in source
- `env.example` updated with placeholders
- `LOCAL-DEVELOPMENT.md` added
- Build passes locally: `npm run build`

-- End of LOCAL-DEVELOPMENT.md
>>>>>>> cleanup/merge-ready
