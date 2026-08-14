# Master Prompt: AI Fitness & Nutrition Coach — Full-Stack Web Application

## 1. Project Identity & Objective

Build a production-grade, responsive web application called **"FitPro AI"** — an AI-powered fitness, nutrition, and meal planning platform. The app must empower users to track calories, scan food, generate budget-conscious meal plans, follow guided exercises with visual demonstrations, and receive personalized nutrition coaching based on their TDEE (Total Daily Energy Expenditure).

**Platform**: Responsive Web App (desktop + mobile web).  
**Tone**: Empowering, trustworthy, clean, and efficient.  
**Security Posture**: Zero-trust architecture. Production-hardened authentication. No shortcuts.

---

## 2. Technology Stack (Non-Negotiable)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3.4+
- **UI Components**: shadcn/ui as base; all components must follow the FITpro Design System tokens
- **State Management**: Zustand for client state; React Query (TanStack Query) for server state
- **3D/2D Visualization**: Three.js or React Three Fiber for exercise figure; fallback to Lottie/SVG animations
- **Charts**: Recharts or Tremor for progress dashboards

### Backend
- **API Framework**: Python 3.11+ with FastAPI
- **AI/ML Integration**: OpenAI Responses API (GPT-4o / GPT-4o-mini) with structured JSON outputs
- **Validation**: Pydantic v2 for all request/response models
- **Task Queue**: Celery + Redis for async meal plan generation, PDF exports, image processing

### Database & Storage
- **Primary DB**: PostgreSQL 15+ (via Supabase or AWS RDS)
- **ORM**: Prisma (for Node.js auth service) or SQLAlchemy (for Python backend)
- **Cache**: Redis (session store, rate limiting, TDEE calculation cache)
- **File Storage**: AWS S3 or Supabase Storage (food images, progress photos, PDFs)
- **Search**: PostgreSQL full-text search or lightweight Elasticsearch for food database

### Authentication & Security
- **Auth Library**: Better Auth or Auth.js (NextAuth.js v5)
- **Password Hashing**: Argon2id (minimum memory cost 64MB, parallelism 2, iterations 3)
- **Session Management**: Secure, HttpOnly, SameSite=Strict cookies. NO localStorage for tokens.
- **OAuth**: Google OAuth 2.0 with PKCE, state parameter, and nonce validation
- **Rate Limiting**: Upstash Redis or native Redis (5 attempts per 15 min on auth endpoints)
- **Validation**: Zod for frontend; Pydantic for backend
- **CAPTCHA**: Cloudflare Turnstile on registration and password reset

### DevOps
- **Containerization**: Docker + Docker Compose for local development
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (backend); Vercel Analytics (frontend)

---

## 3. Design System (Strict Compliance)

Adopt the **FITpro Design System** exactly. No visual judgment calls.

### Typography
- **Primary Font**: `acumin-pro, Acumin Pro, Helvetica Neue, Helvetica, Arial, sans-serif`
- **Scale**: xs(9px), sm(11px), md(12px/base), lg(13px), xl(14px), 2xl(15px), 3xl(16px), 4xl(20px)
- **Base**: 12px / 400 weight / 15.6px line-height

### Color Tokens (Semantic Only — Never Raw Hex)
| Token | Value | Usage |
|---|---|---|
| `color.text.primary` | `#191919` | Primary text on light surfaces |
| `color.text.secondary` | `#ffffff` | Text on dark/base surfaces |
| `color.text.tertiary` | `#0057ff` | Links, active states, primary actions |
| `color.text.inverse` | `#707070` | Disabled/placeholder ONLY (never for required info) |
| `color.surface.base` | `#000000` | App background |
| `color.surface.muted` | `#e8e8e8` | Cards, list rows, input backgrounds |
| `color.error` | `#dc2626` | Destructive actions, validation errors (must be added) |
| `color.success` | `#16a34a` | Success states |
| `color.warning` | `#f59e0b` | Warnings, budget alerts |

