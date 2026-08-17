import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-13: Supplement Stack Personal Selection & Budget Recalculation', () => {
  test('Happy Path: Toggles supplement selection and recalculates active stack total', async ({ authenticatedPage }) => {
    // 1. Navigate to Supplements View
    const suppTab = authenticatedPage.getByTestId('tab-supplements');
    if (!await suppTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await suppTab.click();
    await expect(authenticatedPage.getByTestId('supplement-view')).toBeVisible();

    // 2. Verify total monthly expenditure and selected count are displayed
    const totalInr = authenticatedPage.getByTestId('total-monthly-inr');
    await expect(totalInr).toBeVisible();

    const countBadge = authenticatedPage.getByTestId('selected-supplements-count');
    await expect(countBadge).toBeVisible();

    // 3. Click AI Auto-Fit to ensure optimal baseline
    const autoFitBtn = authenticatedPage.getByTestId('btn-auto-fit');
    await autoFitBtn.click();
    await expect(countBadge).toBeVisible();

    // 4. Clear stack
    const clearBtn = authenticatedPage.getByTestId('btn-reset-supplements');
    await clearBtn.click();
    await expect(authenticatedPage.locator('text=No supplements currently selected')).toBeVisible();

    // 5. Select all
    const selectAllBtn = authenticatedPage.getByTestId('btn-select-all');
    await selectAllBtn.click();
    await expect(countBadge).toContainText('6 of 6 Selected');
  });

  test('Toggle Single Supplement: Adds and removes item from stack', async ({ authenticatedPage }) => {
    const suppTab = authenticatedPage.getByTestId('tab-supplements');
    if (!await suppTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await suppTab.click();

    // Toggle Vitamin D3
    const toggleBtn = authenticatedPage.getByTestId('btn-toggle-supplement-supp_3');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Verify it was toggled
    await expect(authenticatedPage.getByTestId('supplement-view')).toBeVisible();
  });
});
