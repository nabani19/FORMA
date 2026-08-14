import { test as base, Page } from '@playwright/test';
import { MOCK_TEST_USER, MOCK_TEST_PREFERENCES, MOCK_TEST_MEAL_LOGS } from './seedData';

type CustomFixtures = {
  authenticatedPage: Page;
  freshPage: Page;
};

export const test = base.extend<CustomFixtures>({
  /**
   * Pre-authenticated page fixture where onboarding has been completed and localStorage contains test data.
   */
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript(
      ({ user, prefs, logs }) => {
        localStorage.setItem('ai_nutrition_user', JSON.stringify(user));
        localStorage.setItem('ai_nutrition_preferences', JSON.stringify(prefs));
        localStorage.setItem('ai_nutrition_meal_logs', JSON.stringify(logs));
        localStorage.setItem('ai_nutrition_onboarded', 'true');
        localStorage.setItem('ai_nutrition_theme', 'dark');
        localStorage.setItem('ai_tracker_cookies_accepted', 'true');
        localStorage.setItem('ai_tracker_plan', 'pro');
      },
      { user: MOCK_TEST_USER, prefs: MOCK_TEST_PREFERENCES, logs: MOCK_TEST_MEAL_LOGS }
    );

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },

  /**
   * Fresh unauthenticated page with clear localStorage to trigger the onboarding wizard.
   */
  freshPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('ai_tracker_cookies_accepted', 'true');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});

export { expect } from '@playwright/test';