### Spacing
- Micro tokens: 1px, 2px, 2.75px, 3px, 4px, 5px, 7px, 7.5px
- Layout base unit: **7px** (multiples: 7, 14, 21, 28, 35, 42, 49, 56)

### Component States (All 7 Required)
Every interactive component (button, link, input, list row, nav tab) MUST implement:
1. **Default**
2. **Hover** (pointer only, 8% darken)
3. **Focus-visible** (2px outline, 2px offset, `color.text.tertiary`)
4. **Active/Pressed** (scale 0.97, 200ms)
5. **Disabled** (opacity 40%, `pointer-events: none`, `aria-disabled`)
6. **Loading** (spinner, fixed width, focusable but non-actionable)
7. **Error** (border + text message, never color-only)

### Accessibility (Testable Criteria)
- Touch targets: minimum **44×44px** regardless of visual size
- Contrast: ≥4.5:1 for body text; ≥3:1 for large text (18px+)
- Focus visibility: Every interactive element must show visible focus ring on keyboard navigation
- Labels: No placeholder-only labels. Persistent labels always.
- Screen readers: All icon buttons must have `aria-label`; live badges must be announced

---

## 4. Core Features & Functional Requirements

### 4.1 Authentication & User Management
- **Registration**: Email + password (min 8 chars, no ridiculous complexity rules)
- **Email Verification**: Required before any sensitive action; single-use token, 15-min expiry
- **Login**: Secure session cookies; generic error messages ("Invalid credentials")
- **Password Reset**: Cryptographically random token (32+ bytes), hashed in DB, 15-min expiry, single-use
- **Social Login**: Google OAuth 2.0 with PKCE, state validation, nonce verification, email_verified check before auto-linking
- **Profile Setup Wizard** (post-registration):
  - Personal info: age, gender, height, weight
  - Activity level (sedentary → extra active)
  - Dietary preferences: vegan, vegetarian, keto, paleo, halal, kosher
  - Allergies: multi-select (peanuts, tree nuts, dairy, gluten, shellfish, eggs, soy, fish)
  - Health goals: weight loss, maintenance, muscle gain, body recomposition
  - Budget: monthly food budget in local currency
- **Session Management**: Device listing, global logout, session invalidation on password change
- **RBAC**: `user` and `admin` roles minimum. Admin dashboard for food database management.

### 4.2 TDEE Calculator & Onboarding
- Calculate TDEE using Mifflin-St Jeor equation + activity multiplier
- Display BMR, TDEE, and target calories based on goal (deficit/surplus)
- Store calculations and allow re-calculation with history
- Show macronutrient targets (protein: 1.6-2.2g/kg, fats: 20-35%, carbs: remainder)

### 4.3 Food Scanner (AI-Powered)
**Image Recognition:**
- Upload or capture food image (drag-drop + camera access on mobile)
- Backend processes via AI vision model (OpenAI GPT-4o Vision or dedicated food recognition API)
- Return: food name, estimated portion, calories, macros (P/C/F), micronutrients, ingredients, allergens
- Confidence score displayed; allow user correction
- Save scanned items to personal food history

**Barcode Scanner:**
- Camera-based barcode scanning (use QuaggaJS or similar on web)
- Lookup against Open Food Facts API + internal database
- Return structured nutritional data instantly (< 1 second target)
- Fallback to manual entry if barcode not found

**Nutritional Display:**
- Card-based layout with clear hierarchy
- Calorie ring/progress indicator
- Macro breakdown with visual bars
- Allergen flags (red badges if conflicts with user profile)
- Dietary tag compatibility (green checkmarks)
- "Log Meal" CTA with portion size adjustment

### 4.4 Monthly Budget Meal Planner (Flagship Feature)
**Requirements:**
- User sets a **monthly food budget** and **number of people** during onboarding (editable later)
- System generates a **30-day meal plan** with:
  - **3 meals/day**: Breakfast, Lunch, Dinner
  - **2 snacks/day**: Morning Snack, Afternoon Snack
  - All meals must stay **under the user's daily TDEE target**
  - All meals must fit within the **monthly budget** (daily budget = monthly / 30)
  - Respect **allergies, dietary preferences, and health goals**
  - Nutritional variety: rotate proteins, carb sources, vegetables
  - Seasonal ingredient awareness (where possible)

