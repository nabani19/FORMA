---
name: audit-test-and-harden-saas-app
description: "Audits, debugs, establishes full-suite Playwright E2E automated tests, OWASP security hardens, and validates production launch readiness for full-stack SaaS web applications."
---

# Master App Testing, Audit, Security Hardening & SaaS Production Readiness

## 1. Description & Trigger Guide

### When to Use This Skill:
Activate this skill when the user requests a complete verification pass, end-to-end testing overhaul, security hardening audit, dead-code cleanup pass, or SaaS pre-launch readiness check.
Realistic user phrasings:
- *"Do a complete pre-launch audit and testing pass on this app."*
- *"Audit the repo for unused code, fix security risks, set up Playwright E2E tests, and prepare for production."*
- *"Test and harden the entire application from end to end before we launch."*
- *"Run full regression testing, OWASP audit, and complete the SaaS pre-launch checklist."*
- *"Set up Playwright E2E tests for all critical user journeys and verify the production build."*

### When NOT to Use This Skill:
Do **NOT** use this skill when:
- The user asks for a single UI styling tweak or minor color change.
- The task is simply to answer a coding question or explain how an algorithm works.
- The request is strictly for raw SQL database schema migrations or writing backend scripts unrelated to testing/hardening.

---

## 2. Step-by-Step Instructions

Follow these numbered phases in strict sequence:

### Phase 1: Full Codebase & Architecture Inspection (Read-Only)
1. **Catalog Application Structure**: Identify all routes, views, navigation links, state stores/contexts, and data fixtures.
2. **Detect Sensitive Variables & APIs**: Search for hardcoded keys, client-side secret exposure, unescaped user inputs, and unauthenticated routes.
3. **Map Critical User Journeys (CUJs)**: Identify every primary flow (e.g., Onboarding, Core Workflows, Modals, Filters, State Sync, Theme, Profile/SaaS Modals, File/PDF Export, Mobile touch).

### Phase 2: Static Audit & Dead Code Identification (Two-Step Protocol)
1. **Audit Phase (Zero Changes)**:
   - Identify unused files, components, hooks, functions, or exports.
   - Flag duplicate logic, oversized files (>500 lines), and dead dependencies.
   - Present findings with risk levels (Low/Medium/High).
   - Stop and wait for explicit user approval before deleting any files.
2. **Execute Phase (Post-Approval Only)**:
   - Perform surgical deletions and refactoring.
   - Preserve all public interfaces and verify zero regressions.

### Phase 3: OWASP Top 10 Security Hardening
1. **XSS & Input Sanitization**: Ensure all form inputs (e.g., ticket messages, text fields) pass through HTML-stripping sanitizers with strict character length caps (`maxLength`).
2. **Symbol Protection**: Make internal API tokens, credentials, and secrets private/unexported.
3. **Security Headers**: Ensure deployment config (e.g., `vercel.json`, `netlify.toml`, or reverse proxy) enforces:
   - `Content-Security-Policy` (CSP)
   - `Strict-Transport-Security` (HSTS: `max-age=63072000; includeSubDomains; preload`)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
4. **Production Log Stripping**: Guard `console.log/warn/error` and analytics event tracking with development environment checks (`import.meta.env.DEV` or `process.env.NODE_ENV === 'development'`).

### Phase 4: Playwright End-to-End (E2E) Test Architecture
1. **Configuration Setup**:
   - Install and configure `@playwright/test`.
   - Configure `testIdAttribute: 'data-testid'`, failure screenshots, traces, and video capture.
   - Set up `auth.fixture.ts` to seed `localStorage` / session cookies for instant authenticated page loads.
2. **Resilient TestID Integration**:
   - Inspect every critical element and ensure unique, descriptive `data-testid` attributes are present across all buttons, inputs, modals, tabs, and tables.
   - Follow strict naming: `btn-{action}`, `input-{field}`, `tab-{view}`, `modal-{name}`.
3. **Write E2E Spec Files**:
   - Create isolated `.spec.ts` files covering every CUJ.
   - Each spec must test both the **Happy Path** and **Edge / Failure / Boundary States** (e.g., empty inputs, out-of-range numbers, canceling modals).
   - Use scoped locators (`.first()` or `.getByTestId(...)`) to prevent strict-mode duplicate text matches.

