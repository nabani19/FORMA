# Development Roadmap & Execution Phases — FitForge AI

## Table of Contents
1. [Phase Overview](#1-phase-overview)
2. [Phases 1 - 10: Foundation & Core Microservices](#2-phases-1---10-foundation--core-microservices)
3. [Phases 11 - 20: AI Vision, Scanning & Medical Agents](#3-phases-11---20-ai-vision-scanning--medical-agents)
4. [Phases 21 - 30: Workout Periodization, Enterprise & Scaling](#4-phases-21---30-workout-periodization-enterprise--scaling)

---

## 1. Phase Overview
This roadmap outlines 30 distinct execution phases covering the end-to-end development of the FitForge AI platform.

---

## 2. Phases 1 - 10: Foundation & Core Microservices

### Phase 1: Repository & Monorepo Architecture Setup
- **Objective**: Establish TurboRepo monorepo structure with Next.js 14, NestJS, and shared `@fitforge/ui` / `@fitforge/types` packages.
- **Deliverables**: Configured monorepo, Tailwind CSS design tokens, ESLint/Prettier configs.
- **Complexity**: Low | **Dependencies**: None.
- **Tasks**: Init TurboRepo, set up Next.js client & NestJS gateway, install Tailwind & Lucide icons.
- **Definition of Done**: Monorepo builds cleanly with `npm run build`.

### Phase 2: Database Schema & Prisma ORM Setup
- **Objective**: Design and deploy PostgreSQL schema via Prisma ORM for Users, Preferences, Foods, and Logs.
- **Deliverables**: `schema.prisma` definitions, initial migrations, local Docker PostgreSQL instance.
- **Complexity**: Medium | **Dependencies**: Phase 1.
- **Database Changes**: Tables `users`, `dietary_preferences`, `food_items`, `meal_logs`.
- **Definition of Done**: Prisma migrations apply cleanly and seed script populates 20+ test foods.

### Phase 3: Secure Authentication Microservice
- **Objective**: Implement JWT in-memory access tokens and httpOnly refresh cookie rotation with Argon2id password hashing.
- **Deliverables**: Register, Login, Refresh, Logout API endpoints and Next.js Auth Middleware.
- **Complexity**: High | **Dependencies**: Phase 2.
- **Security Audit**: Zero `localStorage` token storage; Argon2id verified.
- **Definition of Done**: 100% pass on auth security integration tests.

### Phase 4: User Profile & Onboarding Wizard
- **Objective**: Build 3-step onboarding UI for biometrics, TDEE/macro calculation, and goal setting.
- **Deliverables**: Onboarding wizard component, biometrics updater API endpoint.
- **Complexity**: Medium | **Dependencies**: Phase 3.
- **Definition of Done**: Onboarding calculates macros and persists to local storage / DB.

### Phase 5: Dietary Restrictions & Allergen Rules Engine
- **Objective**: Build safeguard logic evaluating foods against user preferences (Vegan, Jain, Gluten-Free, Dairy-Free, Allergies).
- **Deliverables**: `checkAllergenConflicts()` utility engine & warning banner UI.
- **Complexity**: High | **Dependencies**: Phase 4.
- **Definition of Done**: Allergen checker correctly flags Jain, Gluten, and Dairy conflicts in unit tests.

### Phase 6: Food Database & Search API
- **Objective**: Implement fast REST & GraphQL query endpoints for food item lookups.
- **Deliverables**: `/api/v1/food-items` search & pagination endpoints with Redis caching.
- **Complexity**: Medium | **Dependencies**: Phase 2.
- **Definition of Done**: Food search queries resolve under 50ms with Redis.

### Phase 7: Barcode Lookup & Product Database Integration
- **Objective**: Connect EAN/UPC barcode scanner lookup to USDA & Open Food Facts databases.
- **Deliverables**: Barcode lookup controller and barcode UI search component.
- **Complexity**: Medium | **Dependencies**: Phase 6.
- **Definition of Done**: Scanning barcode `0012345678905` yields exact product nutrients.

### Phase 8: Daily Meal Logging & Timeline UI
- **Objective**: Build meal logging interface categorized by Breakfast, Lunch, Dinner, and Snack slots.
- **Deliverables**: `MealLogView.tsx`, meal log creation/deletion endpoints.
- **Complexity**: Medium | **Dependencies**: Phase 7.
- **Definition of Done**: User can log, update portion size, and delete meal entries.

### Phase 9: Daily Calorie Budget & Macro Progress Ring UI
- **Objective**: Construct visual SVG calorie ring and animated macro progress bars.
- **Deliverables**: `Dashboard.tsx` macro widgets and total calorie recalculation logic.
- **Complexity**: Low | **Dependencies**: Phase 8.
- **Definition of Done**: Logging a 500 kcal meal immediately updates calorie ring.

### Phase 10: Recharts Analytics & Micronutrient RDA Gauges
- **Objective**: Build interactive analytics dashboard displaying weekly calorie trends and vitamin/mineral RDAs.
- **Deliverables**: `AnalyticsView.tsx` with Recharts BarChart, Donut Chart, and progress gauges.
- **Complexity**: Medium | **Dependencies**: Phase 9.
- **Definition of Done**: Weekly trends and micronutrients render seamlessly on mobile/desktop.

---

## 3. Phases 11 - 20: AI Vision, Scanning & Medical Agents

### Phase 11: AI Vision Camera Scanner Reticle UI
- **Objective**: Build camera viewfinder with animated green laser sweep line and dish reticle.
- **Deliverables**: `ScannerModal.tsx` camera mode UI.
- **Complexity**: Medium | **Dependencies**: Phase 9.
- **Definition of Done**: Viewfinder renders live webcam stream with laser animation.

### Phase 12: Python FastAPI Vision & OCR Feature Extraction Service
- **Objective**: Build FastAPI microservice hosting OpenCV & TensorFlow model for food image classification.
- **Deliverables**: `/api/v1/vision/analyze` endpoint.
- **Complexity**: High | **Dependencies**: Phase 11.
- **Definition of Done**: Uploading dish photo returns top 3 food matches with confidence scores.

### Phase 13: Localized Indian Food Database Expansion
- **Objective**: Add 10+ authentic Indian dishes with photos, Hindi names, and ICMR-NIN nutritional values.
- **Deliverables**: Seed data for Butter Chicken, Paneer Tikka, Masala Dosa, Chole Bhature, Biryani, Dal Tadka.
- **Complexity**: Medium | **Dependencies**: Phase 6.
- **Definition of Done**: Indian dishes render with cuisine badges and Hindi titles.

### Phase 14: AI Nutritionist Conversational Chat Assistant
- **Objective**: Build interactive AI Health Assistant chat interface with quick action prompt chips.
- **Deliverables**: `CoachView.tsx` and OpenAI GPT-4o stream API integration.
- **Complexity**: High | **Dependencies**: Phase 9.
- **Definition of Done**: AI Coach responds intelligently to protein and meal planning queries.

### Phase 15: Medical Lab Analysis Agent & Blood Report Reader
- **Objective**: Implement blood report analyzer evaluating CBC, Glucose, HbA1c, Lipids, Vit D3, and B12.
- **Deliverables**: `MedicalReportView.tsx` and biometric health score calculation engine.
- **Complexity**: High | **Dependencies**: Phase 4.
- **Definition of Done**: Inputting low Vitamin D3 triggers automated deficiency warnings.

### Phase 16: Localized Budget Meal Planning Engine
- **Objective**: Implement meal generator filtering by budget tiers (₹100, ₹150, ₹300, ₹500, ₹1000+/day).
- **Deliverables**: Budget meal planner module & cost optimization algorithm.
- **Complexity**: High | **Dependencies**: Phase 13.
- **Definition of Done**: Setting a ₹150/day budget yields high-protein local recipes (Eggs, Soya, Chana).

### Phase 17: Glycemic Index (GI) & NOVA Processing Group Classifier
- **Objective**: Annotate all food items with Glycemic Index ratings and NOVA Group 1-4 processing levels.
- **Deliverables**: Food schema updates and GI/NOVA UI badges.
- **Complexity**: Medium | **Dependencies**: Phase 6.
- **Definition of Done**: Scanned result displays GI and NOVA badges.

### Phase 18: Extended Micronutrient & Electrolyte Tracking
- **Objective**: Track Magnesium, Zinc, Sodium, Potassium, Vit E, Vit K, and Folate in daily logs.
- **Deliverables**: Micronutrient breakdown expansion in `ScanResultCard.tsx`.
- **Complexity**: Medium | **Dependencies**: Phase 10.
- **Definition of Done**: Users can view extended vitamin & mineral metrics per meal.

### Phase 19: AI Supplement Stack Advisor Agent
- **Objective**: Recommend evidence-based supplement stacks (Whey, Creatine, D3+K2, Omega-3, Magnesium) with monthly INR budget calculations.
- **Deliverables**: `SupplementView.tsx` component.
- **Complexity**: Medium | **Dependencies**: Phase 15.
- **Definition of Done**: Supplement recommendations pass medical safety checks.

### Phase 20: Automated Grocery Shopping List Generator
- **Objective**: Generate itemized market shopping lists categorized by Produce, Protein, Grains, and Spices.
- **Deliverables**: `GroceryPlannerView.tsx` with interactive purchase checkboxes and cart total.
- **Complexity**: Medium | **Dependencies**: Phase 16.
- **Definition of Done**: Adding grocery items updates total cart expenditure in INR.

---

## 4. Phases 21 - 30: Workout Periodization, Enterprise & Scaling

### Phase 21: AI Workout Periodization Generator Agent
- **Objective**: Build workout plan generator supporting Push/Pull/Legs, Upper/Lower, and Full Body splits.
- **Deliverables**: `WorkoutPlanView.tsx` and periodization engine.
- **Complexity**: High | **Dependencies**: Phase 4.
- **Definition of Done**: System generates 6-day hypertrophy routine with sets, reps, and rest timers.

### Phase 22: 1,000+ Exercise HD Video & Muscle Map Library
- **Objective**: Build exercise library with primary/secondary muscle maps, tips, and common mistake warnings.
- **Deliverables**: Exercise modal inspector UI & exercise schema.
- **Complexity**: Medium | **Dependencies**: Phase 21.
- **Definition of Done**: Clicking an exercise opens video clips and execution tips.

### Phase 23: Progressive Overload & RPE/RIR Logger
- **Objective**: Log completed weight, reps, and RPE for each set to compute 1RM and progressive load increments.
- **Deliverables**: Workout execution logger UI.
- **Complexity**: High | **Dependencies**: Phase 21.
- **Definition of Done**: System suggests 2.5 kg weight increase when top set RPE is < 7.

### Phase 24: PDF Generator Agent (Diet, Workout, Grocery, Medical)
- **Objective**: Build 1-click formatted printable PDF report generator using Puppeteer / WeasyPrint.
- **Deliverables**: `PdfExportView.tsx` and PDF stream endpoints.
- **Complexity**: High | **Dependencies**: Phase 10, 15, 20, 21.
- **Definition of Done**: Downloading PDF produces a clean, print-ready document.

### Phase 25: Gamification, Badges & Weekly Leaderboards
- **Objective**: Implement streak badges, total calories logged milestones, and social leaderboards.
- **Deliverables**: Gamification widget and points calculation engine.
- **Complexity**: Medium | **Dependencies**: Phase 8.
- **Definition of Done**: Completing a 7-day logging streak unlocks the "Consistency Master" badge.

### Phase 26: Enterprise Personal Trainer & Gym Owner Dashboard
- **Objective**: Build multi-tenant client portal for trainers to monitor client compliance and assign plans.
- **Deliverables**: `/trainer/dashboard` route and client manager portal.
- **Complexity**: High | **Dependencies**: Phase 3, 21.
- **Definition of Done**: Personal trainer can view client food logs and assign custom workouts.

### Phase 27: Multi-Language Localization (i18n) & Voice Assistant
- **Objective**: Support English, Hindi, Spanish, French, and German translations with Web Speech API integration.
- **Deliverables**: `next-intl` configuration and voice assistant component.
- **Complexity**: High | **Dependencies**: Phase 4.
- **Definition of Done**: App toggles seamlessly between English and Hindi.

### Phase 28: PWA & Offline Storage Synchronization
- **Objective**: Enable offline PWA support with service workers and IndexedDB offline log queueing.
- **Deliverables**: `next-pwa` configuration and offline sync manager.
- **Complexity**: High | **Dependencies**: Phase 8.
- **Definition of Done**: Meal logs created offline sync automatically when connection restores.

### Phase 29: End-to-End Security Hardening & Penetration Testing
- **Objective**: Conduct OWASP vulnerability scans, rate-limiting audits, and CORS policy enforcement.
- **Deliverables**: Security audit report and hardened API headers.
- **Complexity**: High | **Dependencies**: Phase 3, 11.
- **Definition of Done**: Zero high or critical vulnerabilities detected in security scan.

### Phase 30: Production Kubernetes Deployment & Global CDN Launch
- **Objective**: Deploy microservices to AWS EKS Kubernetes with multi-AZ failover and Cloudflare WAF.
- **Deliverables**: Production deployment pipeline, Datadog monitoring dashboards, and live SSL DNS.
- **Complexity**: High | **Dependencies**: Phase 29.
- **Definition of Done**: FitForge AI platform live in production with 99.99% uptime target.
