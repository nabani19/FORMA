export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type HealthGoal = 'weight_loss' | 'muscle_gain' | 'maintain_weight' | 'heart_health' | 'keto_adapted' | 'diabetic_management';
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'snack';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  healthGoal: HealthGoal;
  calculationFormula?: 'who_fao' | 'mifflin_st_jeor' | 'katch_mcardle' | 'harris_benedict';
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  dailyFiberTargetG: number;
  dailyBudgetInr?: number;
  monthlyBudgetInr?: number;
  supplementBudgetInr?: number;
  currency?: 'INR' | 'USD' | 'EUR';
  createdAt: string;
  updatedAt: string;
}

export interface DietaryPreference {
  preferenceId: string;
  userId: string;
  type: 'preference' | 'allergy' | 'restriction';
  value: string;
}

export interface Vitamins {
  c_mg?: number;
  a_iu?: number;
  d_iu?: number;
  e_mg?: number;
  k_mcg?: number;
  b12_mcg?: number;
  b6_mg?: number;
  folate_mcg?: number;
}

export interface Minerals {
  potassium_mg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  sodium_mg?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
}

export interface NutritionalInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  netCarbs_g?: number;
  fat_g: number;
  saturatedFat_g?: number;
  transFat_g?: number;
  fiber_g: number;
  sugar_g: number;
  addedSugar_g?: number;
  glycemicIndex?: number;
  glycemicLoad?: number;
  novaGroup?: 1 | 2 | 3 | 4;
  vitamins: Vitamins;
  minerals: Minerals;
}

export interface FoodItem {
  _id: string;
  name: string;
  hindiName?: string;
  barcode?: string;
  imageUrl: string;
  category: string;
  cuisine: 'Indian' | 'Asian' | 'American' | 'Mediterranean' | 'Mexican' | 'Global';
  servingSizeGrams: number;
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  source: string;
  confidenceScore?: number;
  lastUpdated: string;
}

export interface MealLog {
  logId: string;
  userId: string;
  foodItemId: string;
  foodName: string;
  imageUrl: string;
  mealType: MealType;
  portionSizeGrams: number;
  calculatedNutrients: NutritionalInfo;
  costInr?: number;
  dayOfWeek?: DayOfWeek;
  loggedAt: string;
}

// 🩺 MEDICAL REPORT ANALYSIS MODEL
export interface BloodReport {
  id: string;
  date: string;
  hemoglobin_gdl: number;      // e.g. 13.5 (12-16 Normal - WHO Anemia standard)
  fastingGlucose_mgdl: number; // e.g. 95 (70-99 Normal - ADA 2026 criteria)
  hba1c_pct: number;           // e.g. 5.4 (<5.7 Normal - ADA criteria)
  totalCholesterol_mgdl: number;// e.g. 185 (<200 Desirable - NCEP ATP III)
  hdl_mgdl: number;            // e.g. 52 (>50 Normal - AHA)
  ldl_mgdl: number;            // e.g. 110 (<100 Optimal)
  triglycerides_mgdl: number;  // e.g. 130 (<150 Normal)
  creatinine_mgdl: number;     // e.g. 0.9 (0.6-1.2 Normal - KDIGO)
  eGfr_mlmin?: number;         // e.g. 95 (>90 Normal)
  alt_uL: number;              // e.g. 24 (7-56 Normal)
  ast_uL: number;              // e.g. 22 (10-40 Normal)
  vitaminD3_ngml: number;      // e.g. 24 (30-100 Sufficiency - Endocrine Society)
  vitaminB12_pgml: number;     // e.g. 210 (300-900 Normal)
  tsh_uIUml?: number;          // e.g. 2.1 (0.45-4.50 Normal - ATA)
  uricAcid_mgdl?: number;      // e.g. 5.2 (3.5-7.2 Normal)
}

export interface MedicalRiskAnalysis {
  overallHealthScore: number; // 0 - 100
  risksDetected: string[];
  dietaryAdjustments: string[];
  supplementDeficiencyTriggers: string[];
}

// 🏋️ WORKOUT PLAN MODEL
export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  sets: number;
  reps: string; // e.g. "8-12"
  restSeconds: number;
  equipment: string;
  targetMuscles: string[];
  tips: string;
}

export interface WorkoutDay {
  dayName: string; // e.g. "Day 1 - Push Focus"
  focus: string;
  exercises: Exercise[];
  cardioMinutes: number;
  mobilityRoutine: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  splitType: 'Push Pull Legs' | 'Upper Lower' | 'Full Body 4-Day';
  days: WorkoutDay[];
}

// 💊 SUPPLEMENT RECOMMENDATION MODEL
export interface SupplementRecommendation {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  rationale: string;
  evidenceRating: 'A+ (Strong Evidence)' | 'A (High Support)' | 'B (Moderate Support)';
  medicalCheckPassed: boolean;
  estMonthlyCostINR: number;
}

// 🛒 GROCERY SHOPPING LIST MODEL
export interface GroceryItem {
  id: string;
  name: string;
  category: 'Produce' | 'Protein & Dairy' | 'Grains & Pulses' | 'Pantry & Spices';
  quantity: string;
  estPriceINR: number;
  purchased: boolean;
}

export interface CoachingTip {
  id: string;
  title: string;
  category: 'protein' | 'hydration' | 'micronutrients' | 'macro_balance' | 'allergen_warning' | 'indian_diet';
  summary: string;
  details: string;
  actionableSteps: string[];
  impactLevel: 'high' | 'medium' | 'low';
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  suggestedFoods?: Partial<FoodItem>[];
}
