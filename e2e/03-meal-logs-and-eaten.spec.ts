import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-03: 7-Day Meal Schedule & Eaten Checkoffs', () => {
  test('Happy Path: Toggles meal completion (Eaten checkmark) and switches day tabs', async ({ authenticatedPage }) => {
    // 1. Navigate to Meal Logs tab via top navigation bar
    const mealLogTab = authenticatedPage.getByTestId('tab-logs');
    await mealLogTab.click();
    await expect(authenticatedPage.getByTestId('meal-log-view')).toBeVisible();

    // 2. Click Friday day tab
    const friTab = authenticatedPage.getByTestId('day-tab-friday');
    await friTab.click();

    // 3. Toggle first planned meal as "Eaten"
    const eatenBtn = authenticatedPage.getByTestId('meal-eaten-btn-0');
    await eatenBtn.click();

    // Verify "✓ Eaten" badge appears
    await expect(authenticatedPage.getByTestId('badge-eaten-0')).toBeVisible();

    // Untoggle
    await eatenBtn.click();
    await expect(authenticatedPage.getByTestId('badge-eaten-0')).not.toBeVisible();

    // 4. Switch to Sunday tab
    const sunTab = authenticatedPage.getByTestId('day-tab-sunday');
    await sunTab.click();
    await expect(authenticatedPage.locator('text=Sunday — Planned Meal Schedule')).toBeVisible();
  });

  test('Failure / Empty State: Search filter with no match displays empty feedback', async ({ authenticatedPage }) => {
    const mealLogTab = authenticatedPage.getByTestId('tab-logs');
    await mealLogTab.click();
    await expect(authenticatedPage.getByTestId('meal-log-view')).toBeVisible();

    const searchInput = authenticatedPage.getByTestId('input-search-meals');
    
    // Type non-existent query
    await searchInput.fill('XYZNONEXISTENTFOOD123');
    
    // Verify empty state message
    await expect(authenticatedPage.getByTestId('empty-logs-banner')).toBeVisible();
  });
});
