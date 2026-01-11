import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage, captureElement } from '../utils';
import { createFormHelper } from '../helpers/form.helper';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Authentication Screenshots
 * Captures: First Time Setup, Login, Registration pages
 */
test.describe('Authentication Screenshots', () => {
  test('01-first-time-setup-wizard', async ({ page, apiMock }) => {
    // Mock all endpoints with wizard incomplete
    await apiMock.mockAllEndpoints({
      loginRequired: false,
      emptyData: false,
    });

    // Override auth endpoints to show wizard incomplete
    await apiMock.mockAuthEndpoints({
      loginRequired: false,
      wizardIncomplete: true,
    });

    // Navigate to first time setup
    const nav = createNavigationHelper(page);
    await nav.goToFirstTimeSetup();

    // Wait for page to render
    await page.waitForSelector('[data-testid="wizard-container"], .first-time-setup, .wizard', {
      timeout: 5000,
    }).catch(() => {});

    // Capture the wizard page
    await captureFullPage(page, 'first-time-setup-wizard.png', 'auth');
  });

  test('02-login-page', async ({ page, apiMock }) => {
    // Mock all endpoints with login required
    await apiMock.mockAllEndpoints({ loginRequired: true });

    // Navigate to login page
    const nav = createNavigationHelper(page);
    await nav.goToLogin();

    // Wait for login form
    await page.waitForSelector('[name="username"], input[type="text"]', {
      timeout: 5000,
    }).catch(() => {});

    // Capture empty login page
    await captureFullPage(page, 'login-page-empty.png', 'auth');
  });

  test('03-login-page-filled', async ({ page, apiMock }) => {
    // Mock all endpoints with login required
    await apiMock.mockAllEndpoints({ loginRequired: true });

    // Navigate to login page
    const nav = createNavigationHelper(page);
    await nav.goToLogin();

    // Wait for login form - try multiple selectors
    await page.waitForSelector('input[type="text"], input[type="email"], .v-text-field input', {
      timeout: 5000,
    }).catch(() => {});

    await page.waitForTimeout(1000);

    // Fill login form directly without helper (more reliable)
    const usernameInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('password123');

    // Capture filled login page
    await captureFullPage(page, 'login-page-filled.png', 'auth');
  });

  test('04-registration-page', async ({ page, apiMock }) => {
    // Mock all endpoints first
    await apiMock.mockAllEndpoints({ loginRequired: false });

    // Override auth with registration enabled
    await apiMock.mockAuthEndpoints({ registrationEnabled: true });

    // Navigate to registration page
    const nav = createNavigationHelper(page);
    await nav.goToRegister();

    // Wait for registration form
    await page.waitForSelector('[name="username"], input[type="text"]', {
      timeout: 5000,
    }).catch(() => {});

    // Capture empty registration page
    await captureFullPage(page, 'registration-page-empty.png', 'auth');
  });

  test('05-registration-page-filled', async ({ page, apiMock }) => {
    // Mock all endpoints first
    await apiMock.mockAllEndpoints({ loginRequired: false });

    // Override auth with registration enabled
    await apiMock.mockAuthEndpoints({ registrationEnabled: true });

    // Navigate to registration page
    const nav = createNavigationHelper(page);
    await nav.goToRegister();

    // Wait for registration form
    await page.waitForSelector('input[type="text"], input[type="email"], .v-text-field input', {
      timeout: 5000,
    }).catch(() => {});

    await page.waitForTimeout(1000);

    // Fill registration form directly (more reliable)
    const inputs = page.locator('input');
    const usernameInput = inputs.first();
    const passwordInputs = page.locator('input[type="password"]');

    await usernameInput.fill('newuser');
    await passwordInputs.first().fill('securePassword123');
    await passwordInputs.nth(1).fill('securePassword123');

    // Capture filled registration page
    await captureFullPage(page, 'registration-page-filled.png', 'auth');
  });
});
