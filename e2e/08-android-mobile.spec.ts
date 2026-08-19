import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-11: Android Mobile UX & Touch Navigation', () => {
  test.use({
    viewport: { width: 412, height: 915 }, // Standard Android viewport (e.g. Google Pixel 7)
    isMobile: true,
    hasTouch: true,
  });

  test('Happy Path: Android mobile layout opens More drawer and navigates tools with touch', async ({ authenticatedPage }) => {
    // 1. Verify Bottom Navigation is visible on Android mobile
    const bottomNav = authenticatedPage.getByTestId('bottom-navigation');
    await expect(bottomNav).toBeVisible();

    // 2. Open Mobile "More" Drawer
    const moreBtn = authenticatedPage.getByTestId('bottom-nav-more');
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    const moreDrawer = authenticatedPage.getByTestId('mobile-more-drawer');
    await expect(moreDrawer).toBeVisible();

    // 3. Tap Workout Generator in drawer
    const workoutDrawerItem = authenticatedPage.getByTestId('drawer-item-workout');
    await expect(workoutDrawerItem).toBeVisible();
    await workoutDrawerItem.click();

    // 4. Verify Workout Plan view loaded and drawer closed
    await expect(moreDrawer).not.toBeVisible();
    await expect(authenticatedPage.getByTestId('workout-plan-view')).toBeVisible();

    // 5. Tap center Scan button from bottom bar
    const centerScan = authenticatedPage.getByTestId('bottom-nav-center-scan');
    await expect(centerScan).toBeVisible();
    await centerScan.click();

    const scannerModal = authenticatedPage.getByTestId('scanner-modal');
    await expect(scannerModal).toBeVisible();
    await expect(authenticatedPage.getByText('AI Food & Vision Intelligence')).toBeVisible();

    // 6. Close scanner modal
    await authenticatedPage.getByTestId('btn-close-scanner').click();
    await expect(scannerModal).not.toBeVisible();
  });
});
