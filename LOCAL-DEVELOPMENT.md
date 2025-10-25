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