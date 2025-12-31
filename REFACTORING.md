# Code Refactoring Structure

This project is undergoing a gradual refactoring. The structure has been reorganized to allow incremental migration from old to new code.

## Directory Structure

```
src/
├── old/               # Original implementation (DO NOT MODIFY)
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── data/
│   ├── hooks/
│   ├── providers/
│   ├── styles/
│   ├── types/
│   └── utils/
├── app/              # New Next.js app router (currently proxies to old)
├── components/       # New components (currently re-exports from old)
├── config/           # New config (currently re-exports from old)
├── data/             # New data (currently re-exports from old)
├── hooks/            # New hooks (currently re-exports from old)
├── providers/        # New providers (currently re-exports from old)
├── styles/           # New styles (currently imports from old)
├── types/            # New types (currently re-exports from old)
└── utils/            # New utils (currently re-exports from old)
```

## How to Refactor

### Step 1: Implement New Code
Create new implementations in the respective directories (not in `old/`).

Example:
```typescript
// src/hooks/useNewFeature.ts
export function useNewFeature() {
  // Your new implementation
}
```

### Step 2: Update Barrel Files
When you create a new implementation, export it from the barrel file:

```typescript
// src/hooks/index.ts
export * from './old/hooks/use-auto-save-queue'; // Still using old
export * from './useNewFeature'; // New implementation
```

### Step 3: Replace Old Implementations
When you're ready to replace an old implementation:

1. Create the new file in the appropriate directory
2. Update the barrel file to export from the new location instead of old
3. Test thoroughly
4. Remove the old export from the barrel file

### Step 4: For App Router Pages
App router pages currently proxy to old implementations:

```typescript
// src/app/page.tsx (current)
export { default } from '../old/app/page';

// When ready to refactor, replace with:
export default function Page() {
  // Your new implementation
}
```

## Migration Progress

Track which modules have been migrated by updating this list:

- [ ] app/layout.tsx
- [ ] app/page.tsx
- [ ] app/home-screen.tsx
- [ ] app/not-found.tsx
- [ ] app/planner/page.tsx
- [ ] app/skills/page.tsx
- [ ] components/*
- [ ] hooks/*
- [ ] utils/*
- [ ] config/*
- [ ] providers/*
- [ ] types/*
- [ ] data/*
- [ ] styles/*

## Rules

1. **DO NOT modify files in `src/old/`** - This is frozen code
2. **Always update barrel files** when adding new implementations
3. **Test after each migration** to ensure nothing breaks
4. **Keep old exports** until the new implementation is fully tested
5. **Document breaking changes** if any

## Benefits of This Approach

- ✅ App continues to work during refactoring
- ✅ Gradual migration reduces risk
- ✅ Easy to rollback if needed (just change the export)
- ✅ Clear separation between old and new code
- ✅ Can work on multiple refactors in parallel
