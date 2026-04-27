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
npm run destroy:feature -- feat-cc-123      # Destroy a feature env (prompts for confirmation)
npm run destroy:feature -- feat-cc-123 --force  # Destroy without confirmation prompt
```

Feature environments are auto-deployed for PRs and torn down automatically when the PR is merged.

### GitHub Environments Setup

The CI/CD workflows use two GitHub repository environments — **`dev`** and **`feature`** — so that secrets and variables can be scoped per environment.  Create both environments under **Settings → Environments** in the repository and configure the following for each one:

#### `dev` environment

| Type | Name | Description |
|------|------|-------------|
| Secret | `AWS_ACCESS_KEY_ID` | AWS access key ID for the dev deployment IAM user |
| Secret | `AWS_SECRET_ACCESS_KEY` | AWS secret access key for the dev deployment IAM user |
| Secret | `AWS_REGION` | AWS region where the S3 bucket lives (e.g. `ap-southeast-2`) |
| Variable | `NEXT_PUBLIC_API_BASE_URL` | Base URL of the API Gateway for the dev stage (e.g. `https://abc123.execute-api.ap-southeast-2.amazonaws.com/dev`) |
| Variable | `NEXT_PUBLIC_WS_URL` | WebSocket URL for the dev stage (e.g. `wss://abc123.execute-api.ap-southeast-2.amazonaws.com/dev/`) |

#### `feature` environment

| Type | Name | Description |
|------|------|-------------|
| Secret | `AWS_ACCESS_KEY_ID` | AWS access key ID for the feature deployment IAM user |
| Secret | `AWS_SECRET_ACCESS_KEY` | AWS secret access key for the feature deployment IAM user |
| Secret | `AWS_REGION` | AWS region where the S3 bucket lives (e.g. `ap-southeast-2`) |
| Variable | `NEXT_PUBLIC_API_BASE_URL` | Base URL of the API Gateway for the feature stage (e.g. `https://abc123.execute-api.ap-southeast-2.amazonaws.com/feature`) |
| Variable | `NEXT_PUBLIC_WS_URL` | WebSocket URL for the feature stage (e.g. `wss://abc123.execute-api.ap-southeast-2.amazonaws.com/feature/`) |

> [!NOTE]
> The `dev` and `feature` environments can share the same IAM credentials and `NEXT_PUBLIC_API_BASE_URL` if you only have a single backend stage, or you can configure separate values to isolate each environment entirely.

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
