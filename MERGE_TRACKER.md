# Merge Tracker - Main Local Branch to Main

This document tracks files that need to be selectively merged from `main-local-branch` to `main` (production branch).

## Files Ready for Merge

| File Path | Status | Description | Priority | Last Updated |
|-----------|--------|-------------|----------|--------------|
| `src/shared/services/firebaseConfig.js` | ✅ Ready | Firebase configuration updates | High | 2024-12-19 |
| `.cursor/rules/yakrooms.mdc` | ✅ Ready | Development rules and guidelines | Medium | 2024-12-19 |

## Files Under Development

| File Path | Status | Description | Priority | Last Updated |
|-----------|--------|-------------|----------|--------------|
| | | | | |

## Files to Review Before Merge

| File Path | Status | Description | Priority | Last Updated |
|-----------|--------|-------------|----------|--------------|
| | | | | |

## Merge Commands Reference

### Method 1: Cherry-pick Specific Commits
```bash
git checkout main
git cherry-pick <commit-hash>
```

### Method 2: Selective File Merge (Recommended)
```bash
git checkout main
git checkout main-local-branch -- path/to/specific/file.jsx
git add .
git commit -m "Merge selected files from main-local-branch"
```

### Method 3: Manual File Copy
```bash
git checkout main
cp path/to/file/from/main-local-branch path/to/file/in/main
git add path/to/specific/files
git commit -m "Add specific features from main-local-branch"
```

## Merge History

| Date | Files Merged | Commit Hash | Notes |
|------|--------------|-------------|-------|
| | | | |

## Notes

- Always create a backup branch before merging to main
- Test thoroughly after selective merge
- Use descriptive commit messages
- Update this tracker after each merge operation

---
*Last Updated: 2024-12-19*
*Branch: main-local-branch*
