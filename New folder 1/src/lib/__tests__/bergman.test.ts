import { runBergmanODE, DEFAULT_BERGMAN_PARAMS, classifyGlycemicIndex, getPeakZoneColor } from '../bergman';

/**
 * Automated Unit Test Suite for Bergman Minimal Model RK4 Solver
 */
export function runBergmanTests() {
  console.log('🧪 Running Bergman Minimal Model ODE Test Suite...');

  // Test 1: Low carb meal produces low glucose rise
  const lowMeal = runBergmanODE({ carbsG: 15, fatG: 5, proteinG: 10, fiberG: 5 });
  if (lowMeal.spikeRisk !== 'Low') throw new Error(`Bergman Test 1 Failed: Expected Low spike risk, got ${lowMeal.spikeRisk}`);
  if (lowMeal.peakGlucoseMgDl < DEFAULT_BERGMAN_PARAMS.Gb) throw new Error('Bergman Test 1 Failed: Peak glucose fell below baseline');

  // Test 2: High carb meal produces higher glucose peak & AUC
  const highMeal = runBergmanODE({ carbsG: 90, fatG: 10, proteinG: 15, fiberG: 1 });
  if (highMeal.peakGlucoseMgDl <= lowMeal.peakGlucoseMgDl) {
    throw new Error(`Bergman Test 2 Failed: High carb peak (${highMeal.peakGlucoseMgDl}) should be > low carb peak (${lowMeal.peakGlucoseMgDl})`);
  }
  if (highMeal.auc <= lowMeal.auc) throw new Error('Bergman Test 2 Failed: High carb AUC should be greater than low carb AUC');

  // Test 3: Gastric delay (fat effect) shifts peak time right
  const noFatMeal = runBergmanODE({ carbsG: 50, fatG: 0, proteinG: 5, fiberG: 0 });
  const highFatMeal = runBergmanODE({ carbsG: 50, fatG: 45, proteinG: 5, fiberG: 0 });
  if (highFatMeal.peakTimeMins < noFatMeal.peakTimeMins) {
    throw new Error(`Bergman Test 3 Failed: Fat delay failed. High fat peak time (${highFatMeal.peakTimeMins}m) < No fat peak time (${noFatMeal.peakTimeMins}m)`);
  }

  // Test 4: Glycemic index classification utility
  if (classifyGlycemicIndex(35) !== 'Low GI') throw new Error('Bergman Test 4 Failed: 35 should be Low GI');
  if (classifyGlycemicIndex(60) !== 'Medium GI') throw new Error('Bergman Test 4 Failed: 60 should be Medium GI');
  if (classifyGlycemicIndex(85) !== 'High GI') throw new Error('Bergman Test 4 Failed: 85 should be High GI');

  // Test 5: Peak zone color classification
  if (getPeakZoneColor(120).label !== 'Normal') throw new Error('Bergman Test 5 Failed: 120 mg/dL should be Normal');
  if (getPeakZoneColor(160).label !== 'Elevated') throw new Error('Bergman Test 5 Failed: 160 mg/dL should be Elevated');
  if (getPeakZoneColor(190).label !== 'Danger Zone') throw new Error('Bergman Test 5 Failed: 190 mg/dL should be Danger Zone');

  console.log('✅ ALL BERGMAN ODE SOLVER TESTS PASSED SUCCESSFULLY!');
  return true;
}
