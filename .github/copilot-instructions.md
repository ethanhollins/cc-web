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

### Component Library

**MUST use shadcn/ui components wherever possible:**
- All new UI components should be built with shadcn/ui
- Check available components: `npx shadcn@latest add [component-name]`
- Configure components using the project's design system tokens
- Extend shadcn components when additional functionality is needed

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
- Get explicit approval before proceeding

#### 2. Branch Creation (if on master)
Once the plan is approved:
- **Create a feature branch using conventional commits format**
  - Format: `<type>/<brief-description>` or `<type>/<scope>/<brief-description>`
  - Examples: `feat/user-dashboard`, `fix/calendar-timezone`, `refactor/ui/button-component`
- **Update `CHANGELOG.md` immediately**
  - Add entry to `[In Progress]` section with feature name and TBD date
  - Include brief description of the work to be done

#### 3. Scaffolding Phase
- Create file structure with placeholder files
- Add comprehensive TODO comments for each section
- Provide rough code implementation suggestions as comments
- Include type definitions and interfaces
- Add placeholder functions with clear documentation

#### 4. Implementation Guidance
- Keep chunks small and manageable for manual implementation
- After each scaffolding section is created:
  - Maintain a TODO list of remaining work
  - Briefly summarize what needs to be done next
  - Wait for the developer to implement
  - Continue to the next chunk only when ready

#### 5. Full Implementation
- **ONLY fully implement code when explicitly given permission**
- Never assume permission to write complete implementations
- Always default to scaffolding + guidance approach

#### 6. Completion
- Update `CHANGELOG.md` with completion date
- Move entry from `[In Progress]` to `[Completed]`
- Create PR with descriptive conventional commit message

### Example Workflow

```
Developer: "Add a new dashboard page"

AI Response:
1. [Present plan in chat]
2. [Wait for approval]
3. [Check current branch, create feature branch if on master]
4. [Update CHANGELOG.md with in-progress entry]
5. [Create scaffolding with TODOs]
6. [Summarize next steps]
7. [Wait for "implement this" or similar explicit permission before coding]
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
import { Button } from "@/ui/button"
import { Card } from "@/ui/card"

// Custom components
import { LoginForm } from "@/components/auth/login-form"
import { PageHeader } from "@/components/layout/page-header"

// Hooks, utils, types
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"
```

## Important Notes

- Always check `CHANGELOG.md` before starting work
- Update `CHANGELOG.md` after completing features
- Never import from `/src/old/` in new code
- Test mobile viewport first, then scale up
- Use shadcn components as the foundation
- Maintain TODO lists during implementation
- Get explicit permission before full implementations
