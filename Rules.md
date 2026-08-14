# Engineering & AI Coding Rules — FitForge AI

## Table of Contents
1. [Core Coding Philosophy](#1-core-coding-philosophy)
2. [Libraries & Dependencies (Allowed vs Forbidden)](#2-libraries--dependencies-allowed-vs-forbidden)
3. [Naming Conventions & Code Style](#3-naming-conventions--code-style)
4. [Git Workflow & Commit Standards](#4-git-workflow--commit-standards)
5. [Testing & Quality Assurance Requirements](#5-testing--quality-assurance-requirements)
6. [Accessibility & Performance Budgets](#6-accessibility--performance-budgets)
7. [Error Handling & Resilience](#7-error-handling--resilience)
8. [Security & Data Protection Rules](#8-security--data-protection-rules)
9. [State Management & Component Architecture](#9-state-management--component-architecture)

---

## 1. Core Coding Philosophy
- **Never Guess Logic or File Paths**: Always inspect existing types, components, and APIs before editing or referencing them.
- **Zero Duplicate Code**: Extract shared utilities, types, and UI patterns into `@fitforge/ui` or `@fitforge/types`.
- **No Superficial Symptom Patches**: Fix root causes; never catch and silently swallow errors or return dummy empty fallbacks without diagnostic logging.
- **Strict Typing**: TypeScript `strict: true` enabled everywhere. Implicit or explicit `any` is strictly prohibited.

---

## 2. Libraries & Dependencies (Allowed vs Forbidden)

### 2.1 Allowed Libraries
- **Core**: Next.js 14, React 18, TypeScript 5+, NestJS 10+
- **Styling & UI**: Tailwind CSS v3+, shadcn/ui, Radix UI Primitives, Lucide React, Framer Motion
- **State & Data Fetching**: Zustand v4+, TanStack React Query v5, Zod v3+
- **Visualization**: Recharts v2.15+
- **Database & Auth**: Prisma ORM, Jose (JWT), Argon2id, BullMQ

### 2.2 Forbidden Libraries
- ❌ **No Redux / Redux Toolkit**: Use Zustand for client state and React Query for server state.
- ❌ **No Axios**: Use native `fetch` API wrapped in a type-safe API client.
- ❌ **No Moment.js**: Use `date-fns` or native `Intl` for lightweight date formatting.
- ❌ **No Inline Styles / Raw Hex Codes in Components**: Always use semantic design system tokens from `fitpro-design-system.md`.
- ❌ **No Custom Crypto or Custom JWT Implementations**: Always use audited libraries (`jose`, `argon2`).

---

## 3. Naming Conventions & Code Style

| Asset Type | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | PascalCase | `ScanResultCard.tsx`, `OnboardingWizard.tsx` |
| **Hooks** | camelCase with `use` prefix | `useApp.ts`, `useFoodScanner.ts` |
| **TypeScript Types / Interfaces** | PascalCase | `User`, `FoodItem`, `NutritionalInfo` |
| **Utility Functions** | camelCase | `calculateTdee()`, `checkAllergenConflicts()` |
| **Database Tables** | snake_case (plural) | `users`, `food_items`, `meal_logs` |
| **API Endpoints** | kebab-case (plural) | `/api/v1/food-items`, `/api/v1/meal-logs` |

---

## 4. Git Workflow & Commit Standards

### 4.1 Commit Message Format
Follow Conventional Commits specification: `<type>(<scope>): <short description>`

- `feat(scanner)`: add live webcam frame capture and dish detection reticle
- `fix(auth)`: enforce httpOnly cookie rotation on refresh token call
- `docs(prd)`: update multi-agent AI requirements for blood lab analysis
- `test(workout)`: add unit tests for progressive overload periodization calculator

---

## 5. Testing & Quality Assurance Requirements
- **Unit Tests**: Minimum 80% code coverage on all utility functions, macro calculators, and AI response parsers (`vitest` / `jest`).
- **Integration Tests**: Test API endpoints with Supertest and Prisma test containers.
- **E2E Tests**: Test critical user flows (Onboarding -> Scan -> Log Meal -> View Analytics) using Playwright.

---

## 6. Accessibility & Performance Budgets

### 6.1 Accessibility Standards (WCAG 2.1 AA)
- Minimum contrast ratio of **4.5:1** for body text and **3.0:1** for large headings.
- Touch target minimum dimensions of **44×44px** for all buttons, tabs, and interactive elements.
- All interactive controls must display a visible 2px focus ring during keyboard navigation.
- No information or state may be conveyed by color alone (always include text labels or icons).

### 6.2 Performance Budgets
- **Lighthouse Performance Score**: > 90 on mobile and desktop.
- **First Contentful Paint (FCP)**: < 1.2 seconds.
- **Total Blocking Time (TBT)**: < 150ms.
- **Bundle Size**: Initial JS bundle < 180kB gzip.

---

## 7. Error Handling & Resilience
- Every API endpoint must be wrapped in a centralized NestJS Exception Filter.
- Never expose internal database error traces, stack trace snippets, or system paths to the client.
- Return structured error responses:
```json
{
  "statusCode": 400,
  "errorCode": "INVALID_BARCODE_FORMAT",
  "message": "The provided barcode string must contain 12 or 13 numeric digits.",
  "timestamp": "2026-07-31T18:45:00Z"
}
```

---

## 8. Security & Data Protection Rules (`vibe_coded_auth_security_guide.md`)
- **No Secrets in Frontend**: Never commit API keys or JWT secrets to repository or client bundles.
- **Parameterized Database Queries**: All database queries must be executed via Prisma ORM or parameterized SQL templates (`$1`, `$2`). Raw string concatenation in SQL is grounds for immediate PR rejection.
- **Input Sanitization**: Validate all incoming payloads with Zod schemas at the edge before hitting business logic.
- **Rate Limiting**: Auth & scanning routes limited to 5 requests per 15 minutes per IP.

---

## 9. State Management & Component Architecture
- **Zustand**: Used exclusively for global UI state (Active tab, Scanner modal visibility, Dark mode, Toast messages).
- **React Query**: Used for fetching, caching, and invalidating server data (Logged meals, User profile, Exercise library).
- **Component Anatomy**: Components must stay focused (< 250 lines). Complex render blocks must be split into modular sub-components.
