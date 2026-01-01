# GitHub Copilot Instructions

## Project Overview

This is a Next.js application currently undergoing a major refactoring from a legacy component system to a modern shadcn/ui-based architecture.

## Project Structure

### Directory Organization

```
cc-web/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   └── api/                  # API routes
│   ├── components/               # React components (NEW)
│   │   ├── auth/                 # Authentication components
│   │   ├── layout/               # Layout components (headers, footers, nav)
│   │   ├── sections/             # Page sections (feature-specific groups)
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── api/                      # API client functions
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── lib/                      # Core library code
│   └── old/                      # LEGACY - DO NOT USE FOR NEW FEATURES
│       ├── components/           # Old react-aria-components
│       ├── hooks/                # Old custom hooks
│       ├── utils/                # Old utilities
│       └── styles/               # Old styles
├── test/                         # Test utilities and mocks
├── public/                       # Static assets
└── .github/                      # GitHub configuration
```

### Current State

- **`/src/old/`** - Legacy components and code to be refactored or replaced
  - Contains the original component library built with react-aria-components
  - Includes application components, base components, hooks, utilities, and styles
  - **MUST NOT** be used for any new features

- **`/src/app/`** - Next.js App Router pages
  - Currently imports from `/src/old/` folder
  - Pages here will be progressively replaced with new implementations
- **`/src/components/`** - New component library ✨ **USE THIS FOR ALL NEW WORK**
  - `ui/` - shadcn/ui components (Button, Card, Dialog, etc.)
  - `auth/` - Authentication-related components
  - `layout/` - Layout components (headers, sidebars, navigation)
  - `sections/` - Reusable page sections and feature-specific component groups

- **`/src/hooks/`** - Custom React hooks (new implementations only)
- **`/src/api/`** - API client functions and data fetching
- **`/src/types/`** - TypeScript type definitions and interfaces
- **`/src/utils/`** - Utility functions and helpers
- **`/src/lib/`** - Core library code (session management, configs)

### Migration Process

When replacing old pages or components:

1. Move the old file to `/src/app/old/[original-path]`
2. Create the new implementation in the original location
3. Do NOT delete old files until the replacement is fully complete and tested
4. Update `CHANGELOG.md` with the migration

## Development Guidelines

### Naming Conventions

**MUST follow these file naming conventions:**

- **Hooks**: camelCase (e.g., `useCalendarEvents.ts`, `useAuth.ts`)
- **Components**: PascalCase (e.g., `CalendarView.tsx`, `UserProfile.tsx`)
- **Utils/Other Files**: kebab-case (e.g., `calendar-utils.ts`, `format-date.ts`)

### Component Library

**MUST use shadcn/ui components wherever possible:**

- All new UI components should be built with shadcn/ui
- Check available components: `npx shadcn@latest add [component-name]`
- Configure components using the project's design system tokens
- Extend shadcn components when additional functionality is needed

### Sharable Architecture

**Design all new code to be sharable and composable:**

- Prefer small, focused components over page-specific monoliths
- Extract reusable logic into `/src/hooks` (for stateful or behavioral concerns)
- Extract pure computation and formatting into `/src/utils` (kebab-case files)
- Keep API access isolated in `/src/api` and shared configuration in `/src/lib`
- Avoid duplicating logic across pages; create shared hooks/utils instead
- Do not introduce new imports from `/src/old/` – if legacy behavior is needed, migrate or wrap it into the new `/src` structure first

### Design Principles

**Mobile-First Design is MANDATORY:**

- Start designs with mobile viewport (320px+)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Test all new features on mobile viewports first
- Ensure touch-friendly interactions (44x44px minimum touch targets)
- Optimize for performance on mobile devices

### AI Development Workflow

When implementing new features, follow this structured approach:

#### 1. Initial Planning Phase

- **Present the plan in chat first**
- Break down the feature into logical, manageable chunks
- Outline the overall architecture and approach
- **Request project/ticket code from the user** (e.g., CC-48, CC-52)
- Get explicit approval before proceeding

#### 2. Branch Creation (if on master)

Once the plan is approved and project code is provided:

- **Create a feature branch using conventional commits format with project code**
  - Format: `<project-code>-<type>-<brief-description>`
  - User must provide the project code (e.g., CC-48, CC-52)
  - Examples: `CC-48-feat-user-dashboard`, `CC-52-fix-calendar-timezone`, `CC-65-refactor-button-component`
- **Update `CHANGELOG.md` immediately**
  - Add entry to `[In Progress]` section with feature name (including project code) and TBD date
  - Include brief description of the work to be done

#### 3. Scaffolding Phase (DEFAULT APPROACH)

- Create file structure with placeholder files
- Add comprehensive TODO comments for each section
- Provide rough code implementation suggestions as comments
- Include type definitions and interfaces (can be complete)
- Add placeholder functions with clear documentation
- Use comments like `// TODO: implement...`, `// NOTE: ...`, `// EXAMPLE: ...`
- Keep function bodies minimal with instructive comments

