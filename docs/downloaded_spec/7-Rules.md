# 7-Rules.md — Architectural Guidelines & Agent Boundaries

> **Forma (FitForge AI)**: Hard engineering constraints, clinical nutrition standards, and security protocols.

---

## 1. Clinical Nutrition Integrity Rules
- **No Hallucinated Macros**: All macronutrient and micronutrient computations MUST adhere strictly to verified clinical databases (USDA FoodData Central / ICMR-NIN 2024).
- **Mandatory Energy Balance Conservation**: `Calories ≈ (Protein × 4) + (Net Carbs × 4) + (Fat × 9) + (Fiber × 2)`. Discrepancies exceeding ±10% must be corrected.
- **Biomarker Clinical Thresholds**:
  - Fasting Glucose ≥ 100 mg/dL: Pre-diabetes alert (ADA 2026)
  - HbA1c ≥ 5.7%: Pre-diabetes alert (ADA 2026)
  - Vitamin D3 < 30 ng/mL: Insufficiency alert (Endocrine Society)
  - Vitamin B12 < 300 pg/mL: Deficiency alert

---

## 2. Code Quality & TypeScript Rules
- **Strict Typing**: Zero `any` policy for core data structures (`FoodItem`, `PlateComponent`, `MealLog`, `BloodReport`).
- **No Direct Mutation of React State**: All state updates in `AppContext` must be immutable.
- **Sanitization on Ingestion**: All user strings or API responses must be passed through `stripHtml()` before rendering to prevent XSS.

---

## 3. Aesthetic Physique Periodization Rules
- **Adonis Index Target**: Shoulder Circumference / Waist Circumference = 1.618.
- **Biomechanical Hierarchy Priorities**:
  - Priority 1: Lateral Deltoids (Width Anchor)
  - Priority 2: Lats (Taper Driver)
  - Priority 3: Clavicular Pec (Frame Filler)
  - Priority 4: Arms (Detail Layer)
  - Priority 5: Abdominals & Obliques (Anti-waist widening)
  - Priority 6: Legs (Structural Foundation)
- **Overload Auto-Regulation**: Progressive overload increases by +2.5% to +5% when RPE ≤ 8.0 and target rep range is achieved.
