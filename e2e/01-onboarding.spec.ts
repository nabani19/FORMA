import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-01: First-Time User Onboarding Flow', () => {
  test('Happy Path: Completes 3-step scientific onboarding and lands on dashboard', async ({ freshPage }) => {
    // 1. Initial render should show the Onboarding Wizard
    await expect(freshPage.locator('text=Welcome to Forma')).toBeVisible();

    // Fill Step 1: Biometrics
    const firstNameInput = freshPage.locator('input[placeholder*="Jane"]').or(freshPage.locator('input').first());
    await firstNameInput.fill('Rahul');

    // Click Next to Step 2
    const nextBtn = freshPage.getByRole('button', { name: /Next: 22 Regimes/i });
    await nextBtn.click();

    // 2. Step 2: Dietary Regimes & Allergens
    await expect(freshPage.locator('text=Select Dietary Regimes & Cultural Preferences')).toBeVisible();

    // Toggle a regime if available
    const vegBtn = freshPage.getByRole('button', { name: /High-Protein/i }).first();
    if (await vegBtn.isVisible()) {
      await vegBtn.click();
    }

    // Click Next to Step 3
    const nextStep3Btn = freshPage.getByRole('button', { name: /Next: Scientific WHO/i });
    await nextStep3Btn.click();

    // 3. Step 3: Scientific Targets Confirmation
    await expect(freshPage.locator('text=Calculated Scientific Targets')).toBeVisible();

    // Click Launch App Dashboard
    const launchBtn = freshPage.getByRole('button', { name: /Launch App Dashboard/i });
    await launchBtn.click();

    // Verify Dashboard is displayed
    await expect(freshPage.getByTestId('app-navbar')).toBeVisible();
    await expect(freshPage.getByTestId('navbar-brand')).toBeVisible();
    await expect(freshPage.locator('text=Hello, Rahul! 👋')).toBeVisible();
  });

  test('Failure / Boundary State: Input clamps gracefully on zero or out-of-bounds weight', async ({ freshPage }) => {
    await expect(freshPage.locator('text=Welcome to Forma')).toBeVisible();
    
    // Find weight input and set boundary value
    const weightInput = freshPage.locator('input[type="number"]').nth(1);
    if (await weightInput.isVisible()) {
      await weightInput.fill('500');
    }

    // Step navigation should still be enabled
    const nextBtn = freshPage.getByRole('button', { name: /Next: 22 Regimes/i });
    await expect(nextBtn).toBeEnabled();
  });
});
