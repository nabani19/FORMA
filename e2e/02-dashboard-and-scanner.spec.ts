import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-02: Dashboard Macro Tracking & Food Scanner', () => {
  test('Happy Path: Displays core macros and opens scanner modal', async ({ authenticatedPage }) => {
    // 1. Verify dashboard macro headers
    await expect(authenticatedPage.getByTestId('app-navbar')).toBeVisible();
    await expect(authenticatedPage.getByTestId('calorie-progress-bar')).toBeVisible();
    await expect(authenticatedPage.locator('text=Hello, Priya! 👋')).toBeVisible();

    // 2. Open Scanner modal from Navbar button
    const scanBtn = authenticatedPage.getByTestId('btn-scan-food-nav');
    await scanBtn.click();

    // Verify modal appears
    await expect(authenticatedPage.getByTestId('scanner-modal')).toBeVisible();

    // Close modal
    const closeBtn = authenticatedPage.getByTestId('btn-close-scanner');
    await closeBtn.click();
    await expect(authenticatedPage.getByTestId('scanner-modal')).not.toBeVisible();
  });

  test('Boundary State: Opening and closing scanner preserves dashboard state', async ({ authenticatedPage }) => {
    const scanBtn = authenticatedPage.getByTestId('btn-scan-food-nav');
    await scanBtn.click();
    await expect(authenticatedPage.getByTestId('scanner-modal')).toBeVisible();

    const closeBtn = authenticatedPage.getByTestId('btn-close-scanner');
    await closeBtn.click();
    await expect(authenticatedPage.getByTestId('navbar-brand')).toBeVisible();
  });
});
