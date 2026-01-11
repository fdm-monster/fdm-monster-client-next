import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';
import { createDialogHelper } from '../helpers/dialog.helper';

/**
 * Camera Grid Screenshots
 * Captures: Camera grid, creating camera
 */
test.describe('Camera Grid Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-camera-grid-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    // Wait for camera grid to load
    await authenticatedPage.waitForSelector(
      '[data-testid="camera-grid"], .camera-grid, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'camera-grid-view.png', 'cameras');
  });

  test('02-camera-grid-empty', async ({ authenticatedPage, apiMock }) => {
    // Mock with empty data
    await apiMock.mockAllEndpoints({ loginRequired: false, emptyData: true });

    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    await authenticatedPage.waitForSelector(
      '[data-testid="empty-state"], .empty-state, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'camera-grid-empty.png', 'cameras');
  });

  test('03-create-camera-dialog', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    await authenticatedPage.waitForTimeout(1000);

    // Click add/create camera button
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create|new/i }).first();
    await addBtn.click().catch(() => {});

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-camera-dialog.png', 'cameras');
  });

  test('04-create-camera-dialog-filled', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    await authenticatedPage.waitForTimeout(1000);

    // Click add camera button
    const addBtn = authenticatedPage.locator('button').filter({ hasText: /add|create|new/i }).first();
    await addBtn.click().catch(() => {});

    // Wait for dialog
    const dialog = createDialogHelper(authenticatedPage);
    await dialog.waitForDialog();

    await authenticatedPage.waitForTimeout(500);

    // Fill form fields
    const inputs = authenticatedPage.locator('.v-dialog input[type="text"], .v-dialog input[type="url"]');
    if (await inputs.count() > 0) {
      await inputs.nth(0).fill('Main Workshop Camera');
      if (await inputs.count() > 1) {
        await inputs.nth(1).fill('http://192.168.1.100/webcam/?action=stream');
      }
    }

    await authenticatedPage.waitForTimeout(500);

    await captureFullPage(authenticatedPage, 'create-camera-dialog-filled.png', 'cameras');
  });

  test('05-camera-card-with-stream', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    await authenticatedPage.waitForTimeout(1500);

    // Focus on a single camera card if visible
    const cameraCard = authenticatedPage.locator('.camera-card, [data-testid="camera-card"]').first();
    if (await cameraCard.isVisible().catch(() => false)) {
      await cameraCard.hover();
      await authenticatedPage.waitForTimeout(500);
    }

    await captureFullPage(authenticatedPage, 'camera-card-with-stream.png', 'cameras');
  });

  test('06-camera-fullscreen-view', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToCameras();

    await authenticatedPage.waitForTimeout(1000);

    // Click on a camera to open fullscreen/expanded view
    const cameraCard = authenticatedPage.locator('.camera-card, [data-testid="camera-card"]').first();
    if (await cameraCard.isVisible().catch(() => false)) {
      await cameraCard.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'camera-fullscreen-view.png', 'cameras');
  });
});
