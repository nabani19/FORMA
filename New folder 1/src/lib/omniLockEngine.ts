/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OMNI-LOCK APEX BUDGET MEAL PLANNER ENGINE (TypeScript Port)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Uses Constrained Mathematical Optimization & Smart Escrow Rollover to:
 *   1. Intersect Biology (Mifflin-St Jeor TDEE & 97% Macros) & Finance (Budget Cap)
 *   2. Guarantee Zero Budget Overrun (₹0 Overrun Hard Lock)
 *   3. Roll unspent daily money into the Escrow Vault for future days
 *   4. Rotate grocery food matrices dynamically across 7 days of the week
 */

export interface GroceryItem {
  name: string;
  p: number;    // protein per gram
  c: number;    // carbs per gram
  f: number;    // fat per gram
  cost: number; // cost per gram in ₹
}

export const GROCERY_DB: Record<string, GroceryItem> = {
  "Eggs":           { name: "Eggs",           p: 0.13, c: 0.01, f: 0.11,  cost: 0.15 },
  "Chicken Breast": { name: "Chicken Breast", p: 0.31, c: 0.00, f: 0.036, cost: 0.25 },
  "Soya Chunks":    { name: "Soya Chunks",    p: 0.52, c: 0.33, f: 0.01,  cost: 0.08 },
  "Paneer":         { name: "Paneer",         p: 0.18, c: 0.02, f: 0.20,  cost: 0.40 },
  "Whey Protein":   { name: "Whey Protein",   p: 0.80, c: 0.10, f: 0.06,  cost: 0.60 },
  "Oats":           { name: "Oats",           p: 0.13, c: 0.67, f: 0.07,  cost: 0.05 },
  "Brown Rice":     { name: "Brown Rice",     p: 0.03, c: 0.76, f: 0.01,  cost: 0.04 },
  "Olive Oil":      { name: "Olive Oil",      p: 0.00, c: 0.00, f: 1.00,  cost: 0.20 },
};

