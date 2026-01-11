import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage, captureViewport } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Dashboard Screenshots
 * Captures: Dashboard overview, stats widgets, recent activity
 */
test.describe('Dashboard Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    // Mock all endpoints for authenticated dashboard
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-dashboard-overview', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);

    // Navigate to dashboard
    await nav.goToDashboard();

    // Wait for dashboard content to load
    await authenticatedPage.waitForSelector(
      '[data-testid="dashboard"], .dashboard, main',
      { timeout: 5000 }
    ).catch(() => {});

    // Additional wait for stats to populate
    await authenticatedPage.waitForTimeout(1000);

    // Capture full dashboard page
    await captureFullPage(authenticatedPage, 'dashboard-overview.png', 'dashboard');
  });

  test('02-dashboard-viewport', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);

    // Navigate to dashboard
    await nav.goToDashboard();

    // Wait for dashboard content
    await authenticatedPage.waitForSelector(
      '[data-testid="dashboard"], .dashboard, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    // Capture viewport (above the fold)
    await captureViewport(authenticatedPage, 'dashboard-viewport.png', 'dashboard');
  });

  test('03-dashboard-stats-widgets', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);

    // Navigate to dashboard
    await nav.goToDashboard();

    // Wait for stats widgets
    await authenticatedPage.waitForSelector(
      '[data-testid="stats-widget"], .stats-card, .statistics',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    // Try to capture stats section if it exists
    const statsSection = authenticatedPage.locator(
      '[data-testid="stats-section"], .stats-container, .dashboard-stats'
    ).first();

    if (await statsSection.isVisible().catch(() => false)) {
      await statsSection.screenshot({
        path: 'screenshots/output/dashboard/stats-widgets.png',
      });
    } else {
      // Fallback to full page if specific stats section not found
      await captureFullPage(authenticatedPage, 'stats-widgets.png', 'dashboard');
    }
  });

  test('04-dashboard-empty-state', async ({ page, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    // Setup authenticated page
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token');
      localStorage.setItem('refresh-token', 'mock-refresh-token');
    });

    const nav = createNavigationHelper(page);
    await nav.goToDashboard();

    // Wait for empty state
    await page.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await page.waitForTimeout(1000);

    // Capture empty dashboard
    await captureFullPage(page, 'dashboard-empty-state.png', 'dashboard');
  });
});
