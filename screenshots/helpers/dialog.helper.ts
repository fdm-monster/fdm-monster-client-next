import { Page, Locator } from '@playwright/test';

/**
 * Helper utilities for interacting with Vuetify dialogs and modals
 */

export class DialogHelper {
  constructor(private page: Page) {}

  /**
   * Wait for a dialog to appear
   * @param selector Optional specific dialog selector, defaults to active Vuetify dialog
   * @param timeout Maximum time to wait in milliseconds
   */
  async waitForDialog(selector?: string, timeout = 5000): Promise<Locator> {
    const dialogSelector = selector || '.v-dialog--active';
    await this.page.waitForSelector(dialogSelector, {
      state: 'visible',
      timeout,
    });
    return this.page.locator(dialogSelector).first();
  }

  /**
   * Wait for dialog to disappear
   * @param selector Optional specific dialog selector
   * @param timeout Maximum time to wait in milliseconds
   */
  async waitForDialogToClose(selector?: string, timeout = 5000): Promise<void> {
    const dialogSelector = selector || '.v-dialog--active';
    await this.page.waitForSelector(dialogSelector, {
      state: 'hidden',
      timeout,
    });
  }

  /**
   * Click the close button in the dialog (usually the X button)
   */
  async closeDialog(): Promise<void> {
    // Try multiple common close button selectors
    const closeSelectors = [
      '[data-testid="dialog-close"]',
      '[data-testid="close-dialog"]',
      '.v-dialog button[aria-label="Close"]',
      '.v-dialog .v-btn--icon',
    ];

    for (const selector of closeSelectors) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        return;
      }
    }

    // Fallback: press Escape key
    await this.page.keyboard.press('Escape');
  }

  /**
   * Click the submit/confirm button in the dialog
   * @param buttonText Optional specific button text, defaults to common submit button selectors
   */
  async submitDialog(buttonText?: string): Promise<void> {
    if (buttonText) {
      const button = this.page
        .locator('.v-dialog button')
        .filter({ hasText: buttonText })
        .first();
      await button.click();
      return;
    }

    // Try common submit button selectors
    const submitSelectors = [
      '[data-testid="dialog-submit"]',
      '[data-testid="dialog-confirm"]',
      '[data-testid="submit-dialog"]',
      '.v-dialog button[type="submit"]',
    ];

    for (const selector of submitSelectors) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        return;
      }
    }

    // Fallback: look for primary button
    const primaryButton = this.page
      .locator('.v-dialog .v-btn--variant-elevated')
      .last();
    if (await primaryButton.isVisible()) {
      await primaryButton.click();
    }
  }

  /**
   * Click the cancel button in the dialog
   */
  async cancelDialog(): Promise<void> {
    const cancelSelectors = [
      '[data-testid="dialog-cancel"]',
      '[data-testid="cancel-dialog"]',
      '.v-dialog button:has-text("Cancel")',
    ];

    for (const selector of cancelSelectors) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        return;
      }
    }
  }

  /**
   * Get dialog title text
   */
  async getDialogTitle(): Promise<string> {
    const titleSelectors = [
      '.v-dialog .v-card-title',
      '.v-dialog .v-toolbar-title',
      '.v-dialog h2',
      '.v-dialog h3',
    ];

    for (const selector of titleSelectors) {
      const title = this.page.locator(selector).first();
      if (await title.isVisible({ timeout: 1000 }).catch(() => false)) {
        return await title.textContent() || '';
      }
    }

    return '';
  }

  /**
   * Check if dialog is currently open
   */
  async isDialogOpen(selector?: string): Promise<boolean> {
    const dialogSelector = selector || '.v-dialog--active';
    return await this.page
      .locator(dialogSelector)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Wait for dialog content to be fully loaded
   * Waits for network idle and any loading spinners to disappear
   */
  async waitForDialogContentReady(timeout = 5000): Promise<void> {
    // Wait for any loading spinners to disappear
    await this.page
      .locator('.v-dialog .v-progress-circular')
      .waitFor({ state: 'hidden', timeout })
      .catch(() => {});

    // Wait a bit for animations
    await this.page.waitForTimeout(300);
  }
}

/**
 * Create a dialog helper instance for a page
 */
export function createDialogHelper(page: Page): DialogHelper {
  return new DialogHelper(page);
}
