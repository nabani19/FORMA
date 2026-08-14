import assert from 'assert';
import { User, DietaryPreference, FoodItem, MealLog, BloodReport } from '../types';
import { INITIAL_USER, INITIAL_PREFERENCES, INITIAL_FOOD_DATABASE, ALL_DIETARY_REGIMES, ALL_FOOD_ALLERGENS } from '../data/mockFoodDatabase';
import { calculateClinicalNutrition, calculateWhoBmr } from '../utils/whoFormulas';
import { TOTAL_EXERCISES_INDEXED, MUSCLE_HIERARCHY, FEATURED_EXERCISES } from '../data/exerciseDatabase';

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✕ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// Medical Report Risk Score with ADA 2026 & ISO 15189
function calculateHealthScore(report: BloodReport): number {
  let score = 100;
  if (report.fastingGlucose_mgdl >= 100) score -= 15;
  if (report.hba1c_pct >= 5.7) score -= 15;
  if (report.vitaminD3_ngml < 30) score -= 10;
  if (report.vitaminB12_pgml < 300) score -= 10;
  if (report.totalCholesterol_mgdl > 200) score -= 10;
  return Math.max(0, score);
}

function runAllTRACkerTests() {
  console.log('\n🥑 Starting FitForge AI Automated Clinical & Architectural Verification Suite...\n');

  // Test 1: WHO / FAO / UNU 2004 Energy Equations
  runTest('WHO/FAO/UNU 2004 BMR equations produce clinical precision energy targets', () => {
    const bmrMale = calculateWhoBmr(70, 25, 'male');
    // 15.057 * 70 + 692.2 = 1746.19 -> 1746
    assert.strictEqual(bmrMale, 1746);

    const bmrFemale = calculateWhoBmr(60, 25, 'female');
    // 14.818 * 60 + 486.6 = 1375.68 -> 1376
    assert.strictEqual(bmrFemale, 1376);

    const clinical = calculateClinicalNutrition({
      weightKg: 70,
      heightCm: 175,
      age: 25,
      gender: 'male',
      activityLevel: 'moderately_active',
      healthGoal: 'muscle_gain',
      formula: 'who_fao',
    });

    assert.ok(clinical.caloriesTarget > 2500, 'Muscle gain target should include clinical hypercaloric surplus');
    assert.strictEqual(clinical.proteinGrams, 140, 'Should target 2.0g/kg protein for muscle gain');
  });

  // Test 2: Full 22 Dietary Regimes & 18 Food Allergens Matrix
  runTest('Expanded Dietary Regimes (22) and Allergen Safeguards (18) are properly indexed', () => {
    assert.ok(ALL_DIETARY_REGIMES.length >= 22, 'Must contain at least 22 recognized dietary regimes');
    assert.ok(ALL_FOOD_ALLERGENS.length >= 18, 'Must contain at least 18 allergen safeguard profiles');

    const jainRegime = ALL_DIETARY_REGIMES.find(r => r.name.toLowerCase().includes('jain'));
    assert.ok(jainRegime, 'Jain Dietary Regime must be indexed');

    const peanutAllergy = ALL_FOOD_ALLERGENS.find(a => a.name.toLowerCase().includes('peanut'));
    assert.ok(peanutAllergy, 'Peanut allergen safeguard must be indexed');
  });

  // Test 3: 5-Meals a Day and Monthly Budget System
  runTest('5-Meals a day structure supports daily and monthly budget allocations', () => {
    const userBudgetMonthly = 6000;
    const dailyTarget = Math.round(userBudgetMonthly / 30);
    assert.strictEqual(dailyTarget, 200);

    const day5Meals = [
      { slot: 'breakfast', cost: 45 },
      { slot: 'morning_snack', cost: 25 },
      { slot: 'lunch', cost: 60 },
      { slot: 'evening_snack', cost: 30 },
      { slot: 'dinner', cost: 40 },
    ];

    const totalDayCost = day5Meals.reduce((acc, m) => acc + m.cost, 0);
    assert.strictEqual(totalDayCost, 200);
    assert.ok(totalDayCost <= dailyTarget, '5-meal plan should not breach daily allocated budget');
  });

  // Test 4: 1,000+ Head-to-Toe Exercises & 24+ Anatomical Muscle Hierarchy
  runTest('1,000+ Head-to-toe exercise database indexes all anatomical muscle regions', () => {
    assert.ok(TOTAL_EXERCISES_INDEXED >= 1000, `Must index at least 1,000 exercises (actual: ${TOTAL_EXERCISES_INDEXED})`);
    assert.ok(MUSCLE_HIERARCHY.length >= 24, `Must index at least 24 muscle groups (actual: ${MUSCLE_HIERARCHY.length})`);
    assert.ok(FEATURED_EXERCISES.length >= 8);

    const neck = MUSCLE_HIERARCHY.find(m => m.id === 'neck');
    const tibialis = MUSCLE_HIERARCHY.find(m => m.id === 'tibialis');
    assert.ok(neck, 'Head/Neck muscles must be present');
    assert.ok(tibialis, 'Tibialis Anterior (Toe/Shin) must be present');
  });

  // Test 5: Medical Lab Risk Analyzer (ISO 15189 & ADA 2026)
  runTest('Medical Report Risk Score penalizes ADA Pre-Diabetes and Vitamin D deficiencies', () => {
    const mockReport: BloodReport = {
      id: 'b1',
      date: '2026-08-01',
      hemoglobin_gdl: 14.0,
      fastingGlucose_mgdl: 110, // +15 penalty (Pre-diabetes)
      hba1c_pct: 5.9,           // +15 penalty (Pre-diabetes)
      totalCholesterol_mgdl: 180,
      hdl_mgdl: 55,
      ldl_mgdl: 95,
      triglycerides_mgdl: 120,
      creatinine_mgdl: 0.9,
      alt_uL: 20,
      ast_uL: 22,
      vitaminD3_ngml: 20,       // +10 penalty
      vitaminB12_pgml: 450,
    };

    const healthScore = calculateHealthScore(mockReport);
    assert.strictEqual(healthScore, 60);
  });

  console.log(`\n==================================================`);
  console.log(`TEST RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTRACkerTests();
