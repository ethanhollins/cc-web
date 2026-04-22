# Command Centre Web

A modern Next.js application for task management, planning, and skills tracking.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui (migrating from react-aria-components)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5
- **Icons:** lucide-react
- **Forms:** react-hook-form
- **State:** React 19 hooks

## 📁 Project Structure

```
cc-web/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components (NEW - use for all new work)
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Headers, footers, navigation
│   │   ├── sections/       # Page sections
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── api/                # API client functions
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── lib/                # Core library code
│   └── old/                # Legacy code (DO NOT USE for new features)
├── test/                   # Tests and mocks
├── config/                 # Configuration files
└── public/                 # Static assets
```

> [!IMPORTANT]
> **Refactoring in Progress:** This project is migrating from a legacy react-aria-components library (in `/src/old/`) to a modern shadcn/ui architecture. All new features must use the new component structure in `/src/components/`.

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

### Deployment

```bash
npm run deploy:dev                          # Deploy to dev (dev/)
npm run deploy:feature -- feat-cc-123       # Deploy to feature env (feat-cc-123/)
```

Feature environments are auto-deployed for PRs and torn down automatically when the PR is merged.

## 📝 Development Guidelines

This project follows strict development practices. **Please read these before contributing:**

- **[GitHub Copilot Instructions](.github/copilot-instructions.md)** - Required reading for AI-assisted development
- **[Changelog](CHANGELOG.md)** - Track all changes here (append-only)
- **[Conventional Commits](https://www.conventionalcommits.org/)** - All commits must follow this spec

### Key Rules

1. ✅ **DO** use shadcn/ui components for all new UI
2. ✅ **DO** design mobile-first (320px+)
3. ✅ **DO** follow the scaffolding → implementation workflow
4. ✅ **DO** update CHANGELOG.md for all features
5. ❌ **DON'T** import from `/src/old/` in new code
6. ❌ **DON'T** write full implementations without explicit permission

## 🎨 Adding UI Components

```bash
# Add shadcn/ui components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## 📚 Path Aliases

```typescript
// Hooks
import { api } from "@/api/client";
// shadcn components
import { LoginForm } from "@/components/auth/...";
// Custom components
import { useAuth } from "@/hooks/use-auth";
// Types
import { cn } from "@/lib/utils";
// API functions
import type { User } from "@/types/user";
import { Button } from "@/ui/button";

// Utilities
```

## 🔧 Configuration

- **Tailwind:** `tailwind.config.js`
- **TypeScript:** `tsconfig.json`
- **Next.js:** `next.config.mjs`
- **shadcn/ui:** `components.json`

## 📄 License

MIT License - See LICENSE file for details
