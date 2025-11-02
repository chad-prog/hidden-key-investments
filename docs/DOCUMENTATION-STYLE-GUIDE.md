# Documentation Style Guide

**Version:** 1.0  
**Purpose:** Maintain consistency across all documentation files  
**Applies to:** All markdown files in this repository

---

## Document Header Format

All documentation files should include a consistent header:

```markdown
# Document Title

**Version:** 1.0  
**Purpose:** Brief description of the document  
**Audience:** Who should read this (optional)  
**Read Time:** Estimated minutes (optional)  
**Note:** Check git history for update timeline
```

### Header Fields:

- **Version:** Use semantic versioning (1.0, 1.1, 2.0, etc.)
- **Purpose:** One-line description of the document's purpose
- **Audience:** Target readers (Developer, Product Owner, Everyone, etc.) - optional
- **Read Time:** Estimated reading time in minutes - optional
- **Note:** Always use "Check git history for update timeline" instead of hard-coded dates

### DO NOT:
- ❌ Include hard-coded dates (e.g., "Last Updated: November 2, 2025")
- ❌ Include "Last Updated" or "Created" fields with specific dates
- ❌ Manually maintain update timestamps

### DO:
- ✅ Use version numbers (semantic versioning)
- ✅ Reference git history for date information
- ✅ Include consistent metadata fields
- ✅ Keep headers concise and scannable

---

## Date Handling

**Rule:** Never include hard-coded dates in documentation.

**Rationale:**
- Hard-coded dates require manual maintenance
- Easy to forget to update
- Git provides automatic date tracking
- Reduces maintenance burden

**Instead of this:**
```markdown
**Last Updated:** November 2, 2025
```

**Use this:**
```markdown
**Version:** 1.0  
**Note:** Check git history for update timeline
```

---

## File Organization

### Folder Structure:
```
docs/
├── 00-START-HERE/      # Entry points
├── 01-GETTING-STARTED/ # Setup guides
├── 02-ARCHITECTURE/    # Technical design
├── 03-FEATURES/        # Feature docs
├── 04-DEVELOPMENT/     # Dev workflows
├── 05-DEPLOYMENT/      # Operations
├── 06-VISION-ROADMAP/  # Planning
├── 07-REFERENCE/       # Quick reference
└── archive/            # Historical
```

### Category README Format:
Each category folder should include a README.md with:
- Category purpose
- What belongs in the category
- Recommended reading order
- Estimated time commitment

---

## Link Format

### Internal Links:
- **Preferred:** Use repository-relative paths
  - Example: `[Setup Guide](../SETUP-GUIDE.md)`
  - Example: `[Architecture](ARCHITECTURE.md)`
  
- **Avoid:** Relative paths with `../`
  - Why: Breaks if files are moved
  - Exception: Within the same directory level

### External Links:
- Always include descriptive link text
- Include (external link) notation if helpful

---

## Formatting Standards

### Headings:
```markdown
# H1 - Document Title (only one per file)
## H2 - Major Sections
### H3 - Subsections
#### H4 - Details (use sparingly)
```

### Emphasis:
- **Bold** for important terms
- *Italic* for emphasis
- `Code` for commands, filenames, variables

### Lists:
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Maintain consistent indentation (2 spaces)

### Code Blocks:
````markdown
```bash
# Use language identifiers
command goes here
```
````

---

## Special Elements

### Checkboxes:
```markdown
- [ ] Incomplete task
- [x] Complete task
```

### Status Indicators:
- ✅ Complete/Success
- ❌ Error/Failed
- ⚠️ Warning/Caution
- 🎯 Goal/Target
- 📊 Metrics/Data
- 🚀 Quick Start
- 💡 Tip/Hint
- ⭐ Important/Featured

### Tables:
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

---

## Content Guidelines

### Read Time Estimates:
Include estimated read times for documents over 500 words:
- Short: 5 minutes
- Medium: 10-20 minutes
- Long: 30+ minutes

### Prerequisites:
If a document requires prior knowledge, list it at the top:
```markdown
**Prerequisites:**
- Understanding of X
- Completion of Y
```

### Next Steps:
End with clear next steps or related documents:
```markdown
**Next Steps:**
- [Architecture Guide](ARCHITECTURE.md)
- [Testing Guide](TESTING-GUIDE.md)
```

---

## Version Control

### When to Increment Version:
- **1.0 → 1.1:** Minor updates, corrections, clarifications
- **1.x → 2.0:** Major restructuring, significant new content
- **2.x → 3.0:** Complete rewrite

### How to Track Changes:
- Git commit messages provide detailed change history
- Version number in header shows major/minor updates
- No need for changelog in document itself

---

## Review Checklist

Before committing documentation:

- [ ] Header includes version and "Check git history" note
- [ ] No hard-coded dates anywhere
- [ ] Links are repository-relative
- [ ] Formatting is consistent
- [ ] Read time estimate included (if applicable)
- [ ] Code blocks have language identifiers
- [ ] Status indicators used appropriately
- [ ] File is in correct category folder
- [ ] Spelling and grammar checked

---

## Examples

### Good Header Example:
```markdown
# Setup Guide

**Version:** 1.0  
**Purpose:** Initial project setup instructions  
**Audience:** New developers  
**Read Time:** 10 minutes  
**Note:** Check git history for update timeline
```

### Bad Header Example:
```markdown
# Setup Guide

Last Updated: November 2, 2025
Written by: John Doe
```

---

## Maintenance

### Adding New Documentation:
1. Create file in appropriate category folder
2. Add proper header with version 1.0
3. Update DOCUMENTATION-INDEX.md
4. Update DOCUMENTATION-CATALOG.md
5. Add to relevant learning path if applicable

### Updating Existing Documentation:
1. Make content changes
2. Increment version number appropriately
3. Update catalog if description changes
4. Verify all links still work
5. Git commit message describes changes

---

## Tools & Automation

### Automation Script:
`scripts/organize-docs.sh` creates the folder structure

**Usage:**
```bash
bash scripts/organize-docs.sh
```

### Future Enhancements:
- Documentation linter (check for hard-coded dates)
- Automated version bumping
- Link checker
- Spell checker integration

---

**Version:** 1.0  
**Applies to:** All documentation in this repository  
**Note:** Check git history for style guide updates
