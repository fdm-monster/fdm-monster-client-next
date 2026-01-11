import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';
import { createFormHelper } from '../helpers/form.helper';

/**
 * Printer List Screenshots
 * Captures: List view, creating printer, attaching floor/camera/tag
 */
test.describe('Printer List Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-printer-list-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    // Wait for list to load
    await authenticatedPage.waitForSelector(
      '[data-testid="printer-list"], .printer-list, table, .v-data-table',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'printer-list-view.png', 'printer-list');
  });

  test('02-printer-list-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'printer-list-empty.png', 'printer-list');
  });

  test('03-create-printer-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click add/create printer button
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create|new/i }).first();
    await addBtn.click().catch(() => {});

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-printer-dialog.png', 'printer-list');
  });

  test('04-create-printer-dialog-filled', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click add printer button
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create|new/i }).first();
    await addBtn.click().catch(() => {});

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    // Fill form fields
    const inputs = authenticatedPage.locator('.v-dialog input[type="text"]');
    if (await inputs.count() > 0) {
      await inputs.nth(0).fill('Prusa i3 MK4');
      if (await inputs.count() > 1) {
        await inputs.nth(1).fill('http://192.168.1.100');
      }
      if (await inputs.count() > 2) {
        await inputs.nth(2).fill('1234567890ABCDEF');
      }
    }

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-printer-dialog-filled.png', 'printer-list');
  });

  test('05-printer-details-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click on first printer row
    const printerRow = authenticatedPage.locator('tr, .v-list-item, .printer-item').filter({ hasText: /prusa|ender|artillery/i }).first();
    if (await printerRow.isVisible().catch(() => false)) {
      await printerRow.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'printer-details-panel.png', 'printer-list');
  });

  test('06-attach-floor-to-printer', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click on first printer to open details
    const printerRow = authenticatedPage.locator('tr, .v-list-item').first();
    if (await printerRow.isVisible().catch(() => false)) {
      await printerRow.click();
      await authenticatedPage.waitForTimeout(500);
    }

    // Look for floor dropdown or attach button
    const floorSelect = authenticatedPage.locator('select, .v-select, [data-testid="floor-select"]').filter({ hasText: /floor/i }).first();
    if (await floorSelect.isVisible().catch(() => false)) {
      await floorSelect.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'attach-floor-to-printer.png', 'printer-list');
  });

  test('07-attach-camera-to-printer', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click on first printer
    const printerRow = authenticatedPage.locator('tr, .v-list-item').first();
    if (await printerRow.isVisible().catch(() => false)) {
      await printerRow.click();
      await authenticatedPage.waitForTimeout(500);
    }

    // Look for camera dropdown or attach button
    const cameraBtn = authenticatedPage.locator('button, .v-select').filter({ hasText: /camera/i }).first();
    if (await cameraBtn.isVisible().catch(() => false)) {
      await cameraBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'attach-camera-to-printer.png', 'printer-list');
  });

  test('08-attach-tag-to-printer', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click on first printer
    const printerRow = authenticatedPage.locator('tr, .v-list-item').first();
    if (await printerRow.isVisible().catch(() => false)) {
      await printerRow.click();
      await authenticatedPage.waitForTimeout(500);
    }

    // Look for tag dropdown or attach button
    const tagSelect = authenticatedPage.locator('button, .v-select, [data-testid="tag-select"]').filter({ hasText: /tag/i }).first();
    if (await tagSelect.isVisible().catch(() => false)) {
      await tagSelect.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'attach-tag-to-printer.png', 'printer-list');
  });
});
