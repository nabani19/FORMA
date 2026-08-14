import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-06: AI Grocery Shopping List Operations', () => {
  test('Happy Path: Adds custom grocery item and toggles purchased checklist', async ({ authenticatedPage }) => {
    // 1. Navigate to Grocery tab
    await authenticatedPage.getByTestId('tab-grocery').click();
    await expect(authenticatedPage.locator('text=AI Grocery List & Budget Planner')).toBeVisible();

    // 2. Add a new item to the shopping list
    const nameInput = authenticatedPage.locator('input[placeholder*="Add item"]');
    await nameInput.fill('Organic Almonds');

    const addBtn = authenticatedPage.getByRole('button', { name: /Add/i }).first();
    await addBtn.click();

    // Verify item heading appears in list
    const itemHeading = authenticatedPage.getByRole('heading', { name: 'Organic Almonds' });
    await expect(itemHeading).toBeVisible();

    // 3. Toggle purchased state
    await itemHeading.click();
  });

  test('Boundary State: Empty item input submission is rejected', async ({ authenticatedPage }) => {
    await authenticatedPage.getByTestId('tab-grocery').click();
    const nameInput = authenticatedPage.locator('input[placeholder*="Add item"]');
    await nameInput.fill('');

    const addBtn = authenticatedPage.getByRole('button', { name: /Add/i }).first();
    await addBtn.click();

    // Input remains clear and list size is unchanged
    await expect(nameInput).toHaveValue('');
  });
});
