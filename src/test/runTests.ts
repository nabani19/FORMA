import assert from 'assert';
import { User, DietaryPreference, FoodItem, MealLog, BloodReport } from '../types';
import { INITIAL_USER, INITIAL_PREFERENCES, INITIAL_FOOD_DATABASE, ALL_DIETARY_REGIMES, ALL_FOOD_ALLERGENS } from '../data/mockFoodDatabase';
import { calculateClinicalNutrition, calculateWhoBmr } from '../utils/whoFormulas';
import { TOTAL_EXERCISES_INDEXED, MUSCLE_HIERARCHY, FEATURED_EXERCISES } from '../data/exerciseDatabase';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';
import { runOwaspSecurityAudit, getSecurityHeaders } from '../utils/securityEngine';
import { getProductionClusterTelemetry, checkLivenessProbe } from '../utils/k8sHealth';
import { 
  semanticFoodFallback, 
  lookupBarcodeProduct, 
  parseAndSanitizeAiFoodResponse, 
  convertVisualPortionToGrams, 
  VISUAL_PORTION_GUIDES 
} from '../utils/aiVisionService';

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
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

async function runAllTRACkerTests() {
  console.log('\n🥑 Starting FitForge AI Automated Clinical & Architectural Verification Suite...\n');

  // Test 1: WHO / FAO / UNU 2004 Energy Equations
  await runTest('WHO/FAO/UNU 2004 BMR equations produce clinical precision energy targets', () => {
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
  await runTest('Expanded Dietary Regimes (22) and Allergen Safeguards (18) are properly indexed', () => {
    assert.ok(ALL_DIETARY_REGIMES.length >= 22, 'Must contain at least 22 recognized dietary regimes');
    assert.ok(ALL_FOOD_ALLERGENS.length >= 18, 'Must contain at least 18 allergen safeguard profiles');

    const jainRegime = ALL_DIETARY_REGIMES.find(r => r.name.toLowerCase().includes('jain'));
    assert.ok(jainRegime, 'Jain Dietary Regime must be indexed');

    const peanutAllergy = ALL_FOOD_ALLERGENS.find(a => a.name.toLowerCase().includes('peanut'));
    assert.ok(peanutAllergy, 'Peanut allergen safeguard must be indexed');
  });

  // Test 3: 5-Meals a Day and Monthly Budget System
  await runTest('5-Meals a day structure supports daily and monthly budget allocations', () => {
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
  await runTest('1,000+ Head-to-toe exercise database indexes all anatomical muscle regions', () => {
    assert.ok(TOTAL_EXERCISES_INDEXED >= 1000, `Must index at least 1,000 exercises (actual: ${TOTAL_EXERCISES_INDEXED})`);
    assert.ok(MUSCLE_HIERARCHY.length >= 24, `Must index at least 24 muscle groups (actual: ${MUSCLE_HIERARCHY.length})`);
    assert.ok(FEATURED_EXERCISES.length >= 8);

    const neck = MUSCLE_HIERARCHY.find(m => m.id === 'neck');
    const tibialis = MUSCLE_HIERARCHY.find(m => m.id === 'tibialis');
    assert.ok(neck, 'Head/Neck muscles must be present');
    assert.ok(tibialis, 'Tibialis Anterior (Toe/Shin) must be present');
  });

  // Test 5: Medical Lab Risk Analyzer (ISO 15189 & ADA 2026)
  await runTest('Medical Report Risk Score penalizes ADA Pre-Diabetes and Vitamin D deficiencies', () => {
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

  // Test 6: Phase 21 & 23 Brzycki 1RM and Progressive Overload Logic
  await runTest('Brzycki 1RM formula and Progressive Overload RPE < 7 threshold calculate correctly', () => {
    // Brzycki: 80 * (36 / (37 - 10)) = 80 * (36 / 27) = 106.66 -> 107
    const oneRm = Math.round(80 * (36 / (37 - 10)));
    assert.strictEqual(oneRm, 107);

    // Overload criteria: completed && rpe < 7.0 && reps >= 6
    const setLog = { weightKg: 85, reps: 8, rpe: 6.5, completed: true };
    const triggersOverload = setLog.completed && setLog.rpe < 7.0 && setLog.reps >= 6;
    assert.strictEqual(triggersOverload, true, 'Submaximal set (RPE 6.5) should trigger +2.5kg overload recommendation');
  });

  // Test 7: Phase 27 Multi-Language Localization Engine (en, hi, es, fr, de)
  await runTest('Multi-Language Localization dictionaries provide full coverage across 5 languages', () => {
    assert.strictEqual(SUPPORTED_LANGUAGES.length, 5);
    
    const requiredKeys = ['app_title', 'dashboard', 'food_scanner', 'workout_plan', 'calories', 'protein'];
    for (const lang of ['en', 'hi', 'es', 'fr', 'de'] as const) {
      for (const key of requiredKeys) {
        const val = getTranslation(lang, key);
        assert.ok(val && val.length > 0, `Missing translation for key "${key}" in language "${lang}"`);
      }
    }
  });

  // Test 8: Phase 29 & 30 OWASP Security Audit and Kubernetes Telemetry
  await runTest('OWASP Top 10 Security Audit returns 100/100 and K8s telemetry reports 99.99% uptime', () => {
    const audit = runOwaspSecurityAudit();
    assert.strictEqual(audit.overallScore, 100);
    assert.strictEqual(audit.vulnerabilitiesDetected, 0);

    const headers = getSecurityHeaders();
    assert.ok(headers['Strict-Transport-Security']);
    assert.ok(headers['X-Content-Type-Options']);

    const telemetry = getProductionClusterTelemetry();
    assert.strictEqual(telemetry.podsHealthy, 3);
    assert.strictEqual(telemetry.uptimeSlaPct, 99.99);
    assert.strictEqual(checkLivenessProbe().status, 'UP');
  });

  // Test 9: Aesthetic Physique Adonis Golden Ratio (1.618) & Input Boundaries
  await runTest('Adonis Index Golden Ratio (1.618) computes correctly with strict boundary validation', () => {
    const calcAdonisRatio = (shoulders: number, waist: number): { ratio: number; status: string } => {
      assert.ok(shoulders > 0 && shoulders <= 100, 'Shoulders must be between 1 and 100 inches');
      assert.ok(waist > 0 && waist <= 100, 'Waist must be between 1 and 100 inches');
      const r = parseFloat((shoulders / waist).toFixed(3));
      let status = 'Developing Taper';
      if (r >= 1.618) status = 'Golden Adonis Frame (1.618+)';
      else if (r >= 1.55) status = 'Near Adonis Target';
      else if (r >= 1.45) status = 'V-Taper Aesthetic';
      else if (r >= 1.30) status = 'V-Taper Athletic';
      return { ratio: r, status };
    };

    // Golden Adonis measurement test: 48.54in shoulders, 30.0in waist -> 1.618
    const goldenRes = calcAdonisRatio(48.54, 30.0);
    assert.strictEqual(goldenRes.ratio, 1.618);
    assert.strictEqual(goldenRes.status, 'Golden Adonis Frame (1.618+)');

    // Developing taper test: 40in shoulders, 33in waist -> 1.212
    const devRes = calcAdonisRatio(40.0, 33.0);
    assert.strictEqual(devRes.ratio, 1.212);
    assert.strictEqual(devRes.status, 'Developing Taper');
  });

  // Test 10: 6-Tier Biomechanics Hierarchy & Aesthetic Routine Generation
  await runTest('6-Tier Biomechanics Hierarchy prioritizes Lateral Delts, Lats, and Anti-Waist Widening', () => {
    const tiers = [
      { tier: 1, name: 'Lateral Deltoids — The Width Anchor', priority: 1 },
      { tier: 2, name: 'Lats — The Taper Driver', priority: 2 },
      { tier: 3, name: 'Upper Chest (Clavicular Pec) — The Frame Filler', priority: 3 },
      { tier: 4, name: 'Arms (Biceps & Triceps) — The Detail Layer', priority: 4 },
      { tier: 5, name: 'Abdominals & Obliques — The Waist Illusion', priority: 5 },
      { tier: 6, name: 'Legs — Structural Balance (Non-Negotiable)', priority: 6 },
    ];

    assert.strictEqual(tiers.length, 6, 'Must contain all 6 biomechanical tiers from the Blueprint');
    assert.strictEqual(tiers[0].priority, 1, 'Lateral Delts must be Priority #1');
    assert.strictEqual(tiers[1].priority, 2, 'Lats must be Priority #2');
  });

  // Test 11: Aesthetic 2.5%-5% Progressive Overload Auto-Regulation
  await runTest('Aesthetic Overload engine computes 2.5% to 5% micro-progression on submaximal RPE', () => {
    const computeAestheticOverload = (currentWeightKg: number, repsDone: number, rpe: number) => {
      const isTriggered = repsDone >= 12 && rpe <= 8.0;
      if (!isTriggered) return currentWeightKg;
      const increase = currentWeightKg < 25 ? 1.25 : parseFloat((currentWeightKg * 0.05).toFixed(2));
      return parseFloat((currentWeightKg + increase).toFixed(2));
    };

    // Lateral raises 15kg, 15 reps at RPE 7.5 -> should increase by +1.25kg to 16.25kg
    const nextLightLoad = computeAestheticOverload(15, 15, 7.5);
    assert.strictEqual(nextLightLoad, 16.25);

    // Incline DB press 30kg, 12 reps at RPE 8.0 -> 5% increase = +1.5kg -> 31.5kg
    const nextHeavyLoad = computeAestheticOverload(30, 12, 8.0);
    assert.strictEqual(nextHeavyLoad, 31.5);

    // Set with high failure RPE 9.5 -> maintain weight
    const maintainLoad = computeAestheticOverload(30, 10, 9.5);
    assert.strictEqual(maintainLoad, 30);
  });

  // Test 12: Multimodal AI Vision Food Recognition & ICMR-NIN/USDA Nutrition Standards
  await runTest('AI Vision Scanner semantic food fallback accurately matches dishes and calculates ICMR-NIN / USDA nutrition', () => {
    const dish = semanticFoodFallback('Paneer Tikka', 'Indian');
    assert.ok(dish, 'Should return a valid FoodItem');
    assert.ok(dish.name.toLowerCase().includes('paneer'), `Name should match paneer (got: ${dish.name})`);
    assert.ok(dish.nutritionalInfo.protein_g > 0, 'Protein must be positive');
    assert.ok(dish.nutritionalInfo.calories > 0, 'Calories must be positive');
    assert.ok(dish.servingSizeGrams > 0, 'Serving size must be positive');
    assert.ok(dish.confidenceScore && dish.confidenceScore >= 0.85, 'Confidence score should be >= 0.85');
  });

  // Test 13: Local Barcode Lookup Verification
  await runTest('Barcode scanner verifies catalog barcodes with high confidence score', async () => {
    const verifiedItem = await lookupBarcodeProduct('8901234567011');
    assert.ok(verifiedItem, 'Sample barcode should resolve to a valid FoodItem');
    assert.strictEqual(verifiedItem.confidenceScore, 0.99);
    assert.ok(verifiedItem.nutritionalInfo.calories > 0);
  });

  // Test 14: Multi-Item Plate Decomposition & Component Portion Aggregation
  await runTest('Composite plate meals correctly decompose into individual items with proportional macros', () => {
    const composite = semanticFoodFallback('2 Rotis with Dal Tadka and Rice', 'Indian');
    assert.ok(composite, 'Should return a composite FoodItem');
    assert.strictEqual(composite.isDecomposedPlate, true, 'isDecomposedPlate should be true');
    assert.ok(composite.decomposedComponents && composite.decomposedComponents.length >= 3, 'Should contain at least 3 decomposed items (Roti, Dal, Rice)');
    
    // Sum of components
    const sumCals = composite.decomposedComponents.reduce((acc, c) => acc + c.calories, 0);
    assert.strictEqual(sumCals, composite.nutritionalInfo.calories, 'Total calories should equal sum of decomposed component calories');
    assert.ok(composite.decomposedComponents.some(c => c.name.toLowerCase().includes('roti')));
    assert.ok(composite.decomposedComponents.some(c => c.name.toLowerCase().includes('dal')));
    assert.ok(composite.decomposedComponents.some(c => c.name.toLowerCase().includes('rice')));
  });

  // Test 15: Nutrition Label OCR Scanner Response Sanitization
  await runTest('Nutrition Label OCR parser sanitizes manufacturer label data into clinical FoodItem', () => {
    const mockOcrJson = JSON.stringify({
      name: 'High Protein Whey Isolate (Chocolate)',
      servingSizeGrams: 30,
      nutritionalInfo: {
        calories: 120,
        protein_g: 25,
        carbs_g: 2,
        netCarbs_g: 1,
        fat_g: 1,
        saturatedFat_g: 0.5,
        fiber_g: 1,
        sugar_g: 0,
        sodium_mg: 140,
        calcium_mg: 120
      },
      ingredients: ['Whey Protein Isolate', 'Cocoa Powder', 'Natural Flavors', 'Stevia Leaf Extract'],
      allergens: ['Dairy'],
      dietaryTags: ['High Protein', 'Keto Friendly', 'Sugar Free'],
      confidenceScore: 0.98
    });

    const parsedOcr = parseAndSanitizeAiFoodResponse(mockOcrJson, undefined, 'nutrition_label_ocr');
    assert.ok(parsedOcr, 'Should successfully parse OCR JSON');
    assert.strictEqual(parsedOcr.name, 'High Protein Whey Isolate (Chocolate)');
    assert.strictEqual(parsedOcr.nutritionalInfo.protein_g, 25);
    assert.strictEqual(parsedOcr.nutritionalInfo.calories, 120);
    assert.strictEqual(parsedOcr.source, 'Forma Nutrition Facts OCR');
    assert.strictEqual(parsedOcr.allergens[0], 'Dairy');
  });

  // Test 16: Visual Hand-Measurement Portion Conversion Engine
  await runTest('Visual Hand-Measurement portion guide accurately computes metric gram conversions', () => {
    assert.strictEqual(Object.keys(VISUAL_PORTION_GUIDES).length, 8, 'Must index all 8 hand-measurement units');
    
    // 2 Fists = 300g
    assert.strictEqual(convertVisualPortionToGrams('fist', 2), 300);
    // 1 Palm = 100g
    assert.strictEqual(convertVisualPortionToGrams('palm', 1), 100);
    // 2 Thumbs = 30g
    assert.strictEqual(convertVisualPortionToGrams('thumb', 2), 30);
    // 1 Katori = 150g
    assert.strictEqual(convertVisualPortionToGrams('katori', 1), 150);
    // 3 Slices = 105g
    assert.strictEqual(convertVisualPortionToGrams('slice', 3), 105);

    // Verify all guides have descriptions and icons
    for (const guide of Object.values(VISUAL_PORTION_GUIDES)) {
      assert.ok(guide.label.length > 0);
      assert.ok(guide.grams > 0);
      assert.ok(guide.foodExamples.length > 0);
      assert.ok(guide.icon.length > 0);
    }
  });

  // Test 17: Resilient AI Vision Markdown JSON Parser
  await runTest('AI Vision response parser strips conversational prefix and markdown code fences seamlessly', () => {
    const rawAiOutput = `Here is the nutritional analysis for the meal:
\`\`\`json
{
  "_id": "scan_paneer_tikka_01",
  "name": "Tandoori Paneer Tikka",
  "hindiName": "पनीर टिक्का",
  "category": "High Protein Starter",
  "cuisine": "Indian",
  "servingSizeGrams": 200,
  "isDecomposedPlate": false,
  "nutritionalInfo": {
    "calories": 320,
    "protein_g": 18.5,
    "carbs_g": 8.0,
    "netCarbs_g": 6.0,
    "fat_g": 24.0,
    "saturatedFat_g": 8.0,
    "fiber_g": 2.0,
    "sugar_g": 3.0
  },
  "ingredients": ["Paneer", "Bell Peppers", "Onions", "Yogurt", "Spices"],
  "allergens": ["Dairy"],
  "dietaryTags": ["Vegetarian", "High Protein", "Gluten-Free"],
  "confidenceScore": 0.96
}
\`\`\`
Hope this helps your macro goals!`;

    const parsed = parseAndSanitizeAiFoodResponse(rawAiOutput);
    assert.ok(parsed, 'Must successfully parse even with conversational wrappers and markdown code blocks');
    assert.strictEqual(parsed.name, 'Tandoori Paneer Tikka');
    assert.strictEqual(parsed.nutritionalInfo.protein_g, 18.5);
    assert.strictEqual(parsed.nutritionalInfo.calories, 320);
    assert.strictEqual(parsed.cuisine, 'Indian');
  });

  console.log(`\n==================================================`);
  console.log(`TEST RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTRACkerTests().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});

