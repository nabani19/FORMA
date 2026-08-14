---
name: manage-nutrition-budget-and-ui-sync
description: |
  Manages dynamic multi-category budget allocation (meals, supplements, groceries) in local currencies (INR), ensures multi-view state synchronization, meal completion tracking (eaten checkoffs), and light/dark theme systems in nutrition and wellness web applications.

  Relevant when any of the following conditions are true:
    1. User requests user-adjustable monthly or daily budget controls for meals, groceries, or supplements.
    2. User wants interactive checkboxes or fulfillment tracking on planned daily meals (e.g. "eaten", "done", "completed").
    3. You need to synchronize budget and nutrient targets across multiple tabs (Dashboard, Meal Log, Supplement Advisor, Grocery Planner) without state desynchronization.
    4. You need to implement full-app light and dark mode theming with CSS variable tokens and zero-flicker transitions.

  Do NOT use when:
    1. The request is solely for backend raw database migrations or external payment gateway webhooks.
    2. The task is only for static text document formatting.
license: Apache-2.0
metadata:
  version: v1
  publisher: user
---

# Manage Nutrition Budget and UI Synchronization

Architect user-adjustable health budgets, synchronized multi-tab state, interactive meal completion tracking, and responsive theming in modern React/Vite nutrition applications.

---

## 1. Core Architecture & Workflow

Follow these steps sequentially:

### Step 1: Data Model & TypeScript Interfaces
Ensure the global `User` and `DietaryPreference` models in `src/types/index.ts` include:
```typescript
export interface User {
  // ...other fields
  dailyBudgetInr?: number;
  monthlyBudgetInr?: number;
  supplementBudgetInr?: number;
  currency?: 'INR' | 'USD' | 'EUR';
}
```

### Step 2: Shared Central Budget Controller (`BudgetSettingsPanel.tsx`)
Create a single reusable controller component that updates the global store (`AppContext`):
- **Input Modality**: Accept budget values primarily in **Monthly Budget** format (e.g., ₹1,000–₹30,000/mo for food; ₹500–₹10,000/mo for supplements).
- **Auto-Derivation**: Derive daily values via `Math.round(monthlyBudget / 30)` and display them as helper hints (`₹6,000/mo ÷ 30 days = ₹200/day`).
- **Input Controls**:
  - Range sliders for quick adjustments.
  - Number input fields for exact typing.
  - Preset quick-select buttons (e.g., ₹2,000, ₹3,000, ₹6,000).
- **Persistence**: Save directly to `localStorage` and update global context using `updateUser({ ... })`.

### Step 3: Embed in Consumer Views
Embed `<BudgetSettingsPanel />` into:
1. `Dashboard.tsx`
2. `MealLogView.tsx`
3. `SupplementView.tsx`
4. `GroceryPlannerView.tsx`

Ensure all summary cards display matching monthly totals and conditional over-budget warnings (`cost > budget`).

### Step 4: Meal Fulfillment ("Eaten") Tracking
In `MealLogView.tsx`, implement completion tracking:
```typescript
const [eatenMeals, setEatenMeals] = useState<Record<string, boolean>>({});

const toggleEaten = (key: string) =>
  setEatenMeals((prev) => ({ ...prev, [key]: !prev[key] }));
```
- Key format: `${selectedDay}-${mealIndex}`
- When checked:
  - Dim card opacity (`opacity-60`)
  - Strikethrough meal title (`line-through decoration-emerald-400`)
  - Display `✓ Eaten` pill badge

### Step 5: Full-App Theme Management (Light & Dark Mode)
In `src/index.css`:
- Define design tokens for `:root` (light mode: `#F0F4FF` base, `#6366F1` accents) and `html.dark` (dark mode: `#0B0F1A` base, `#34D399` accents).
- Override hardcoded dark Tailwind classes inside `:not(.dark)`.
- In `App.tsx`, sync `isDarkMode` state with `document.documentElement.classList`.

---

## 2. Rules & Hard Constraints

1. **Single Source of Truth**: Never maintain duplicate budget state in child components. Always mutate and subscribe via global context (`AppContext`).
2. **Standardized Currency**: Maintain strict Indian Rupee (`₹`) notation across all budget and pricing cards.
3. **No Dead Routes**: When removing deprecated features (such as PDF exporters), always clean up imports, routes, and `ActiveTab` type definitions across the entire codebase.
4. **Immediate Feedback**: Provide visual confirmation (toasts, badges, animated state transitions) on all user actions.

---

## 3. Common Failure Modes & Fixes

| Issue | Cause | Fix |
|---|---|---|
| **Stale Budgets on Tab Switch** | Local component state overriding global context | Read directly from `user.monthlyBudgetInr` and update via `updateUser()`. |
| **Light Mode Illegibility** | Hardcoded `text-slate-100` on light background | Add `:not(.dark)` CSS rules in `index.css` or dynamic `dark ? 'text-white' : 'text-slate-900'` classes. |
| **Missing TypeScript Properties** | Interface omitted `supplementBudgetInr` | Update `src/types/index.ts` before referencing the property in JSX. |
| **Rollup Stderr Warnings** | PowerShell interpreting chunk size notices as failures | Verify `✓ built in Xs` in output log before treating exit code as error. |
