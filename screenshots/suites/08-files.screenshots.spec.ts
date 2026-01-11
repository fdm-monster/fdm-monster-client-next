import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';

/**
 * Files Screenshots
 * Captures: File browser, file operations
 */
test.describe('Files Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-files-browser', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    // Wait for file browser to load
    await authenticatedPage.waitForSelector(
      '[data-testid="files-browser"], .files-browser, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'files-browser.png', 'files');
  });

  test('02-files-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'files-empty.png', 'files');
  });

  test('03-file-upload-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Click upload button
    const uploadBtn = authenticatedPage.locator('button').filter({ hasText: /upload/i }).first();
    if (await uploadBtn.isVisible().catch(() => false)) {
      await uploadBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'file-upload-dialog.png', 'files');
  });

  test('04-file-context-menu', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Right-click on a file
    const fileItem = authenticatedPage.locator('.file-item, [data-testid="file-item"], tr').filter({ hasText: /\.gcode|\.stl/i }).first();
    if (await fileItem.isVisible().catch(() => false)) {
      await fileItem.click({ button: 'right' });
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'file-context-menu.png', 'files');
  });

  test('05-file-details-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Click on a file to open details
    const fileItem = authenticatedPage.locator('.file-item, [data-testid="file-item"], tr').first();
    if (await fileItem.isVisible().catch(() => false)) {
      await fileItem.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'file-details-dialog.png', 'files');
  });

  test('06-files-grid-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Try to switch to grid view
    const gridViewBtn = authenticatedPage.locator('button[aria-label*="grid" i], .view-toggle').first();
    if (await gridViewBtn.isVisible().catch(() => false)) {
      await gridViewBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'files-grid-view.png', 'files');
  });

  test('07-files-list-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Try to switch to list view (may already be in list view)
    const listViewBtn = authenticatedPage.locator('button[aria-label*="list" i], .view-toggle').first();
    if (await listViewBtn.isVisible().catch(() => false)) {
      await listViewBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'files-list-view.png', 'files');
  });

  test('08-file-print-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToFiles();

    await authenticatedPage.waitForTimeout(1000);

    // Click print action on a file
    const printBtn = authenticatedPage.locator('button').filter({ hasText: /print/i }).first();
    if (await printBtn.isVisible().catch(() => false)) {
      await printBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'file-print-dialog.png', 'files');
  });
});
