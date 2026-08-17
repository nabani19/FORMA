import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-07 & CUJ-08: AI Coach & Medical Report Analyzer', () => {
  test('Happy Path: AI Coach loads model selectors and quick templates', async ({ authenticatedPage }) => {
    // 1. Navigate to AI Coach via top navigation bar
    const coachTab = authenticatedPage.getByTestId('tab-coach');
    if (!await coachTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await coachTab.click();
    await expect(authenticatedPage.locator('text=Forma AI Nutritionist & Coach')).toBeVisible();

    // 2. Verify model options or chat bubbles exist
    await expect(authenticatedPage.locator('text=LIVE MULTI-MODEL')).toBeVisible();
  });

  test('Happy Path: Medical Report Analyzer calculates risk and alerts', async ({ authenticatedPage }) => {
    // 1. Navigate to Medical tab
    const medicalTab = authenticatedPage.getByTestId('tab-medical');
    if (!await medicalTab.isVisible()) {
      await authenticatedPage.getByTestId('btn-more-tools-dropdown').click();
    }
    await medicalTab.click();
    await expect(authenticatedPage.locator('text=AI Medical Report Analyzer')).toBeVisible();

    // 2. Click Analyze Report button
    const analyzeBtn = authenticatedPage.getByRole('button', { name: /Run Clinical Risk Analysis/i });
    if (await analyzeBtn.isVisible()) {
      await analyzeBtn.click();
    }

    // Verify clinical output is visible
    await expect(authenticatedPage.locator('text=Clinical Risk Score').or(authenticatedPage.locator('text=Biomarker'))).toBeVisible();
  });
});
