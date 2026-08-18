# 4-BackendSchema.md — Data Models & Schemas

> **Forma (FitForge AI)**: Strict JSON and TypeScript schemas for all entities in the system.

---

## 1. FoodItem & PlateComponent Schema

```typescript
export interface PlateComponent {
  id: string;
  name: string;
  hindiName?: string;
  portionGrams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  category?: string;
  selected?: boolean;
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
  vitamins: {
    c_mg?: number;
    a_iu?: number;
    d_iu?: number;
    e_mg?: number;
    k_mcg?: number;
    b12_mcg?: number;
    b6_mg?: number;
    folate_mcg?: number;
  };
  minerals: {
    potassium_mg?: number;
    iron_mg?: number;
    calcium_mg?: number;
    sodium_mg?: number;
    magnesium_mg?: number;
    zinc_mg?: number;
  };
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
  isDecomposedPlate?: boolean;
  decomposedComponents?: PlateComponent[];
  ocrRawText?: string;
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  source: string;
  confidenceScore?: number;
  lastUpdated: string;
}
```

---

## 2. MealLog Schema

```typescript
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'snack';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

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
  plannedMealKey?: string;
  loggedAt: string;
}
```

---

## 3. Clinical Blood Biomarker Schema (ADA 2026 / ISO 15189)

```typescript
export interface BloodReport {
  id: string;
  date: string;
  hemoglobin_gdl: number;       // 12.0 - 16.0 g/dL
  fastingGlucose_mgdl: number;  // 70 - 99 mg/dL (ADA 2026 Normal)
  hba1c_pct: number;            // < 5.7 % (ADA 2026 Normal)
  totalCholesterol_mgdl: number;// < 200 mg/dL (NCEP ATP III)
  hdl_mgdl: number;             // > 50 mg/dL (AHA Normal)
  ldl_mgdl: number;             // < 100 mg/dL (Optimal)
  triglycerides_mgdl: number;   // < 150 mg/dL (Normal)
  creatinine_mgdl: number;      // 0.6 - 1.2 mg/dL (KDIGO)
  eGfr_mlmin?: number;          // > 90 mL/min/1.73m²
  alt_uL: number;               // 7 - 56 U/L (Liver SGPT)
  ast_uL: number;               // 10 - 40 U/L (Liver SGOT)
  vitaminD3_ngml: number;       // 30 - 100 ng/mL (Sufficiency)
  vitaminB12_pgml: number;      // 300 - 900 pg/mL
  tsh_uIUml?: number;           // 0.45 - 4.50 uIU/mL
  uricAcid_mgdl?: number;       // 3.5 - 7.2 mg/dL
}
```

---

## 4. User Profile & Nutrition Goals Schema

```typescript
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  healthGoal: 'weight_loss' | 'muscle_gain' | 'maintain_weight' | 'heart_health' | 'keto_adapted' | 'diabetic_management';
  calculationFormula: 'who_fao' | 'mifflin_st_jeor' | 'katch_mcardle' | 'harris_benedict';
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  dailyFiberTargetG: number;
  dailyBudgetInr?: number;
  monthlyBudgetInr?: number;
  supplementBudgetInr?: number;
  currency: 'INR' | 'USD' | 'EUR';
  createdAt: string;
  updatedAt: string;
}
```
