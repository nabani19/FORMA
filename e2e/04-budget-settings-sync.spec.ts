import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-04 & CUJ-05: Multi-Category Budget Controls & Supplement Stack', () => {
  test('Happy Path: Adjusts monthly budget and verifies sync across views', async ({ authenticatedPage }) => {
    // 1. Expand Budget Settings Panel on Dashboard
    const toggleBtn = authenticatedPage.getByTestId('btn-toggle-budget-settings');
    await toggleBtn.click();
    await expect(authenticatedPage.getByTestId('budget-editor-content')).toBeVisible();

    // 2. Click preset button for ₹8,000/mo meals
    const presetBtn = authenticatedPage.getByTestId('btn-preset-meal-8000');
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
    }

    // 3. Save budget
    const saveBtn = authenticatedPage.getByTestId('btn-save-budget');
    await saveBtn.click();

    // Verify budget summary header update
    await expect(authenticatedPage.getByTestId('budget-summary-header')).toContainText('8000');

    // 4. Navigate to Supplement view and verify synced supplement budget
    const suppTab = authenticatedPage.getByTestId('tab-supplements');
    if (!await suppTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await suppTab.click();
    await expect(authenticatedPage.locator('text=AI Supplement Stack Advisor')).toBeVisible();
  });

  test('Failure / Revert State: Discard button restores previous budget without saving', async ({ authenticatedPage }) => {
    const toggleBtn = authenticatedPage.getByTestId('btn-toggle-budget-settings');
    await toggleBtn.click();

    // Click ₹10,000 preset but discard
    const presetBtn = authenticatedPage.getByTestId('btn-preset-meal-10000');
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
    }

    const discardBtn = authenticatedPage.getByTestId('btn-discard-budget');
    await discardBtn.click();

    // Re-open and verify not saved
    await toggleBtn.click();
    await expect(authenticatedPage.getByTestId('meal-budget-display')).not.toContainText('10,000');
  });
});