**Example of proper scaffolding:**

```typescript
// ❌ WRONG - TODOs above completed code
export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  // TODO: Make fetch request with signal
  const response = await fetch(`${API_BASE_URL}/projects`, { signal });

  // TODO: Check response status
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  return response.json();
}

// ✅ CORRECT - Empty function with TODOs inside explaining what to implement
export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  // TODO: Implement fetchProjects function
  // 1. Make GET request to `${API_BASE_URL}/projects` with signal
  // 2. Check if response.ok, throw error if not
  // 3. Parse and return response.json()
  // EXAMPLE:
  // const response = await fetch(`${API_BASE_URL}/projects`, { signal });
  // if (!response.ok) throw new Error(`Failed to fetch projects: ${response.status}`);
  // return response.json();

  throw new Error("Not implemented");
}
```

#### 4. Implementation Guidance

- Keep chunks small and manageable for manual implementation
- After each scaffolding section is created:
  - Maintain a TODO list of remaining work
  - Briefly summarize what needs to be done next
  - Wait for the developer to implement
  - Continue to the next chunk only when ready

#### 5. Full Implementation

- **CRITICAL: ONLY fully implement code when explicitly given permission with phrases like "implement this", "write the code", "fill this in", etc.**
- **DEFAULT BEHAVIOR: Always create scaffolding with TODOs and implementation guidance**
- Never assume permission to write complete implementations
- Always default to scaffolding + guidance approach
- If uncertain, ask: "Should I create scaffolding or implement this fully?"

#### 6. Completion

- **CRITICAL: Always check for errors after making changes**
- First, run ESLint for the project (e.g. via the `lint` npm script) and **fix all reported problems**
- Second, run Prettier over the changed files to ensure formatting is consistent
- Then run `get_errors` tool after editing files to validate changes
- Fix any syntax errors, type errors, or compilation issues immediately
- Do not consider work complete until all errors are resolved
- Before committing or opening a PR, perform an architectural/shareability review of all changed files:
  - Confirm new logic is placed in appropriate shared hooks (`/src/hooks`) or utils (`/src/utils`) instead of embedded in pages
  - Check that components are reusable and follow the directory layout (`components/ui`, `components/layout`, `components/sections`, etc.)
  - Ensure there are no new imports from `/src/old/` in any new or refactored code
  - Validate that mobile-first and shadcn/ui guidelines are followed
- Update `CHANGELOG.md` with completion date
- Move entry from `[In Progress]` to `[Completed]`
- Create PR with descriptive conventional commit message

### Example Workflow

```
Developer: "Add a new dashboard page"

AI Response:
1. [Present plan in chat]
2. [Request project code: "What's the project/ticket code for this feature?"]
3. [Wait for approval and project code]
4. [Check current branch, create feature branch if on master: CC-48-feat-user-dashboard]
5. [Update CHANGELOG.md with in-progress entry including project code]
6. [Create scaffolding with TODOs]
7. [Summarize next steps]
8. [Wait for "implement this" or similar explicit permission before coding]
```

## Technical Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui (new), react-aria-components (legacy)
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react (new), @untitledui/icons (legacy)
- **State Management:** React hooks
- **Forms:** react-hook-form
- **Type Safety:** TypeScript

## Commit Message Guidelines

**MUST follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification for all commits and branches.**

Reference `CHANGELOG.md` when writing commit messages.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring (old → new)
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `chore:` - Maintenance tasks
- `test:` - Adding or updating tests
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system or dependencies

### Breaking Changes

- Append `!` after type/scope: `feat!:` or `feat(api)!:`
- Include `BREAKING CHANGE:` in footer

### Examples

```
feat(auth): add login with Google OAuth
fix(calendar): resolve date picker timezone issue
refactor(ui)!: migrate Button component to shadcn/ui

BREAKING CHANGE: Button API has changed, see migration guide
```

## Path Aliases

Use these configured path aliases for imports:

```typescript
{
  "@/components": "src/components",
  "@/ui": "src/components/ui",
  "@/lib": "src/lib",
  "@/hooks": "src/hooks",
  "@/api": "src/api",
  "@/types": "src/types",
  "@/utils": "src/utils",
  "@/old": "src/old"  // Legacy only - DO NOT USE
}
```

### Import Examples

```typescript
// shadcn/ui components
// Custom components
import { LoginForm } from "@/components/auth/login-form";
import { PageHeader } from "@/components/layout/page-header";
// Hooks, utils, types
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
```

## Important Notes

- Always check `CHANGELOG.md` before starting work
- Update `CHANGELOG.md` after completing features
- Never import from `/src/old/` in new code
- Test mobile viewport first, then scale up
- Use shadcn components as the foundation
- Maintain TODO lists during implementation
- Get explicit permission before full implementations
