import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';

/**
 * Panels and Dialogs Screenshots
 * Captures: YAML import/export, OctoFarm import, menus, various dialogs
 */
test.describe('Panels and Dialogs Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-yaml-export-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings();

    await authenticatedPage.waitForTimeout(1000);

    // Look for YAML export button
    const exportBtn = authenticatedPage.locator('button').filter({ hasText: /yaml.*export|export.*yaml/i }).first();
    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'yaml-export-panel.png', 'dialogs');
  });

  test('02-yaml-import-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings();

    await authenticatedPage.waitForTimeout(1000);

    // Look for YAML import button
    const importBtn = authenticatedPage.locator('button').filter({ hasText: /yaml.*import|import.*yaml/i }).first();
    if (await importBtn.isVisible().catch(() => false)) {
      await importBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'yaml-import-panel.png', 'dialogs');
  });

  test('03-octofarm-import-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings();

    await authenticatedPage.waitForTimeout(1000);

    // Look for OctoFarm import button
    const importBtn = authenticatedPage.locator('button').filter({ hasText: /octofarm.*import|import.*octofarm/i }).first();
    if (await importBtn.isVisible().catch(() => false)) {
      await importBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'octofarm-import-panel.png', 'dialogs');
  });

  test('04-jobs-menu', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToJobs();

    await authenticatedPage.waitForTimeout(1000);

    // Open jobs menu
    const menuBtn = authenticatedPage.locator('button[aria-label*="menu" i], .menu-btn').first();
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'jobs-menu.png', 'dialogs');
  });

  test('05-printer-status-menu', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinterGrid();

    await authenticatedPage.waitForTimeout(1000);

    // Click on a printer to open status menu
    const printerCard = authenticatedPage.locator('.printer-card, [data-testid="printer-card"]').first();
    if (await printerCard.isVisible().catch(() => false)) {
      // Look for menu button on printer card
      const menuBtn = printerCard.locator('button[aria-label*="menu" i], .menu-btn').first();
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click();
        await authenticatedPage.waitForTimeout(500);
      }
    }

    await captureFullPage(authenticatedPage, 'printer-status-menu.png', 'dialogs');
  });

  test('06-printer-dialog-create', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create|new/i }).first();
    await addBtn.click().catch(() => {});

    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'printer-dialog-create.png', 'dialogs');
  });

  test('07-printer-dialog-update', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Click edit on first printer
    const editBtn = authenticatedPage.locator('button').filter({ hasText: /edit/i }).first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'printer-dialog-update.png', 'dialogs');
  });

  test('08-printer-dialog-duplicate', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Look for duplicate button
    const duplicateBtn = authenticatedPage.locator('button').filter({ hasText: /duplicate/i }).first();
    if (await duplicateBtn.isVisible().catch(() => false)) {
      await duplicateBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'printer-dialog-duplicate.png', 'dialogs');
  });

  test('09-printer-test-connection-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Look for test connection button
    const testBtn = authenticatedPage.locator('button').filter({ hasText: /test.*connection|connection.*test/i }).first();
    if (await testBtn.isVisible().catch(() => false)) {
      await testBtn.click();
      await authenticatedPage.waitForTimeout(1500);
    }

    await captureFullPage(authenticatedPage, 'printer-test-connection-dialog.png', 'dialogs');
  });

  test('10-printer-type-dropdown', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Open create printer dialog
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create/i }).first();
    await addBtn.click().catch(() => {});

    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    // Click on printer type dropdown
    const typeSelect = authenticatedPage.locator('.v-dialog select, .v-dialog .v-select').filter({ hasText: /type/i }).first();
    if (await typeSelect.isVisible().catch(() => false)) {
      await typeSelect.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'printer-type-dropdown.png', 'dialogs');
  });

  test('11-printer-force-save-warning', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Open create printer dialog and try to save without required fields
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create/i }).first();
    await addBtn.click().catch(() => {});

    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    // Try to save (should show validation or force save option)
    const saveBtn = authenticatedPage.locator('.v-dialog button').filter({ hasText: /save|create/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'printer-force-save-warning.png', 'dialogs');
  });

  test('12-edit-floor-panel', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('floors');

    await authenticatedPage.waitForTimeout(1000);

    // Click on first floor to edit
    const floorItem = authenticatedPage.locator('.floor-item, [data-testid="floor-item"], tr').first();
    if (await floorItem.isVisible().catch(() => false)) {
      await floorItem.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'edit-floor-panel.png', 'dialogs');
  });

  test('13-delete-confirmation-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToPrinters();

    await authenticatedPage.waitForTimeout(1000);

    // Look for delete button
    const deleteBtn = authenticatedPage.locator('button').filter({ hasText: /delete|remove/i }).first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'delete-confirmation-dialog.png', 'dialogs');
  });
});
