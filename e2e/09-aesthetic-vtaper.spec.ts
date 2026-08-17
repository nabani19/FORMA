import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-12: Aesthetic V-Taper Blueprint & Adonis Golden Ratio', () => {
  test('Happy Path: Enters measurements, calculates ratio, and saves to history log', async ({ authenticatedPage }) => {
    // 1. Navigate to Aesthetic V-Taper view
    const aestheticTab = authenticatedPage.getByTestId('tab-aesthetic');
    if (!await aestheticTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await aestheticTab.click();
    await expect(authenticatedPage.getByTestId('aesthetic-physique-view')).toBeVisible();

    // 2. Input measurements (Shoulders: 48, Waist: 30) -> 48 / 30 = 1.600
    const shouldersInput = authenticatedPage.getByTestId('input-shoulders');
    const waistInput = authenticatedPage.getByTestId('input-waist');

    await shouldersInput.fill('48.0');
    await waistInput.fill('30.0');

    // 3. Verify calculated ratio
    const ratioDisplay = authenticatedPage.getByTestId('ratio-result');
    await expect(ratioDisplay).toHaveText('1.600');

    const ratioBadge = authenticatedPage.getByTestId('ratio-badge');
    await expect(ratioBadge).toBeVisible();

    // 4. Save measurement to history
    await authenticatedPage.getByTestId('btn-save-measurement').click();

    // 5. Verify entry in history table
    await expect(authenticatedPage.getByTestId('history-table')).toBeVisible();
    await expect(authenticatedPage.getByTestId('history-table').locator('text=48 in').first()).toBeVisible();
    await expect(authenticatedPage.getByTestId('history-table').locator('text=30 in').first()).toBeVisible();

    // 6. Delete history entry
    const deleteBtn = authenticatedPage.locator('[data-testid^="btn-delete-measurement-"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
  });

  test('Unit Toggle: Switches between Inches (in) and Centimeters (cm)', async ({ authenticatedPage }) => {
    const aestheticTab = authenticatedPage.getByTestId('tab-aesthetic');
    if (!await aestheticTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await aestheticTab.click();

    const unitCmBtn = authenticatedPage.getByTestId('btn-unit-cm');
    await unitCmBtn.click();
    await expect(authenticatedPage.locator('text=Shoulders (cm)')).toBeVisible();

    const unitInBtn = authenticatedPage.getByTestId('btn-unit-in');
    await unitInBtn.click();
    await expect(authenticatedPage.locator('text=Shoulders (in)')).toBeVisible();
  });

  test('Aesthetic Overload Engine: Computes auto-regulated micro-progression', async ({ authenticatedPage }) => {
    const aestheticTab = authenticatedPage.getByTestId('tab-aesthetic');
    if (!await aestheticTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await aestheticTab.click();

    const weightInput = authenticatedPage.getByTestId('overload-current-weight');
    const repsInput = authenticatedPage.getByTestId('input-overload-reps');

    await weightInput.fill('20');
    await repsInput.fill('15');

    const nextWeightDisplay = authenticatedPage.getByTestId('overload-next-weight');
    await expect(nextWeightDisplay).toBeVisible();
    await expect(nextWeightDisplay).toContainText('Target Met');
  });
});