**AI Prompt Structure for Meal Generation:**
```
Generate a 30-day meal plan as structured JSON.
Inputs:
- TDEE: {calories} kcal/day
- Daily budget: ${amount}
- Monthly budget: ${amount}
- Dietary preference: {preference}
- Allergies: {list}
- Goal: {goal}
- People: {count}

Output schema:
{
  "monthly_plan": {
    "total_estimated_cost": number,
    "daily_average_cost": number,
    "days": [
      {
        "day": 1-30,
        "date": "ISO date",
        "meals": {
          "breakfast": { "name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number, "estimated_cost": number, "ingredients": [string], "prep_time_min": number, "instructions": [string] },
          "morning_snack": { ... },
          "lunch": { ... },
          "afternoon_snack": { ... },
          "dinner": { ... }
        },
        "daily_totals": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "cost": number }
      }
    ]
  }
}

Rules:
- Total daily calories must not exceed TDEE by more than 50 kcal
- Each day's total cost must not exceed daily budget
- Use affordable, widely available ingredients
- Minimize food waste by reusing ingredients across days
- Provide simple prep instructions (≤5 steps per meal)
- Snacks must be 100-250 calories each
```

**UI/UX:**
- Calendar view: 30-day grid with meal previews
- Daily detail view: expandable cards for each meal
- Swap meal button: regenerates a single meal while maintaining budget/tdee constraints
- "Cook Mode": step-by-step view with checkboxes
- Nutritional summary sidebar: weekly averages, budget remaining
- Grocery list auto-generation from meal plan

### 4.5 Exercise Library & Guided Workouts
**Exercise Database:**
- 200+ exercises categorized by: muscle group, equipment (bodyweight, dumbbell, barbell, machine, cable), difficulty (beginner/intermediate/advanced), type (strength, cardio, flexibility)
- Each exercise includes:
  - Name and aliases
  - Primary and secondary muscle groups
  - Equipment required
  - Difficulty rating
  - Step-by-step written instructions (5-8 steps)
  - Tips and common mistakes
  - Estimated calories burned per minute (by body weight)

**3D/2D Human Figure Visualization:**
- Interactive anatomical figure showing muscle groups
- When user selects an exercise, highlight the **primary muscles worked** in `color.text.tertiary` (blue)
- Secondary muscles in a lighter shade
- Use a clean, stylized SVG or lightweight 3D model (Three.js) — avoid heavy assets
- Figure must be rotatable (front/back view minimum)
- On muscle click: show list of exercises targeting that muscle

**Workout Builder:**
- Create custom workouts by adding exercises from library
- Set: sets, reps, rest time, RPE (Rate of Perceived Exertion)
- Rest timer with audio cue
- Mark sets as complete during workout
- Workout history with performance tracking (weight lifted, volume)

**Pre-built Workout Plans:**
- Full Body (3x/week)
- Upper/Lower Split (4x/week)
- Push/Pull/Legs (6x/week)
- Cardio & Mobility (2-3x/week)
- Each plan auto-adjusts based on user fitness level

### 4.6 Calorie & Macro Tracking
**Daily Dashboard:**
- Circular progress rings for: calories, protein, carbs, fats, water
- Quick-add: recent foods, barcode scan, image scan, manual entry
- Meal sections: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack
- Each entry shows: food name, portion, calories, macro mini-bars
- Swipe/edit/delete on each entry

**Food Database:**
- 50,000+ food items with USDA-standardized nutrition data
- Search with autocomplete (fuzzy matching)
- Recent and frequent items surfaced first
- Custom food creation (user-defined items)
- Meal creation (save combinations as reusable meals)

**Water Tracker:**
- Quick-add buttons: 250ml, 500ml, custom
- Daily goal based on body weight (35ml/kg)
- Streak tracking

