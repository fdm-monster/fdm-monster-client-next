import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Settings Screenshots
 * Captures: All settings pages including server, floor, user role settings
 */
test.describe('Settings Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-settings-overview', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings();

    // Wait for settings page to load
    await authenticatedPage.waitForSelector(
      '[data-testid="settings"], .settings, main',
      { timeout: 5000 }
    ).catch(() => {});

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-overview.png', 'settings');
  });

  test('02-settings-server', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('server');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-server.png', 'settings');
  });

  test('03-settings-floors', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('floors');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-floors.png', 'settings');
  });

  test('04-settings-users', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('users');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-users.png', 'settings');
  });

  test('05-settings-user-roles', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('users');

    await authenticatedPage.waitForTimeout(1000);

    // Try to open user role editor or dialog
    const userRow = authenticatedPage.locator('tr, .user-item').first();
    if (await userRow.isVisible().catch(() => false)) {
      await userRow.click();
      await authenticatedPage.waitForTimeout(1000);
    }

    await captureFullPage(authenticatedPage, 'settings-user-roles.png', 'settings');
  });

  test('06-settings-frontend', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('frontend');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-frontend.png', 'settings');
  });

  test('07-settings-timeout', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('timeout');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-timeout.png', 'settings');
  });

  test('08-settings-printer-defaults', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('printer-defaults');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-printer-defaults.png', 'settings');
  });

  test('09-settings-wizard', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('wizard');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-wizard.png', 'settings');
  });

  test('10-settings-diagnostics', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('diagnostics');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-diagnostics.png', 'settings');
  });

  test('11-settings-about', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('about');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-about.png', 'settings');
  });
});
