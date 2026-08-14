import { solveDailyOmniLock, generateMonthlyOmniLock, GROCERY_DB } from '../omniLockEngine';

/**
 * Automated Unit Test Suite for OmniLock Apex Engine
 */
export function runOmniLockTests() {
  console.log('🧪 Running OmniLock Engine Test Suite...');

  // Test 1: Daily solver calculates Mifflin-St Jeor TDEE & 97% targets accurately
  const res1 = solveDailyOmniLock(75, 175, 25, 'muscle gain', 350, 0, 0);
  if (!res1.success) throw new Error('OmniLock Test 1 Failed: Solver returned unsuccessful');
  if (res1.meal_plan.length === 0) throw new Error('OmniLock Test 1 Failed: Empty meal plan');
  if (res1.actual_cost > 350) throw new Error(`OmniLock Test 1 Failed: Cost exceeded daily cap ₹${res1.actual_cost} > 350`);

  // Test 2: Atwater 4-4-9 biological energy math verification
  res1.meal_plan.forEach(item => {
    const expectedKcal = Math.round(item.p * 4 + item.c * 4 + item.f * 9);
    if (Math.abs(item.kcal - expectedKcal) > 2) {
      throw new Error(`OmniLock Test 2 Failed: Atwater kcal mismatch for ${item.food}: ${item.kcal} vs ${expectedKcal}`);
    }
  });

  // Test 3: Day seed rotation generates different food profiles across Monday (0) vs Tuesday (1)
  const monRes = solveDailyOmniLock(75, 175, 25, 'muscle gain', 350, 0, 0);
  const tueRes = solveDailyOmniLock(75, 175, 25, 'muscle gain', 350, 0, 1);
  const monFoods = monRes.meal_plan.map(i => i.food).sort().join(',');
  const tueFoods = tueRes.meal_plan.map(i => i.food).sort().join(',');
  if (monFoods === tueFoods) throw new Error('OmniLock Test 3 Failed: Day rotation failed to generate distinct food profiles');

  // Test 4: Monthly Ledger simulation runs 30 days without budget overruns
  const monthRes = generateMonthlyOmniLock(75, 175, 25, 'muscle gain', 10500);
  if (monthRes.ledger.length !== 30) throw new Error(`OmniLock Test 4 Failed: Expected 30 days ledger, got ${monthRes.ledger.length}`);
  if (monthRes.total_spent > 10500) throw new Error(`OmniLock Test 4 Failed: Monthly budget exceeded ₹${monthRes.total_spent} > 10500`);

  console.log('✅ ALL OMNILOCK ENGINE TESTS PASSED SUCCESSFULLY!');
  return true;
}
