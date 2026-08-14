export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'maintenance';
export type DietaryPreference = 'standard' | 'keto' | 'vegan' | 'high_protein' | 'intermittent_fasting';
export type SubscriptionPlan = 'free' | 'pro' | 'elite';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  dailyBudgetInr: number;
  monthlyBudgetInr?: number;
  subscriptionPlan: SubscriptionPlan;
  allergies: string[];
}

export interface MacroGoals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
}

// ── Bergman ODE Types ─────────────────────────────────────────────────────────
export interface BergmanParams {
  /** Glucose effectiveness (1/min) */
  p1: number;
  /** Remote insulin clearance rate (1/min) */
  p2: number;
  /** Insulin sensitivity factor */
  p3: number;
  /** Baseline fasting glucose (mg/dL) */
  Gb: number;
  /** Baseline fasting insulin (µU/mL) */
  Ib: number;
}

export interface GlucoseCurvePoint {
  t: number; // minutes
  G: number; // mg/dL
}

/** Scan session phase state machine — matches App Flow Document.md */
export type ScanSessionPhase =
  | 'IDLE'            // No scan started
  | 'AI_PROCESSING'   // AI vision running
  | 'GATE_1_IDENTITY' // User picks food identity from top-3
  | 'GATE_2_PORTION'  // User confirms grams with slider
  | 'ODE_COMPUTING'   // Bergman RK4 solver running
  | 'CURVE_READY'     // Glucose curve rendered, awaiting log
  | 'LOGGED';         // Meal logged to dashboard

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodiumMg: number;
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  vitaminCMg?: number;
  glycemicIndex?: number; // 0 to 100
  sugarSpikeRisk?: 'Low' | 'Moderate' | 'High';
  servingSize: string;
  priceInr: number;
  imageUrl?: string;
  allergens?: string[];
  dietaryFlags?: string[];
  healthScore: number; // 1 to 100
  substitutions?: string[];
  // ── Clinical ODE Output (set after Bergman solver runs) ──────────────────
  predictedCurve?: GlucoseCurvePoint[];
  predictedAUC?: number;
  peakGlucoseMgDl?: number;
  peakTimeMins?: number;
  estimatedGrams?: number;
  processingLevel?: 'Whole Food' | 'Minimally Processed' | 'Processed' | 'Ultra-Processed';
  qualityScore?: string;
  ingredients?: string[];
  cookingMethod?: string;
  hiddenIngredients?: string[];
  magnesiumMg?: number;
}

export interface LoggedMeal {
  id: string;
  foodItem: FoodItem;
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
}

export interface AIVisionModel {
  id: string;
  name: string;
  badge: string;
  description: string;
  latencyMs: number;
  accuracyPercent: number;
  architecture: string;
  isOfflineCapable: boolean;
}