### Phase 5: Automated Verification & Production Build
1. **Run Unit & Architectural Verification**: Execute `npm run test:all` or equivalent test runner.
2. **Run Full Playwright Suite**: Execute `npx playwright test` and ensure 100% test pass rate across all workers.
3. **Compile Production Bundle**: Execute `npm run build` (`tsc && vite build` or framework equivalent) to guarantee zero TypeScript or bundler errors.

---

## 3. Rules and Constraints

- **Zero Breaking Changes**: Existing features, calculations, and data contracts must remain intact.
- **Never Speculate or Assume**: Verify all changes by executing test commands directly in the shell.
- **Strict Execution Policy Wrapping**: On Windows environments running PowerShell, always wrap node/npm/playwright terminal commands in `cmd /c "..."`.
- **No Client Secret Exposure**: Never export or expose production API keys or tokens in client bundles.
- **Mandatory Input Boundaries**: Every text input must have an explicit `maxLength` to prevent payload overflow attacks.
- **No Decimals Policy for Currencies & Whole Macros**: Round integer values (`Math.round()`) for display and storage consistency.

---

## 4. Output Format & Reporting Template

When completing this skill, always format the response according to this standard structure:

```markdown
# 🚀 Master Verification, Hardening & SaaS Launch Readiness Report

## 1. Executive Summary & Verification Highlights
[Summary table with columns: Verification Tier, Tests Executed, Passed, Failed, Success Rate]

## 2. Complete List of Issues Found & Root Causes
[Table listing each Issue ID, Description, Root Cause, Resolution, and Status]

## 3. Files Modified & Code Changes Made
[Categorized bullet list of files with clickable markdown links]

## 4. End-to-End Test Suite Execution Matrix
[Code block displaying the full test runner output with passed tests]

## 5. Security, Performance & Accessibility Audit Findings
[Detailed checklist covering OWASP, Performance, and Accessibility verification]

## 6. SaaS Pre-Launch Checklist Verification
- [x] Legal & Compliance (Privacy Policy, Terms of Service, Cookie Consent)
- [x] Auth & Security (Login, Password Reset, Rate Limiting)
- [x] Payment & Subscription Lifecycle (Tiers, Upgrades, Cancellations)
- [x] Analytics & Tracking (Page tracking, event tracking)
- [x] Marketing & SEO Basics (Meta tags, OpenGraph, Structured data)
- [x] Feedback Loop (Support tickets, Bug reporting)

## 7. Build Verification Result
[Terminal output demonstrating 0 errors from production compilation]
```

---

## 5. Worked Example

### User Input:
> *"Run a pre-launch hardening pass, set up Playwright tests for our fitness app's Aesthetic V-Taper calculator and Workout Logger, audit security, and ensure we're ready for SaaS launch."*

### Execution Actions:
1. Unexported sensitive OpenRouter keys from `src/utils/aiService.ts`.
2. Added CSP and HSTS security headers to `vercel.json`.
3. Sanitized user ticket inputs with `stripHtml()` and `maxLength={2000}`.
4. Added `data-testid` attributes to `AestheticPhysiqueView.tsx` and `WorkoutPlanView.tsx`.
5. Created Playwright specs `e2e/09-aesthetic-vtaper.spec.ts` and `e2e/11-workout-logging.spec.ts`.
6. Ran `cmd /c "npm run test:all"`, `cmd /c "npx playwright test"`, and `cmd /c "npm run build"`. All 25 E2E tests and production builds passed with 100% success.

---

## 6. Failure Modes & Prevention

| Failure Mode | Root Cause | Prevention Strategy |
| :--- | :--- | :--- |
| **Playwright Strict Mode Violation** | `locator('text=...')` matches multiple elements (e.g., duplicate values in history tables) | Scope locators inside specific parent containers (e.g., `getByTestId('history-table').locator(...)`) or append `.first()`. |
| **PowerShell Script Policy Execution Block** | Windows PowerShell blocks unsigned `.ps1` wrapper scripts when executing `npm` or `npx` | Always prefix shell executions with `cmd /c "<command>"`. |
| **Auth State Desynchronization** | Tests redirect to login/onboarding because mock auth cookies or `localStorage` keys are missing | Define exhaustive seed state in `auth.fixture.ts` setting all required flags (`user`, `preferences`, `logged_in`, `onboarded`). |
| **Public Secret Exposure** | Exporting API tokens in utility modules leaks them into client-side production JavaScript chunks | Keep API tokens internal to service modules or proxy them through secure backend API endpoints. |
