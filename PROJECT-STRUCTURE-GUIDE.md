# Project Structure Guide

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Read Time:** 10 minutes

---

## 📋 Overview

This guide explains the organization and structure of the Hidden Key Investments platform codebase.

## 🗂️ Directory Structure

```
hidden-key-investments/
├── src/                          # Source code
│   ├── components/              # React components
│   │   ├── crm/                # CRM-specific components
│   │   ├── ui/                 # Reusable UI components (buttons, cards, etc.)
│   │   └── __tests__/          # Component tests
│   ├── lib/                    # Utility libraries and schemas
│   │   ├── schemas/            # Zod validation schemas
│   │   └── __tests__/          # Library tests
│   ├── pages/                  # Page components
│   │   └── __tests__/          # Page tests
│   ├── utils/                  # Utility functions
│   └── styles/                 # CSS and styling
│
├── netlify/                    # Netlify deployment configuration
│   └── functions/             # Serverless functions
│       └── tests/             # Function tests
│
├── docs/                      # Documentation
│   ├── 00-START-HERE/        # Essential starting guides
│   ├── 01-GETTING-STARTED/   # Setup and installation
│   ├── 02-ARCHITECTURE/      # System design
│   ├── 03-FEATURES/          # Feature specifications
│   ├── 04-DEVELOPMENT/       # Development guides
│   ├── 05-DEPLOYMENT/        # Deployment guides
│   ├── 06-VISION-ROADMAP/    # Planning and roadmaps
│   └── 07-REFERENCE/         # Quick references
│
├── scripts/                   # Build and utility scripts
├── supabase-sql/             # Database schemas and migrations
├── public/                   # Static assets
└── dist/                     # Production build output (generated)
```

## 📦 Key Directories Explained

### `/src` - Application Source Code

The main application code organized by type:

- **`components/`** - Reusable React components
  - `crm/` - CRM-specific components (InvestorCard, LeadTable, etc.)
  - `ui/` - Generic UI components from shadcn/ui
  - `__tests__/` - Component test files

- **`lib/`** - Business logic and utilities
  - `schemas/` - Zod validation schemas for data models
  - `workflowEngine.ts` - Automation engine
  - `featureFlags.tsx` - Feature flag system
  - `envValidation.ts` - Environment validation

- **`pages/`** - Page-level components
  - Each file represents a route/page in the application
  - Tests colocated in `__tests__/` subdirectory

- **`utils/`** - Helper functions and utilities
  - Email marketing, Airtable sync, and other integrations

### `/netlify` - Serverless Functions

Backend API endpoints deployed as Netlify Functions.

### `/docs` - Documentation

Comprehensive project documentation organized by category.

### `/scripts` - Automation Scripts

Development and build automation scripts.

## 🏗️ Architecture Patterns

### Component Organization

Components follow a hierarchical structure with pages at the top, feature components in the middle, and reusable UI components at the bottom.

### Import Aliases

The project uses path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/button';
import { LeadCreateSchema } from '@/lib/schemas/crm';
```

## 🧪 Testing Structure

Tests are colocated with the code they test in `__tests__/` subdirectories.

## 📝 Configuration Files

Root level configuration includes package.json, TypeScript, Vite, and other tool configurations.

## 📚 Further Reading

- [Architecture Guide](docs/ARCHITECTURE.md) - System design details
- [Development Guide](docs/QUICK-START.md) - Getting started
- [Testing Guide](docs/TESTING-GUIDE.md) - Testing practices

---

**Questions?** See [Documentation Index](DOCUMENTATION-INDEX.md) for more guides.
