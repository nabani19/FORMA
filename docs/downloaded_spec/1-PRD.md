# 1-PRD.md — Product Requirements Document

> **Forma (FitForge AI)**: Next-Generation Clinical Nutrition, AI Multimodal Food Vision, Metabolic Diagnostics & Aesthetic Physique Periodization Engine.

---

## 1. Problem Statement
Modern fitness and nutrition apps suffer from four critical deficiencies:
1. **Inaccurate Food Logging & Inflexible Vision**: Existing barcode and computer vision scanners fail to segment multi-dish meals (e.g., *Dal Makhani + 2 Rotis + Rice + Salad*), hallucinate calorie numbers without reference to clinical food tables (USDA FoodData Central / ICMR-NIN 2024), and cannot parse printed packaged Nutrition Facts tables via OCR.
2. **Generic, Non-Periodized Training**: Workout planners ignore individual biomechanics, lack progressive overload auto-regulation (Brzycki 1RM & RPE thresholds), and fail to optimize the Adonis Golden Ratio (1.618) V-taper aesthetic physique structure.
3. **Disconnected Medical Blood Biomarkers**: Users track calories in isolation without contextualizing clinical lab biomarkers (Fasting Blood Glucose, HbA1c, Lipid Profiles, Vitamin D3, B12, Creatinine, eGFR) against ADA 2026 and ISO 15189 standards.
4. **Budget & Localization Disconnect**: Global wellness apps fail to adapt to local currencies (INR), 5-meal daily micro-budgeting, or regional dietary safeguards (Jain, Sattvic, Vegan, Halal, 18 Allergen matrices).

---

## 2. Target Users
- **Primary Persona**: Health-conscious individuals, fitness athletes, and bodybuilders seeking precision macro tracking, automated progressive overload, and visual Adonis V-taper physique development.
- **Secondary Persona**: Patients monitoring metabolic biomarkers (pre-diabetes, dyslipidemia, vitamin deficiencies) requiring clinical dietary alignment with ADA 2026 / ICMR-NIN standards.
- **Explicit Non-Goals**: Not a medical replacement for licensed physician diagnosis or emergency prescription services.

---

## 3. Core Feature Matrix (P0 / P1 / P2)

| # | Feature Domain | User Story | Priority |
|---|----------------|------------|----------|
| 1 | **Multimodal AI Food Scanner** | As a user, I can take a photo of my plate, scan a packaged barcode, or point at a nutrition facts label to instantly get verified macros and micronutrients. | **P0** |
| 2 | **Multi-Item Plate Decomposition** | As a user eating a composite meal (e.g., Thali), I want the AI to segment each dish into independent portion sliders and log them seamlessly. | **P0** |
| 3 | **Visual Hand-Measurement Estimator** | As a user without a kitchen scale, I want visual portion guides (Fist=150g, Palm=100g, Thumb=15g) to estimate food weights accurately. | **P0** |
| 4 | **Clinical Energy & Macro Engine** | As a user, I want calorie and macro targets calculated with WHO/FAO/UNU 2004 clinical equations adapted to my body metrics and goal. | **P0** |
| 5 | **5-Meal Budget & Grocery Sync** | As a user, I want to set a daily/monthly food and supplement budget in INR and generate synced grocery lists. | **P1** |
| 6 | **Medical Lab Blood Risk Engine** | As a user, I want to input routine blood test panels to detect pre-diabetes, lipid risks, and vitamin deficiencies with automated dietary triggers. | **P1** |
| 7 | **Aesthetic Physique V-Taper Periodization** | As a user, I want Adonis Golden Ratio (1.618) shoulder-to-waist ratio tracking and a 6-tier biomechanics overload engine. | **P1** |
| 8 | **1,000+ Exercise Database & Overload** | As a user, I want full head-to-toe muscle coverage with Brzycki 1RM computation and submaximal RPE overload prompts. | **P1** |
| 9 | **Multi-Language Localization** | As a global user, I want native support in English, Hindi (हिन्दी), Spanish, French, and German. | **P2** |
| 10| **Offline-First Resilience & PWA** | As a mobile user, I want instant local semantic food fallback and zero-latency UI interactions. | **P2** |

---

## 4. Non-Goals
- Real-time video motion-tracking via computer vision during active workout execution (handled via structured sets/reps log).
- In-app payment processing or direct merchant checkout (handled via exportable shopping lists).
- Invasive continuous glucose monitor (CGM) hardware sensor telemetry integration.

---

## 5. Success Metrics & Performance KPIs
- **Vision Inference Latency**: Sub-800ms response time via OpenRouter multi-model vision candidates.
- **Nutritional Accuracy**: 100% adherence to USDA FoodData Central and ICMR-NIN 2024 nutrient tables.
- **Security & Compliance**: 100/100 OWASP Top 10 Security Rating with zero XSS vulnerabilities.
- **Service Level Uptime**: 99.99% availability with automated Kubernetes liveness and readiness health checks.
