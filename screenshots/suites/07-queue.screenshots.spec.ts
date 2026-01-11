import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Queue Screenshots
 * Captures: Queue view with pending jobs
 */
test.describe('Queue Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-queue-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToQueue();

    // Wait for queue to load
    await authenticatedPage.waitForSelector(
      '[data-testid="queue"], .queue, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'queue-view.png', 'queue');
  });

  test('02-queue-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToQueue();

    await authenticatedPage.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'queue-empty.png', 'queue');
  });

  test('03-queue-with-jobs', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToQueue();

    await authenticatedPage.waitForTimeout(1500);

    await captureFullPage(authenticatedPage, 'queue-with-jobs.png', 'queue');
  });

  test('04-queue-job-context-menu', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToQueue();

    await authenticatedPage.waitForTimeout(1000);

    // Right-click on a queue item
    const queueItem = authenticatedPage.locator('.queue-item, [data-testid="queue-item"], tr').first();
    if (await queueItem.isVisible().catch(() => false)) {
      await queueItem.click({ button: 'right' });
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'queue-job-context-menu.png', 'queue');
  });

  test('05-queue-reorder-drag', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToQueue();

    await authenticatedPage.waitForTimeout(1000);

    // Hover over a queue item to show drag handle
    const queueItem = authenticatedPage.locator('.queue-item, [data-testid="queue-item"]').first();
    if (await queueItem.isVisible().catch(() => false)) {
      await queueItem.hover();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'queue-reorder-drag.png', 'queue');
  });
});