### 4.7 Progress Tracking
**Metrics:**
- Weight log with chart (line chart, 7/30/90/365 day views)
- Body measurements: chest, waist, hips, arms, thighs (with trend arrows)
- Progress photos: side-by-side comparison tool with date slider
- Strength PRs: personal records by exercise
- Consistency score: weekly adherence percentage

**Charts & Visualizations:**
- Weight trend line with moving average
- Calorie intake vs. target (bar chart)
- Macro distribution pie chart (daily/weekly)
- Budget adherence (monthly spend vs. planned)
- Workout volume progression

**AI Insights:**
- Weekly summary generated by AI: "You've averaged 2,150 kcal this week, 150 under target. Your protein intake is consistently high. Consider increasing carbs on workout days."
- Anomaly detection: "Unusual weight spike detected — likely water retention from high sodium on Tuesday."

### 4.8 Grocery List Generator
- Auto-generate from meal plan or manual selection
- Categorized by store section: produce, dairy, meat, pantry, frozen
- Estimated cost per item and total
- Checkbox to mark as purchased
- Export to PDF or share via text/email
- Price tracking over time (if user inputs actual costs)

### 4.9 PDF Reports
- **Diet Plan PDF**: Full 30-day meal plan with recipes, nutrition summary, grocery lists
- **Workout Plan PDF**: Exercise schedule with sets/reps, muscle group targets
- **Progress Report PDF**: Weight chart, measurement changes, photo timeline, achievement summary
- Generated server-side with ReportLab or WeasyPrint
- Downloadable from profile/settings

### 4.10 AI Nutrition Coach (Chat Interface)
- Conversational interface for nutrition questions
- Context-aware: knows user's TDEE, goals, allergies, recent meals
- Sample queries: "What should I eat before my workout?", "Suggest a high-protein vegetarian dinner under $5", "Why am I not losing weight?"
- Structured responses with actionable advice
- Option to log suggested meals directly from chat

---

## 5. Database Schema (PostgreSQL)

### Users & Auth
```sql
users (user_id PK, email UNIQUE, password_hash, first_name, last_name, date_of_birth, gender, height_cm, weight_kg, activity_level, tdee, goal, monthly_budget, currency, email_verified, role, created_at, updated_at)
sessions (session_id PK, user_id FK, token_hash, expires_at, created_at, ip_address, user_agent)
email_verifications (id PK, user_id FK, token_hash, expires_at, used_at)
password_resets (id PK, user_id FK, token_hash, expires_at, used_at)
oauth_accounts (id PK, user_id FK, provider, provider_account_id, access_token, refresh_token, expires_at)
```

### Dietary & Preferences
```sql
dietary_preferences (preference_id PK, user_id FK, type, value, created_at)
allergies (allergy_id PK, user_id FK, allergen, severity, created_at)
```

### Food & Nutrition
```sql
food_items (food_id PK, name, barcode, brand, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_mg, image_url, source, verified, created_at)
food_ingredients (id PK, food_id FK, ingredient_name, is_allergen)
user_foods (id PK, user_id FK, food_id FK, custom_name, custom_calories, custom_portion_g, is_favorite, created_at)
```

### Meal Logging
```sql
meal_logs (log_id PK, user_id FK, food_id FK, meal_type, portion_size_g, calories_logged, protein_g, carbs_g, fat_g, logged_date, logged_at, source)
water_logs (id PK, user_id FK, amount_ml, logged_at)
```

### Meal Plans
```sql
meal_plans (plan_id PK, user_id FK, plan_name, start_date, end_date, monthly_budget, daily_budget, total_days, status, created_at)
meal_plan_days (day_id PK, plan_id FK, day_number, date, daily_calories, daily_cost, is_complete)
meal_plan_meals (meal_id PK, day_id FK, meal_type, name, calories, protein_g, carbs_g, fat_g, fiber_g, estimated_cost, prep_time_min, instructions_json, ingredients_json, is_swapped, original_meal_id)
```

