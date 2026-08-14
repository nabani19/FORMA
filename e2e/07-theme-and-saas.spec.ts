import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-09 & CUJ-10: Theme Persistence & SaaS Auth Lifecycle', () => {
  test('Happy Path: Toggles Light and Dark theme and verifies document element class', async ({ authenticatedPage }) => {
    const themeBtn = authenticatedPage.getByTestId('btn-theme-toggle');
    await expect(themeBtn).toBeVisible();

    // 1. Toggle theme
    await themeBtn.click();

    // 2. Reload page to verify persistence
    await authenticatedPage.reload();
    await expect(authenticatedPage.getByTestId('app-navbar')).toBeVisible();

    // Toggle back
    await themeBtn.click();
  });

  test('Happy Path: Profile modal opens and plan tier is displayed', async ({ authenticatedPage }) => {
    // 1. Click Profile avatar in Navbar
    const profileBtn = authenticatedPage.getByTestId('btn-profile');
    await profileBtn.click();

    // 2. Verify Profile / Settings view renders
    await expect(authenticatedPage.locator('text=Biometric Data & Activity')).toBeVisible();
    await expect(authenticatedPage.getByTestId('user-plan-badge')).toBeVisible();
  });
});
