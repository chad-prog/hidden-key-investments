# Documentation Templates

This directory contains templates for creating consistent, high-quality documentation.

## Available Templates

### 1. Standard Document Template
**File:** `DOCUMENT-TEMPLATE.md`

Use for comprehensive guides, feature documentation, and architectural documents.

**Includes:**
- Metadata section (version, date, read time, category, tags)
- Overview and goals
- Content sections with examples
- Related documentation links
- Change log

**Example usage:**
```bash
cp docs/.templates/DOCUMENT-TEMPLATE.md docs/NEW-FEATURE-GUIDE.md
# Edit NEW-FEATURE-GUIDE.md with your content
```

### 2. Quick Reference Template
**File:** `QUICK-REFERENCE-TEMPLATE.md`

Use for command references, cheat sheets, and quick lookup guides.

**Includes:**
- Quick commands section
- Common tasks with examples
- Configuration table
- Troubleshooting tips
- Links to full documentation

**Example usage:**
```bash
cp docs/.templates/QUICK-REFERENCE-TEMPLATE.md docs/GIT-QUICK-REFERENCE.md
# Edit GIT-QUICK-REFERENCE.md with your content
```

## Template Guidelines

### When to Use Each Template

**Standard Document Template:**
- Feature guides and tutorials
- Architecture documentation
- Development guides
- Deployment instructions
- Best practices and conventions

**Quick Reference Template:**
- Command-line references
- API quick references
- Configuration cheat sheets
- Keyboard shortcuts
- Common workflow reminders

### Best Practices

1. **Always fill in metadata** - Version, date, read time help readers
2. **Use consistent formatting** - Follow the template structure
3. **Include examples** - Show, don't just tell
4. **Link related docs** - Help readers find more information
5. **Keep it current** - Update the "Last Updated" date when changing
6. **Add to catalog** - Run `npm run docs:catalog` after creating new docs

### After Creating a New Document

1. Fill in all template placeholders
2. Remove any sections you don't need
3. Add relevant code examples
4. Link to/from related documents
5. Run documentation linter:
   ```bash
   npm run docs:lint
   ```
6. Update the catalog:
   ```bash
   npm run docs:catalog
   ```
7. Test in the documentation portal:
   ```bash
   npm run dev
   # Navigate to http://localhost:5173/docs
   ```

## Contributing

Have a suggestion for a new template or improvements to existing ones?

1. Create a new template file in this directory
2. Update this README with details
3. Submit a pull request

## Questions?

See [Documentation System Guide](../../DOCUMENTATION-SYSTEM-GUIDE.md) for more information about the documentation system.