### Exercise
```sql
exercises (exercise_id PK, name, aliases_json, primary_muscle, secondary_muscles_json, equipment, difficulty, exercise_type, instructions_json, tips_json, calories_per_minute_json, image_url, video_url, is_verified)
workouts (workout_id PK, user_id FK, name, description, schedule_json, difficulty, created_at)
workout_exercises (id PK, workout_id FK, exercise_id FK, day_of_week, order_index, sets, reps, rest_seconds, rpe_target, notes)
workout_logs (log_id PK, user_id FK, workout_id FK, started_at, completed_at, total_volume, total_duration_sec)
workout_set_logs (id PK, log_id FK, exercise_id FK, set_number, reps_completed, weight_kg, rpe_actual, is_pr)
```

### Progress
```sql
weight_logs (id PK, user_id FK, weight_kg, logged_at, source)
body_measurements (id PK, user_id FK, chest_cm, waist_cm, hips_cm, left_arm_cm, right_arm_cm, left_thigh_cm, right_thigh_cm, logged_at)
progress_photos (id PK, user_id FK, photo_url, photo_type, logged_at)
```

### Grocery & Budget
```sql
grocery_lists (list_id PK, user_id FK, plan_id FK, name, total_estimated_cost, total_actual_cost, status, created_at)
grocery_items (item_id PK, list_id FK, ingredient_name, category, quantity, unit, estimated_price, actual_price, is_purchased, added_at)
```

---

## 6. API Architecture (FastAPI)

### Auth Routes (Middleware-protected by default)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
GET    /api/auth/me
PUT    /api/auth/me
POST   /api/auth/oauth/google
```

### User & Profile
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/me/preferences
POST   /api/users/me/preferences
DELETE /api/users/me/preferences/{id}
GET    /api/users/me/allergies
POST   /api/users/me/allergies
POST   /api/users/me/calculate-tdee
```

### Food & Scanning
```
POST   /api/food/scan/image          # multipart/form-data
GET    /api/food/scan/barcode/{barcode}
GET    /api/food/search?q={query}&limit=20
GET    /api/food/{food_id}
POST   /api/food/custom              # Create custom food
GET    /api/food/recent              # User's recent foods
```

### Meal Logging
```
POST   /api/meals/log
GET    /api/meals/log?date=YYYY-MM-DD&start_date=&end_date=
PUT    /api/meals/log/{log_id}
DELETE /api/meals/log/{log_id}
GET    /api/meals/summary?period=daily|weekly|monthly
POST   /api/water/log
GET    /api/water/log?date=YYYY-MM-DD
```

### Meal Planner
```
POST   /api/meal-plans/generate      # Async, returns job_id
GET    /api/meal-plans/generate/{job_id}/status  # Poll for completion
GET    /api/meal-plans
GET    /api/meal-plans/{plan_id}
PUT    /api/meal-plans/{plan_id}
DELETE /api/meal-plans/{plan_id}
POST   /api/meal-plans/{plan_id}/swap-meal       # Regenerate single meal
GET    /api/meal-plans/{plan_id}/grocery-list
POST   /api/meal-plans/{plan_id}/export-pdf
```

### Exercise
```
GET    /api/exercises?muscle=&equipment=&difficulty=&search=
GET    /api/exercises/{exercise_id}
GET    /api/exercises/muscles          # List all muscle groups for figure
POST   /api/workouts
GET    /api/workouts
GET    /api/workouts/{workout_id}
PUT    /api/workouts/{workout_id}
DELETE /api/workouts/{workout_id}
POST   /api/workouts/{workout_id}/log
GET    /api/workouts/logs
```

### Progress
```
POST   /api/progress/weight
GET    /api/progress/weight?days=30
POST   /api/progress/measurements
GET    /api/progress/measurements
POST   /api/progress/photos
GET    /api/progress/photos
GET    /api/progress/dashboard
GET    /api/progress/insights          # AI-generated weekly insights
```

### Coach (AI Chat)
```
POST   /api/coach/chat                 # Streaming SSE response
GET    /api/coach/history
DELETE /api/coach/history
```

---

## 7. Security Requirements (Non-Negotiable)

