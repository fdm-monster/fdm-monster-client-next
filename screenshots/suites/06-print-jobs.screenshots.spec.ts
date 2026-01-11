import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';

/**
 * Print Jobs Screenshots
 * Captures: Jobs list, job dialog with details
 */
test.describe('Print Jobs Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-print-jobs-list', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    // Wait for jobs list to load
    await authenticatedPage.waitForSelector(
      '[data-testid="jobs-list"], .jobs-list, table, .v-data-table',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'print-jobs-list.png', 'jobs');
  });

  test('02-print-jobs-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'print-jobs-empty.png', 'jobs');
  });

  test('03-job-details-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Click on first job row to open details
    const jobRow = authenticatedPage.locator('tr, .v-list-item, .job-item').first();
    if (await jobRow.isVisible().catch(() => false)) {
      await jobRow.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'job-details-dialog.png', 'jobs');
  });

  test('04-job-details-with-statistics', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Click on a completed job to see full statistics
    const completedJob = authenticatedPage.locator('tr, .job-item').filter({ hasText: /completed/i }).first();
    if (await completedJob.isVisible().catch(() => false)) {
      await completedJob.click();
      await authenticatedPage.waitForTimeout(1000);
    } else {
      // Fallback to first job
      const jobRow = authenticatedPage.locator('tr, .job-item').first();
      await jobRow.click().catch(() => {});
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'job-details-with-statistics.png', 'jobs');
  });

  test('05-jobs-filter-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Look for filter button or panel
    const filterBtn = authenticatedPage.locator('button').filter({ hasText: /filter/i }).first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'jobs-filter-panel.png', 'jobs');
  });

  test('06-jobs-by-status-completed', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Try to filter by completed status
    const statusFilter = authenticatedPage.locator('select, .v-select').filter({ hasText: /status/i }).first();
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();
      await authenticatedPage.waitForTimeout(300);

      const completedOption = authenticatedPage.locator('.v-list-item').filter({ hasText: /completed/i }).first();
      await completedOption.click().catch(() => {});
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'jobs-by-status-completed.png', 'jobs');
  });

  test('07-jobs-by-status-failed', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Try to filter by failed status
    const statusFilter = authenticatedPage.locator('select, .v-select').filter({ hasText: /status/i }).first();
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();
      await authenticatedPage.waitForTimeout(300);

      const failedOption = authenticatedPage.locator('.v-list-item').filter({ hasText: /failed/i }).first();
      await failedOption.click().catch(() => {});
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'jobs-by-status-failed.png', 'jobs');
  });
});
