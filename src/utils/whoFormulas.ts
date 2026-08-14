/**
 * WHO / FAO / UNU & Clinical Energy Requirements and Macronutrient Distribution Engine
 * Official standards: WHO Technical Report Series 935 / FAO Food and Nutrition Technical Report 1
 */

import { Gender, ActivityLevel, HealthGoal } from '../types';

export type CalculationFormula = 'who_fao' | 'mifflin_st_jeor' | 'katch_mcardle' | 'harris_benedict';

export interface CalculationResult {
  formulaUsed: string;
  formulaDescription: string;
  bmr: number;
  tdee: number;
  palMultiplier: number;
  caloriesTarget: number;
  proteinGrams: number;
  proteinGramsPerKg: number;
  carbsGrams: number;
  fatsGrams: number;
  fiberGrams: number;
  saturatedFatLimitGrams: number;
  freeSugarLimitGrams: number;
  waterLiters: number;
}

/**
 * 1. WHO / FAO / UNU 2004 BMR Equations
 * Based on Age Group, Gender, and Body Weight (kg)
 */
export function calculateWhoBmr(weightKg: number, age: number, gender: Gender): number {
  if (age < 3) {
    return gender === 'female' ? Math.round(58.317 * weightKg - 31.1) : Math.round(59.512 * weightKg - 30.4);
  } else if (age <= 10) {
    return gender === 'female' ? Math.round(20.315 * weightKg + 485.9) : Math.round(22.706 * weightKg + 504.3);
  } else if (age <= 18) {
    return gender === 'female' ? Math.round(13.384 * weightKg + 692.6) : Math.round(17.686 * weightKg + 658.2);
  } else if (age <= 30) {
    // 18-30 Years (WHO Standard)
    return gender === 'female' ? Math.round(14.818 * weightKg + 486.6) : Math.round(15.057 * weightKg + 692.2);
  } else if (age <= 60) {
    // 30-60 Years (WHO Standard)
    return gender === 'female' ? Math.round(8.126 * weightKg + 845.6) : Math.round(11.472 * weightKg + 873.1);
  } else {
    // > 60 Years
    return gender === 'female' ? Math.round(9.082 * weightKg + 658.5) : Math.round(11.711 * weightKg + 587.7);
  }
}

/**
 * 2. Mifflin-St Jeor Clinical Equation (ADA Gold Standard)
 */
export function calculateMifflinStJeorBmr(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'female' ? base - 161 : base + 5);
}

/**
 * 3. Katch-McArdle Equation (Lean Body Mass)
 */
export function calculateKatchMcArdleBmr(weightKg: number, bodyFatPct: number = 18): number {
  const leanMassKg = weightKg * (1 - bodyFatPct / 100);
  return Math.round(370 + 21.6 * leanMassKg);
}

/**
 * 4. Harris-Benedict Revised Equation (Roza & Shizgal 1984)
 */
export function calculateHarrisBenedictBmr(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (gender === 'female') {
    return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);
  }
  return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
}

/**
 * WHO / FAO Physical Activity Level (PAL) Multipliers
 */
export const WHO_PAL_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.4, // Light/seated work with little movement
  lightly_active: 1.55, // Light exercise 1-3 days/week
  moderately_active: 1.75, // Moderate exercise 3-5 days/week (WHO standard active)
  very_active: 1.9, // Hard training 6-7 days/week
  extra_active: 2.1, // Elite athlete / rigorous physical labor
};

/**
 * Master WHO Clinical Energy & Macro Calculator
 */