### Authentication
1. **NO localStorage/sessionStorage for tokens.** Access tokens in memory only. Refresh tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies.
2. **Short-lived access tokens**: 15 minutes. Refresh tokens: 7 days with rotation (new refresh token on each use, old invalidated).
3. **Password hashing**: Argon2id only. Minimum 8 characters. No plaintext or fast hashes (MD5/SHA1 forbidden).
4. **Rate limiting**: 5 failed login attempts per IP per 15 minutes. Account lockout after 10 failed attempts (30 min).
5. **Generic errors**: "Invalid credentials" for all auth failures. Never reveal if email exists.
6. **Email verification**: Required before accessing meal plans or logging data.
7. **Password reset**: 32-byte random token, hashed in DB, 15-min expiry, single-use, invalidate all sessions on use.

### Authorization
1. **Server-side identity only**: Extract `user_id` from verified JWT/session. NEVER trust client-supplied `user_id`.
2. **RBAC**: Middleware enforces roles. Admin routes check `req.user.role === 'admin'`.
3. **Resource ownership**: Every query must include `WHERE user_id = current_user_id`. Return 404 (not 403) for unauthorized access to existing resources.
4. **Parameterized queries**: ORM or parameterized SQL exclusively. No string concatenation.

### OAuth (Google)
1. Use Authorization Code + PKCE flow ONLY.
2. Validate `state` parameter cryptographically on callback.
3. Verify `nonce` in ID token to prevent replay attacks.
4. Validate ID token signature against Google's JWKS. Verify `iss`, `aud`, `exp`, `iat`.
5. Use ID token for identity, NOT access token.
6. Generate YOUR OWN session after OAuth. Don't use Google's tokens as your app session.
7. Auto-link only if `email_verified: true`. Otherwise require explicit confirmation.
8. Clear OAuth temp cookies immediately after callback.

### Input Validation
1. **Zod/Pydantic** on ALL inputs before processing.
2. Sanitize all user-generated content before rendering (XSS prevention).
3. Content Security Policy (CSP) headers.
4. File uploads: validate MIME type, scan for malware, size limit (5MB), store outside web root.

### Transport & CORS
1. HTTPS everywhere. Reject HTTP.
2. CORS: Whitelist exact origins. NEVER `*` when credentials enabled.
3. CSRF: `SameSite=Strict` cookies. Double Submit Cookie pattern for cookie-based sessions.

### Logging & Monitoring
1. Log security events: failed logins, password resets, privilege escalation, OAuth linking.
2. NEVER log passwords, tokens, or secrets.
3. Structured logging (JSON) to CloudWatch or similar.

---

## 8. AI/ML Integration Patterns

### Meal Plan Generation (Async)
```
User Request → API validates inputs → Celery task queued → 
OpenAI API call with structured prompt → Parse JSON response → 
Validate against TDEE/budget constraints → Store in DB → 
Notify user via SSE or polling endpoint
```
- Timeout: 60 seconds
- Retry: 2 attempts with exponential backoff
- Fallback: If AI fails, return cached generic plan matching user's calorie target

### Food Image Recognition
```
Image upload → S3 → Preprocessing (resize, format) → 
OpenAI Vision API or TensorFlow model → Parse response → 
Match against food database → Return top 3 matches with confidence scores
```

### AI Coach Chat
```
User message → System prompt with user context (TDEE, goals, recent meals, allergies) → 
OpenAI Responses API with function calling → 
If function call (e.g., "log_meal"), execute and return result → 
Stream response back to user via SSE
```

### Structured Output Enforcement
- Use Pydantic models for all AI outputs
- Set `response_format: { type: "json_object" }` or function schemas
- Validate AI output against schema; reject and retry if invalid
- Never render raw AI output directly to UI without sanitization

---

## 9. Frontend Architecture (Next.js App Router)

### Route Structure
```
/                          → Landing page
/auth/login                → Login
/auth/register             → Registration
/auth/verify-email         → Email verification
/auth/forgot-password      → Password reset request
/auth/reset-password       → Password reset confirmation
/dashboard                 → Main dashboard (daily tracker)
/dashboard/food            → Food search & logging
/dashboard/scan            → Barcode + image scanner
/dashboard/meal-planner    → Monthly meal plan view
/dashboard/meal-planner/[planId] → Plan detail
/dashboard/exercises       → Exercise library
/dashboard/exercises/[id]  → Exercise detail with figure
/dashboard/workouts        → Workout builder & logs
/dashboard/progress        → Progress charts & photos
/dashboard/coach           → AI chat interface
/profile                   → User settings & preferences
/admin                     → Admin dashboard (RBAC protected)
```

