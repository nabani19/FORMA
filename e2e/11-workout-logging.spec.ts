import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-14: Workout Periodization, Exercise Search & 1RM Logger', () => {
  test('Happy Path: Switches workout sub-tabs, searches anatomy library, and opens exercise details', async ({ authenticatedPage }) => {
    // 1. Navigate to Workout View
    const workoutTab = authenticatedPage.getByTestId('tab-workout');
    if (!await workoutTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await workoutTab.click();
    await expect(authenticatedPage.getByTestId('workout-plan-view')).toBeVisible();

    // 2. Switch to 1,000+ Exercise Anatomy tab
    await authenticatedPage.getByTestId('tab-workout-anatomy').click();
    await expect(authenticatedPage.getByTestId('input-search-exercise')).toBeVisible();

    // 3. Search for exercise
    const searchInput = authenticatedPage.getByTestId('input-search-exercise');
    await searchInput.fill('Bench');
    await expect(authenticatedPage.locator('text=Incline Dumbbell Bench Press').first()).toBeVisible();

    // 4. Click an exercise card to open modal
    const exerciseCard = authenticatedPage.locator('[data-testid^="anatomy-exercise-card-"]').first();
    await exerciseCard.click();
    await expect(authenticatedPage.getByTestId('exercise-detail-modal')).toBeVisible();

    // 5. Close modal
    const closeBtn = authenticatedPage.getByTestId('btn-close-exercise-modal');
    await closeBtn.click();
    await expect(authenticatedPage.getByTestId('exercise-detail-modal')).not.toBeVisible();
  });

  test('RPE & 1RM Logger: Updates set parameters and computes 1RM estimate', async ({ authenticatedPage }) => {
    const workoutTab = authenticatedPage.getByTestId('tab-workout');
    if (!await workoutTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await workoutTab.click();

    // Switch to Logger
    await authenticatedPage.getByTestId('tab-workout-logger').click();
    await expect(authenticatedPage.getByTestId('set-row-set_1')).toBeVisible();

    // Fill set 1 weight (100 kg) and reps (10 reps) -> Brzycki 1RM = 100 * (36 / 27) = 133 kg
    const weightInput = authenticatedPage.getByTestId('input-set-weight-set_1');
    const repsInput = authenticatedPage.getByTestId('input-set-reps-set_1');

    await weightInput.fill('100');
    await repsInput.fill('10');

    // Verify 1RM updated
    const oneRmDisplay = authenticatedPage.getByTestId('est-1rm-set_1');
    await expect(oneRmDisplay).toHaveText('133 kg');

    // Add new set
    const addSetBtn = authenticatedPage.getByTestId('btn-add-set');
    await addSetBtn.click();
    await expect(authenticatedPage.locator('text=Added Set #4')).toBeVisible();
  });
});
