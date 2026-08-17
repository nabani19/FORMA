import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-20: 1-Click Clinical PDF & Formatted Report Generator', () => {
  test('Happy Path: Opens PDF export modal, switches report categories, and verifies previews', async ({ authenticatedPage }) => {
    // 1. Navigate to Aesthetic View where export button is present
    await authenticatedPage.getByTestId('tab-aesthetic').click();
    await expect(authenticatedPage.getByTestId('aesthetic-physique-view')).toBeVisible();

    // 2. Click Export Report button
    await authenticatedPage.locator('button:has-text("Export Report")').click();

    // 3. Verify modal is visible
    await expect(authenticatedPage.getByTestId('pdf-export-modal')).toBeVisible();
    await expect(authenticatedPage.locator('text=FITFORGE AI CLINICAL REPORT')).toBeVisible();

    // 4. Switch to Workout report
    await authenticatedPage.getByTestId('tab-report-workout').click();
    await expect(authenticatedPage.locator('text=Assigned Exercises & Volume Targets')).toBeVisible();

    // 5. Switch to Grocery report
    await authenticatedPage.getByTestId('tab-report-grocery').click();
    await expect(authenticatedPage.locator('text=High-Protein Staples (2026 Market Index)')).toBeVisible();

    // 6. Switch to Medical report
    await authenticatedPage.getByTestId('tab-report-medical').click();
    await expect(authenticatedPage.locator('text=Biomarker Laboratory Findings')).toBeVisible();

    // 7. Verify action buttons
    await expect(authenticatedPage.getByTestId('btn-download-report')).toBeVisible();
    await expect(authenticatedPage.getByTestId('btn-print-report')).toBeVisible();

    // 8. Close modal
    await authenticatedPage.getByTestId('btn-close-pdf-modal').click();
    await expect(authenticatedPage.getByTestId('pdf-export-modal')).not.toBeVisible();
  });
});
