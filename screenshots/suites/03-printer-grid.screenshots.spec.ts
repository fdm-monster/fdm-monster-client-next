import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage, captureElement } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';

/**
 * Printer Grid Screenshots
 * Captures: Empty grid, grid with printers, creating floor/printer, drag operations, batch bar, upload progress
 */
test.describe('Printer Grid Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-printer-grid-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    // Wait for grid to load
    await authenticatedPage.waitForSelector(
      '[data-testid="printer-grid"], .printer-grid, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'printer-grid-empty.png', 'printer-grid');
  });

  test('02-printer-grid-with-printers', async ({ authenticatedPage, apiMock }) => {
    // Explicitly mock with data (not empty)
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: false });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    // Wait for toolbar with floor tabs to appear (indicates floors are loaded)
    await authenticatedPage.waitForSelector(
      'v-btn-toggle:has(button:has-text("Main Workshop")), .v-btn-group:has(button:has-text("Main")), button:has-text("Main")',
      { timeout: 5000 }
    ).catch(() => {});

    // Also wait for printer tiles to appear
    await authenticatedPage.waitForSelector(
      '.printer-card, [data-testid="printer-card"], .printer-tile',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1500);

    await captureFullPage(authenticatedPage, 'printer-grid-with-printers.png', 'printer-grid');
  });

  test('03-create-floor-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Click add floor button
    const addFloorBtn = authenticatedPage.locator('button').filter({ hasText: /add.*floor|create.*floor|new.*floor/i }).first();
    if (await addFloorBtn.isVisible().catch(() => false)) {
      await addFloorBtn.click();
    } else {
      // Try fab button or icon button
      const fabBtn = authenticatedPage.locator('[data-testid="add-floor-btn"], .v-btn--floating, button[aria-label*="floor" i]').first();
      await fabBtn.click().catch(() => {});
    }

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-floor-dialog.png', 'printer-grid');
  });

  test('04-create-printer-on-floor-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Click add printer button
    const addPrinterBtn = authenticatedPage.locator('button').filter({ hasText: /add.*printer|create.*printer|new.*printer/i }).first();
    if (await addPrinterBtn.isVisible().catch(() => false)) {
      await addPrinterBtn.click();
    } else {
      // Try icon button
      const iconBtn = authenticatedPage.locator('[data-testid="add-printer-btn"], button[aria-label*="printer" i]').first();
      await iconBtn.click().catch(() => {});
    }

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-printer-on-floor-dialog.png', 'printer-grid');
  });

  test('05-printer-grid-drag-hint', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Try to trigger drag state by hovering over a printer card
    const printerCard = authenticatedPage.locator('.printer-card, [data-testid="printer-card"]').first();
    if (await printerCard.isVisible().catch(() => false)) {
      await printerCard.hover();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'printer-grid-drag-hint.png', 'printer-grid');
  });

  test('06-batch-operations-bar', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Try to select multiple printers
    const printerCards = authenticatedPage.locator('.printer-card, [data-testid="printer-card"]');
    const count = await printerCards.count().catch(() => 0);

    if (count >= 2) {
      // Click first printer with shift/ctrl
      await printerCards.nth(0).click({ modifiers: ['Shift'] });
      await authenticatedPage.waitForTimeout(300);
      await printerCards.nth(1).click({ modifiers: ['Shift'] });
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'batch-operations-bar.png', 'printer-grid');
  });

  test('07-printer-grid-context-menu', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Right-click on a printer card
    const printerCard = authenticatedPage.locator('.printer-card, [data-testid="printer-card"]').first();
    if (await printerCard.isVisible().catch(() => false)) {
      await printerCard.click({ button: 'right' });
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'printer-grid-context-menu.png', 'printer-grid');
  });
});