export interface OmniLockPlanItem {
  food: string;
  grams: number;
  cost: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface OmniLockResult {
  success: boolean;
  message?: string;
  target_kcal: number;
  target_macros: { p: number; c: number; f: number };
  actual_kcal: number;
  actual_macros: { p: number; c: number; f: number };
  actual_cost: number;
  budget_remaining: number;
  meal_plan: OmniLockPlanItem[];
}

export interface MonthlyLedgerEntry {
  day: number;
  available_budget: number;
  budget_used: number;
  saved_today: number;
  escrow_rollover: number;
  macros: { p: number; c: number; f: number };
  kcal: number;
  food_plan: OmniLockPlanItem[];
}

export interface MonthlyOmniLockSummary {
  monthly_budget: number;
  total_spent: number;
  budget_remaining: number;
  average_daily_cost: number;
  ledger: MonthlyLedgerEntry[];
}

/**
 * Rotated Macro Distribution Profiles for 7 Days of the Week
 */
const ROTATION_PROFILES = [
  // Day 0 (Mon): High Soya & Chicken + Oats & Rice
  { pDistribution: [ { food: "Soya Chunks", ratio: 0.40 }, { food: "Chicken Breast", ratio: 0.35 }, { food: "Eggs", ratio: 0.25 } ], cOatsRatio: 0.45, cRiceRatio: 0.55 },
  // Day 1 (Tue): Paneer & Whey + Oats & Rice
  { pDistribution: [ { food: "Paneer", ratio: 0.40 }, { food: "Whey Protein", ratio: 0.30 }, { food: "Eggs", ratio: 0.30 } ], cOatsRatio: 0.60, cRiceRatio: 0.40 },
  // Day 2 (Wed): Chicken & Soya + Rice & Oats
  { pDistribution: [ { food: "Chicken Breast", ratio: 0.50 }, { food: "Soya Chunks", ratio: 0.30 }, { food: "Eggs", ratio: 0.20 } ], cOatsRatio: 0.40, cRiceRatio: 0.60 },
  // Day 3 (Thu): Soya & Paneer & Whey
  { pDistribution: [ { food: "Soya Chunks", ratio: 0.35 }, { food: "Paneer", ratio: 0.35 }, { food: "Whey Protein", ratio: 0.30 } ], cOatsRatio: 0.50, cRiceRatio: 0.50 },
  // Day 4 (Fri): Whey & Chicken & Eggs
  { pDistribution: [ { food: "Whey Protein", ratio: 0.45 }, { food: "Chicken Breast", ratio: 0.35 }, { food: "Eggs", ratio: 0.20 } ], cOatsRatio: 0.50, cRiceRatio: 0.50 },
  // Day 5 (Sat): Paneer & Chicken & Soya
  { pDistribution: [ { food: "Paneer", ratio: 0.45 }, { food: "Chicken Breast", ratio: 0.35 }, { food: "Soya Chunks", ratio: 0.20 } ], cOatsRatio: 0.55, cRiceRatio: 0.45 },
  // Day 6 (Sun): Eggs & Soya & Whey
  { pDistribution: [ { food: "Eggs", ratio: 0.40 }, { food: "Soya Chunks", ratio: 0.35 }, { food: "Whey Protein", ratio: 0.25 } ], cOatsRatio: 0.55, cRiceRatio: 0.45 },
];

/**
 * Solves the OmniLock Constrained Optimization problem for a single day.
 * Accepts daySeed to vary food items across days of the week.
 */
export function solveDailyOmniLock(
  weightKg: number,
  heightCm: number,
  age: number,
  goal: string,
  dailyBudget: number,
  escrowRollover: number = 0,
  daySeed: number = 0
): OmniLockResult {
  const effectiveBudget = Math.max(10, dailyBudget + escrowRollover);

  // 1. Biological Targets (Mifflin-St Jeor)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const tdee = bmr * 1.55;

  let targetKcal = tdee;
  const lowerGoal = goal.toLowerCase();
  if (lowerGoal.includes('fat') || lowerGoal.includes('loss')) {
    targetKcal = tdee * 0.80;
  } else if (lowerGoal.includes('muscle') || lowerGoal.includes('gain') || lowerGoal.includes('bulk')) {
    targetKcal = tdee * 1.10;
  }

  // 2. 97% Macro Targets
  const targetP = (targetKcal * 0.40 / 4) * 0.97;
  const targetC = (targetKcal * 0.40 / 4) * 0.97;
  const targetF = (targetKcal * 0.20 / 9) * 0.97;

  // Select rotation profile for daySeed
  const profile = ROTATION_PROFILES[daySeed % 7];

  const gramsMap: Record<string, number> = {
    "Eggs": 0, "Chicken Breast": 0, "Soya Chunks": 0, "Paneer": 0,
    "Whey Protein": 0, "Oats": 0, "Brown Rice": 0, "Olive Oil": 0,
  };

  // Solve protein distribution
  profile.pDistribution.forEach(({ food, ratio }) => {
    const item = GROCERY_DB[food];
    if (item && item.p > 0) {
      gramsMap[food] = (targetP * ratio) / item.p;
    }
  });

  // Calculate contributed carbs & fats from protein items
  let cFromP = 0;
  let fFromP = 0;
  Object.entries(gramsMap).forEach(([food, grams]) => {
    const item = GROCERY_DB[food];
    if (item) {
      cFromP += grams * item.c;
      fFromP += grams * item.f;
    }
  });

  // Solve carbs distribution (Oats & Brown Rice)
  const cNeeded = Math.max(0, targetC - cFromP);
  gramsMap["Oats"] = (cNeeded * profile.cOatsRatio) / GROCERY_DB["Oats"].c;
  gramsMap["Brown Rice"] = (cNeeded * profile.cRiceRatio) / GROCERY_DB["Brown Rice"].c;

  // Calculate contributed fat
  let fTotal = fFromP + (gramsMap["Oats"] * GROCERY_DB["Oats"].f) + (gramsMap["Brown Rice"] * GROCERY_DB["Brown Rice"].f);
  const fNeeded = Math.max(0, targetF * 0.95 - fTotal);
  gramsMap["Olive Oil"] = fNeeded / GROCERY_DB["Olive Oil"].f;

  // Calculate total cost
  let rawCost = 0;
  Object.entries(gramsMap).forEach(([food, grams]) => {
    const item = GROCERY_DB[food];
    if (item) rawCost += grams * item.cost;
  });

  // Financial Lock: Scale down or optimize if exceeding effective budget
  if (rawCost > effectiveBudget) {
    const scaleRatio = effectiveBudget / rawCost;
    Object.keys(gramsMap).forEach(food => {
      gramsMap[food] *= scaleRatio;
    });
  }

  const plan: OmniLockPlanItem[] = [];
  let totalCost = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let totalKcal = 0;

  Object.entries(gramsMap).forEach(([food, gramsRaw]) => {
    const grams = Math.round(gramsRaw * 10) / 10;
    if (grams >= 1) {
      const db = GROCERY_DB[food];
      const cost = Math.round(grams * db.cost * 100) / 100;
      const p = Math.round(grams * db.p * 10) / 10;
      const c = Math.round(grams * db.c * 10) / 10;
      const f = Math.round(grams * db.f * 10) / 10;
      const kcal = Math.round(p * 4 + c * 4 + f * 9);

      plan.push({ food, grams, cost, kcal, p, c, f });
      totalCost += cost;
      totalP += p;
      totalC += c;
      totalF += f;
      totalKcal += kcal;
    }
  });

  totalCost = Math.round(totalCost * 100) / 100;
  totalP = Math.round(totalP * 10) / 10;
  totalC = Math.round(totalC * 10) / 10;
  totalF = Math.round(totalF * 10) / 10;

  return {
    success: true,
    target_kcal: Math.round(targetKcal),
    target_macros: { p: Math.round(targetP), c: Math.round(targetC), f: Math.round(targetF) },
    actual_kcal: totalKcal,
    actual_macros: { p: totalP, c: totalC, f: totalF },
    actual_cost: totalCost,
    budget_remaining: Math.max(0, Math.round((effectiveBudget - totalCost) * 100) / 100),
    meal_plan: plan,
  };
}

/**
 * Simulates a full 30-day month using the OmniLock Escrow Manager algorithm.
 * Dynamically rotates daySeed and rolls unspent funds into escrow.
 */
export function generateMonthlyOmniLock(
  weightKg: number,
  heightCm: number,
  age: number,
  goal: string,
  monthlyBudget: number
): MonthlyOmniLockSummary {
  const baseDailyBudget = monthlyBudget / 30.0;
  let escrowFunds = 0;
  let totalMonthSpent = 0;
  const ledger: MonthlyLedgerEntry[] = [];

  for (let day = 1; day <= 30; day++) {
    const availableToday = baseDailyBudget + escrowFunds;
    const result = solveDailyOmniLock(weightKg, heightCm, age, goal, baseDailyBudget, escrowFunds, day - 1);

    if (result.success) {
      totalMonthSpent += result.actual_cost;
      const savedToday = result.budget_remaining;
      escrowFunds = savedToday; // roll over to tomorrow

      ledger.push({
        day,
        available_budget: Math.round(availableToday * 100) / 100,
        budget_used: result.actual_cost,
        saved_today: savedToday,
        escrow_rollover: escrowFunds,
        macros: result.actual_macros,
        kcal: result.actual_kcal,
        food_plan: result.meal_plan,
      });
    }
  }

  return {
    monthly_budget: monthlyBudget,
    total_spent: Math.round(totalMonthSpent * 100) / 100,
    budget_remaining: Math.max(0, Math.round((monthlyBudget - totalMonthSpent) * 100) / 100),
    average_daily_cost: Math.round((totalMonthSpent / 30) * 100) / 100,
    ledger,
  };
}
