import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Settings Screenshots
 * Captures: All settings pages based on actual routes from setting.constants.ts
 */
test.describe('Settings Screenshots', () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockAllEndpoints({ loginRequired: false });
  });

  test('01-settings-overview', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings();

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-overview.png', 'settings');
  });

  test('02-settings-floors', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('floors');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-floors.png', 'settings');
  });

  test('03-settings-printer', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('printer');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-printer.png', 'settings');
  });

  test('04-settings-emergency-commands', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('emergency-commands');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-emergency-commands.png', 'settings');
  });

  test('05-settings-server-protection', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('server-protection');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-server-protection.png', 'settings');
  });

  test('06-settings-user-management', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('user-management');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-user-management.png', 'settings');
  });

  test('07-settings-account', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('account');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-account.png', 'settings');
  });

  test('08-settings-software-upgrade', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('software-upgrade');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-software-upgrade.png', 'settings');
  });

  test('09-settings-diagnostics', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('diagnostics');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-diagnostics.png', 'settings');
  });

  test('10-settings-experimental', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('experimental');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-experimental.png', 'settings');
  });

  test('11-settings-slicer', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('slicer');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-slicer.png', 'settings');
  });

  test('12-settings-debug-socket', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('debug-socket');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-debug-socket.png', 'settings');
  });

  test('13-settings-about', async ({ authenticatedPage }) => {
    const nav = createNavigationHelper(authenticatedPage);
    await nav.goToSettings('about');

    await authenticatedPage.waitForTimeout(1000);

    await captureFullPage(authenticatedPage, 'settings-about.png', 'settings');
  });
});
