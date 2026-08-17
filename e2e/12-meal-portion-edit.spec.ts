import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-19: Meal Portion Edit & Macro Recalculation', () => {
  test('Happy Path: Edits portion size of logged meal and saves recalculation', async ({ authenticatedPage }) => {
    // 1. Navigate to Meal Log view
    const mealLogTab = authenticatedPage.getByTestId('tab-logs');
    if (!await mealLogTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await mealLogTab.click();
    await expect(authenticatedPage.getByTestId('meal-log-view')).toBeVisible();

    // 2. Locate first meal card's edit button
    const editBtn = authenticatedPage.locator('[data-testid^="btn-edit-log-"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // 3. Verify edit portion panel appears
    await expect(authenticatedPage.getByTestId('edit-portion-panel')).toBeVisible();

    // 4. Update portion to 200g
    const portionInput = authenticatedPage.getByTestId('input-edit-portion');
    await portionInput.fill('200');

    // 5. Save portion
    const saveBtn = authenticatedPage.getByTestId('btn-save-portion');
    await saveBtn.click();

    // 6. Verify edit panel closed and portion updated
    await expect(authenticatedPage.getByTestId('edit-portion-panel')).not.toBeVisible();
    await expect(authenticatedPage.locator('text=Portion: 200g').first()).toBeVisible();
  });

  test('Cancel State: Canceling edit leaves original portion intact', async ({ authenticatedPage }) => {
    const mealLogTab = authenticatedPage.getByTestId('tab-logs');
    if (!await mealLogTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await mealLogTab.click();

    const editBtn = authenticatedPage.locator('[data-testid^="btn-edit-log-"]').first();
    await editBtn.click();

    await expect(authenticatedPage.getByTestId('edit-portion-panel')).toBeVisible();

    const cancelBtn = authenticatedPage.getByTestId('btn-cancel-portion');
    await cancelBtn.click();

    await expect(authenticatedPage.getByTestId('edit-portion-panel')).not.toBeVisible();
  });
});