### State Management
- **Zustand stores**:
  - `authStore`: user, session, login/logout actions
  - `mealLogStore`: daily meals, quick-add cache
  - `mealPlanStore`: current plan, generation status
  - `workoutStore`: active workout, exercise library cache
  - `uiStore`: theme, sidebar state, toast notifications
- **React Query**: All server data with optimistic updates
- **Persist middleware**: Only for non-sensitive UI preferences (never auth tokens)

### Data Fetching Pattern
```typescript
// Server component for initial load
async function MealPlanPage({ params }) {
  const plan = await api.mealPlans.get(params.planId); // Server-side fetch
  return <MealPlanView initialData={plan} />;
}

// Client component for interactivity
function MealPlanView({ initialData }) {
  const { data } = useQuery(['mealPlan', initialData.id], () => 
    api.mealPlans.get(initialData.id), 
    { initialData }
  );
  // ...
}
```

---

## 10. Performance Requirements

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.5s |
| API response (auth) | < 200ms (p95) |
| API response (food search) | < 300ms (p95) |
| Image scan result | < 5 seconds |
| Barcode scan result | < 1 second |
| Meal plan generation | < 45 seconds (async) |
| Database query (common) | < 100ms |
| Bundle size (initial) | < 200KB gzipped |

### Optimization Rules
- Image optimization: Next.js Image component, WebP format, lazy loading
- Code splitting: Route-based splitting, dynamic imports for heavy components (charts, 3D figure)
- Caching: React Query stale-while-revalidate, Redis for API responses
- Database: Indexed columns on `user_id`, `logged_date`, `barcode`
- CDN: CloudFront for static assets and images

---

## 11. Folder Structure

```
fitpro-ai/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/                # Next.js API routes (auth proxy)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── meal-planner/
│   │   ├── exercises/
│   │   ├── progress/
│   │   └── coach/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts              # Axios instance with interceptors
│   │   ├── auth.ts             # Better Auth / Auth.js config
│   │   └── utils.ts
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript interfaces
│   └── public/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py         # Dependencies (DB, auth, rate limit)
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── food.py
│   │   │   │   ├── meals.py
│   │   │   │   ├── meal_plans.py
│   │   │   │   ├── exercises.py
│   │   │   │   ├── workouts.py
│   │   │   │   ├── progress.py
│   │   │   │   └── coach.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic Settings
│   │   │   ├── security.py     # Password hashing, JWT, middleware
│   │   │   └── exceptions.py
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── food_service.py
│   │   │   ├── meal_plan_generator.py  # AI integration
│   │   │   ├── exercise_service.py
│   │   │   └── progress_service.py
│   │   ├── tasks/              # Celery tasks
│   │   │   ├── generate_meal_plan.py
│   │   │   └── export_pdf.py
│   │   ├── ai/
│   │   │   ├── prompts/        # System prompts for OpenAI
│   │   │   ├── client.py       # OpenAI client wrapper
│   │   │   └── parsers.py      # Response parsing & validation
│   │   └── main.py
│   ├── alembic/                # Database migrations
│   ├── tests/
│   └── Dockerfile
├── shared/
│   └── types/                  # Shared TypeScript/Python types
└── docker-compose.yml
```

---

## 12. Development Rules

