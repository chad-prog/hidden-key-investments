---
name: Pull Request
about: Standard pull request template
title: ''
labels: ''
assignees: ''
---

## Description

<!-- Provide a clear and concise description of the changes -->

### Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Style/UI update (non-functional changes)
- [ ] ♻️ Code refactor (no functional changes)
- [ ] ⚡️ Performance improvement
- [ ] ✅ Test additions or modifications
- [ ] 🔧 Configuration change
- [ ] 🚀 CI/CD pipeline update

## Related Issues

<!-- Link to related issues (e.g., Fixes #123, Closes #456, Related to #789) -->

Fixes #
Related to #

## Changes Made

<!-- List the specific changes made in this PR -->

- 
- 
- 

## Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed

### How to Test

<!-- Describe how reviewers can test these changes -->

1. 
2. 
3. 

### Test Results

<!-- Paste test output or screenshots -->

```bash
# Test command output
npm test
```

**Coverage Impact**: 
- Before: __%
- After: __%
- Change: +/-__%

## Screenshots/Recordings

<!-- If applicable, add screenshots or screen recordings to demonstrate changes -->

### Before

<!-- Screenshot/recording of the old behavior -->

### After

<!-- Screenshot/recording of the new behavior -->

## Checklist

### Code Quality

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added to complex or unclear code
- [ ] No console.logs or debugging code left in
- [ ] No commented-out code blocks
- [ ] Error handling added where appropriate

### Testing

- [ ] All existing tests pass locally (`npm test`)
- [ ] New tests added for new functionality
- [ ] Tests cover edge cases and error conditions
- [ ] Coverage meets or exceeds project standards (60%)

### Building

- [ ] Build completes successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors (warnings acceptable if documented)

### Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Inline code comments added for complex logic
- [ ] CHANGELOG.md updated (if applicable)

### Security

- [ ] No secrets or credentials committed
- [ ] Environment variables used for sensitive data
- [ ] Security scan passes (Trivy)
- [ ] Dependencies reviewed for vulnerabilities
- [ ] Input validation added where needed

### Performance

- [ ] No performance regressions introduced
- [ ] Large files handled efficiently
- [ ] Database queries optimized (if applicable)
- [ ] Bundle size impact minimal

### Deployment

- [ ] Environment variables documented (if new ones added)
- [ ] Database migrations included (if schema changes)
- [ ] Backward compatible (or migration plan documented)
- [ ] Deployment runbook updated (if needed)

## Breaking Changes

<!-- If this PR includes breaking changes, describe them here -->

**None** or:

- 
- 

### Migration Guide

<!-- If breaking changes exist, provide migration instructions -->

## Deployment Notes

<!-- Any special considerations for deployment -->

- [ ] Requires database migration
- [ ] Requires environment variable updates
- [ ] Requires cache invalidation
- [ ] Requires service restart
- [ ] Can be deployed independently
- [ ] Requires coordinated deployment

### Rollback Plan

<!-- How to rollback if this deployment causes issues -->

1. 
2. 

## Performance Impact

<!-- Describe any performance implications -->

- **Bundle Size**: +/- ___ KB
- **Build Time**: +/- ___ seconds
- **Test Duration**: +/- ___ seconds
- **Runtime Impact**: None / Minimal / Moderate / Significant

## Dependencies

<!-- List any new dependencies or version updates -->

### Added
- 

### Updated
- 

### Removed
- 

## Reviewer Notes

<!-- Any specific areas you want reviewers to focus on -->

Please pay special attention to:

- 
- 

## Additional Context

<!-- Add any other context about the PR here -->

---

## For Reviewers

### Review Checklist

- [ ] Code changes are clear and understandable
- [ ] Tests adequately cover the changes
- [ ] Documentation is complete and accurate
- [ ] No security concerns identified
- [ ] Performance impact is acceptable
- [ ] Breaking changes are justified and documented
- [ ] CI/CD checks pass

### Questions for Author

<!-- Reviewers: Add any questions here -->

---

**Estimated Review Time**: ___ minutes
**Priority**: Low / Medium / High / Critical
**Target Merge Date**: YYYY-MM-DD (if applicable)