export function calculateClinicalNutrition(params: {
  weightKg: number;
  heightCm: number;
  age?: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  healthGoal: HealthGoal | string;
  formula?: CalculationFormula;
  bodyFatPct?: number;
}): CalculationResult {
  const {
    weightKg = 70,
    heightCm = 175,
    age = 26,
    gender = 'male',
    activityLevel = 'moderately_active',
    healthGoal = 'maintain_weight',
    formula = 'who_fao',
    bodyFatPct = 18,
  } = params;

  // 1. Calculate BMR
  let bmr = 0;
  let formulaDescription = '';

  switch (formula) {
    case 'who_fao':
      bmr = calculateWhoBmr(weightKg, age, gender);
      formulaDescription = 'WHO / FAO / UNU Expert Consultation (TRS 935) Standard';
      break;
    case 'katch_mcardle':
      bmr = calculateKatchMcArdleBmr(weightKg, bodyFatPct);
      formulaDescription = 'Katch-McArdle Lean Body Mass Equation';
      break;
    case 'harris_benedict':
      bmr = calculateHarrisBenedictBmr(weightKg, heightCm, age, gender);
      formulaDescription = 'Harris-Benedict Revised Equation (Roza & Shizgal)';
      break;
    case 'mifflin_st_jeor':
    default:
      bmr = calculateMifflinStJeorBmr(weightKg, heightCm, age, gender);
      formulaDescription = 'Mifflin-St Jeor Clinical Equation (ADA Standard)';
      break;
  }

  // 2. Calculate Total Daily Energy Expenditure (TDEE) via WHO PAL
  const pal = WHO_PAL_MULTIPLIERS[activityLevel] || 1.75;
  const tdee = Math.round(bmr * pal);

  // 3. Goal Caloric Offset
  let caloriesTarget = tdee;
  const isLoss = healthGoal === 'lose_weight' || healthGoal === 'weight_loss';
  const isGain = healthGoal === 'build_muscle' || healthGoal === 'muscle_gain';
  const isDiabetic = healthGoal === 'diabetes_management' || healthGoal === 'diabetic_management';

  if (isLoss) {
    caloriesTarget = Math.max(1200, Math.round(tdee - 450)); // 450-500 kcal safe WHO deficit
  } else if (isGain) {
    caloriesTarget = Math.round(tdee + 350); // 300-400 kcal lean hypertrophy surplus
  } else if (isDiabetic) {
    caloriesTarget = Math.round(tdee - 200); // Mild deficit for insulin sensitivity
  }

  // 4. WHO & ISSN Protein Multipliers (g/kg body weight)
  let proteinPerKg = 1.0; // WHO baseline standard: 0.83 - 1.0g/kg
  if (isGain) {
    proteinPerKg = 2.0; // High Hypertrophy: 1.8 - 2.2g/kg
  } else if (isLoss) {
    proteinPerKg = 1.8; // Muscle preservation during deficit
  } else if (isDiabetic || healthGoal === 'heart_health') {
    proteinPerKg = 1.4; // High satiety & glycemic stabilization
  } else {
    proteinPerKg = 1.4; // Active baseline
  }

  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinGrams * 4;

  // 5. WHO Recommended Fat Intake: 25% - 30% of total daily energy
  let fatPct = 0.25;
  if (healthGoal === 'diabetes_management' || healthGoal === 'heart_health') {
    fatPct = 0.28; // High MUFA / PUFA allocation
  }
  const fatCals = caloriesTarget * fatPct;
  const fatsGrams = Math.round(fatCals / 9);

  // 6. Remainder Carbohydrates (WHO AMDR: 45% - 60%)
  const carbsCals = Math.max(0, caloriesTarget - proteinCals - fatCals);
  const carbsGrams = Math.round(carbsCals / 4);

  // 7. WHO Micronutrient & Fiber Thresholds
  const fiberGrams = Math.round((caloriesTarget / 1000) * 14); // WHO 14g fiber per 1000 kcal
  const saturatedFatLimitGrams = Math.round((caloriesTarget * 0.08) / 9); // WHO < 8-10% of total energy
  const freeSugarLimitGrams = Math.round((caloriesTarget * 0.05) / 4); // WHO < 5% of energy
  const waterLiters = Number(((weightKg * 35) / 1000).toFixed(1)); // WHO 35ml per kg body weight

  return {
    formulaUsed: formula,
    formulaDescription,
    bmr,
    tdee,
    palMultiplier: pal,
    caloriesTarget,
    proteinGrams,
    proteinGramsPerKg: Number(proteinPerKg.toFixed(2)),
    carbsGrams,
    fatsGrams,
    fiberGrams,
    saturatedFatLimitGrams,
    freeSugarLimitGrams,
    waterLiters,
  };
}