1. **Security First**: Every feature must pass the security checklist before merge.
2. **Type Safety**: 100% TypeScript coverage on frontend. Strict Pydantic validation on backend.
3. **No Raw Values**: All colors, spacing, and typography must use design tokens. No hex codes in component code.
4. **Component Completeness**: Every interactive element must implement all 7 states (default, hover, focus, active, disabled, loading, error).
5. **Accessibility First**: 44×44px touch targets, focus rings, ARIA labels, persistent labels on inputs.
6. **Test Coverage**: Unit tests for all services, integration tests for API endpoints, E2E tests for critical flows (auth, meal logging, plan generation).
7. **Error Handling**: Never expose stack traces or DB errors to client. Log securely. User-facing messages must be actionable.
8. **Performance Budget**: Monitor bundle size. Lazy load routes and heavy components.
9. **Database Safety**: All migrations must be reversible. Never drop columns with data without backup plan.
10. **AI Safety**: Validate all AI outputs before storing. Implement fallbacks for AI service downtime.

---

## 13. Implementation Phases

### Phase 1: Foundation & Auth (Week 1-2)
- Project scaffolding (Next.js + FastAPI + Docker)
- Database setup with migrations
- Authentication system (register, login, email verification, password reset, Google OAuth)
- RBAC middleware
- Base UI components with design tokens

### Phase 2: Core Tracking (Week 3-4)
- User profile & TDEE calculator
- Food database seeding (USDA data)
- Food search & manual logging
- Daily dashboard with macro rings
- Water tracker
- Barcode scanner integration

### Phase 3: AI Food Scanner (Week 5)
- Image upload & preprocessing
- OpenAI Vision integration
- Scan results UI with allergen flags
- Food history & favorites

### Phase 4: Meal Planner (Week 6-7)
- Budget input & validation
- AI meal plan generation (async Celery tasks)
- 30-day calendar view
- Daily meal detail with cook mode
- Meal swap functionality
- Grocery list auto-generation

### Phase 5: Exercise System (Week 8-9)
- Exercise database seeding
- Exercise library with search/filters
- 3D/2D muscle figure (Three.js or SVG)
- Workout builder
- Workout logger with rest timer
- Pre-built workout plans

### Phase 6: Progress & Insights (Week 10)
- Weight & measurement logging
- Progress photos with comparison
- Charts and visualizations
- AI weekly insights
- PDF export (diet, workout, progress)

### Phase 7: AI Coach & Polish (Week 11-12)
- Chat interface with SSE streaming
- Context-aware coaching
- Admin dashboard
- Performance optimization
- Security audit & penetration testing
- E2E testing

---

## 14. Quality Assurance Checklist

Before shipping any feature:
- [ ] All API endpoints validate auth AND authorization server-side
- [ ] No secrets in frontend bundles or committed to git
- [ ] All database queries parameterized
- [ ] Rate limiting active on auth and AI endpoints
- [ ] Input validation on every endpoint (Zod/Pydantic)
- [ ] All 7 component states implemented and tested
- [ ] Touch targets ≥44×44px
- [ ] Focus rings visible on keyboard navigation
- [ ] Color contrast verified (≥4.5:1)
- [ ] Screen reader labels on all non-text elements
- [ ] Error states provide actionable messages
- [ ] Loading states prevent layout shift
- [ ] AI outputs validated against schema
- [ ] Fallbacks implemented for AI failures
- [ ] PDFs generated server-side, not client-side
- [ ] Images optimized and served via CDN
- [ ] Database indexes on foreign keys and search columns

---

## 15. Anti-Patterns (Forbidden)

- ❌ Storing JWTs in localStorage or sessionStorage
- ❌ Using `*` for CORS origin with credentials
- ❌ Raw SQL string concatenation
- ❌ Client-side role/permission checks without server validation
- ❌ Hardcoded secrets, API keys, or database URLs
- ❌ Placeholder-only input labels
- ❌ Color-only error indicators (must have text + icon)
- ❌ Skipping email verification for core features
- ❌ Using AI output directly in SQL queries or HTML without sanitization
- ❌ Synchronous AI calls blocking the HTTP request (always async)
- ❌ Raw hex codes or magic numbers in component code
- ❌ One-off spacing values outside the design token scale

---

**END OF MASTER PROMPT**

Generate the complete application following this specification exactly. Prioritize security, accessibility, and type safety at every step. Ask clarifying questions only if requirements are ambiguous — otherwise, proceed with implementation.
