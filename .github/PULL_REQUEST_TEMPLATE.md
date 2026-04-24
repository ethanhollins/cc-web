<!-- PR Title format: feat(CC-XXX): short title
     Example: feat(CC-123): add skill progression page
     Types: feat | fix | refactor | perf | docs | style | test | chore | build | ci -->

## Ticket Key

<!-- e.g. CC-115 -->

## Issue Type

<!-- Select one: feature | fix | chore | refactor | docs | test -->

## Description

<!-- Describe the changes introduced by this PR clearly and concisely. -->

## Changes

<!-- List the key changes made, e.g.:
- Added new dashboard page component
- Created shared useAuth hook
- Updated Button component to shadcn/ui -->

## Action Items

<!-- Manual steps that must be completed outside of this PR, e.g.:
- Create GitHub secret `MY_SECRET`
- Update environment variable in Vercel/AWS console -->

## Feature Environment

<!-- Replace CC-XXX with your ticket number -->

https://feat-cc-xxx.ethanhollins.com

## Checklist

- [ ] PR title follows Conventional Commits format `<type>(CC-XXX): <description>` (e.g. `feat(CC-123): add user dashboard page`)
- [ ] Code follows project naming conventions (PascalCase for components, camelCase for hooks, kebab-case for utils/other files)
- [ ] All imports are at the top of files
- [ ] No new imports from `/src/old/` in new or refactored code
- [ ] New UI components use shadcn/ui as the foundation
- [ ] Layouts and components follow mobile-first design (start at 320px, use `sm:`, `md:`, `lg:` prefixes)
- [ ] `CHANGELOG.md` updated
