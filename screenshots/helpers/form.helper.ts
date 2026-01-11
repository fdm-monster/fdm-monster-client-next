import { Page, Locator } from '@playwright/test';

/**
 * Helper utilities for filling forms
 * Provides methods to fill common form fields used in FDM Monster
 */

export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill a text input field
   * @param selector Field selector or label text
   * @param value Value to fill
   */
  async fillTextField(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector).first();
    await input.clear();
    await input.fill(value);
  }

  /**
   * Fill printer form fields
   */
  async fillPrinterForm(data: {
    name?: string;
    printerURL?: string;
    apiKey?: string;
    printerType?: number;
    username?: string;
    password?: string;
  }): Promise<void> {
    if (data.name !== undefined) {
      await this.fillTextField('[name="name"]', data.name);
    }
    if (data.printerURL !== undefined) {
      await this.fillTextField('[name="printerURL"]', data.printerURL);
    }
    if (data.apiKey !== undefined) {
      await this.fillTextField('[name="apiKey"]', data.apiKey);
    }
    if (data.username !== undefined) {
      await this.fillTextField('[name="username"]', data.username);
    }
    if (data.password !== undefined) {
      await this.fillTextField('[name="password"]', data.password);
    }
    if (data.printerType !== undefined) {
      await this.selectDropdownOption('[name="printerType"]', data.printerType.toString());
    }
  }

  /**
   * Fill floor form fields
   */
  async fillFloorForm(data: { name?: string; order?: string }): Promise<void> {
    if (data.name !== undefined) {
      await this.fillTextField('[name="name"]', data.name);
    }
    if (data.order !== undefined) {
      await this.fillTextField('[name="order"]', data.order);
    }
  }

  /**
   * Fill camera form fields
   */
  async fillCameraForm(data: {
    name?: string;
    streamURL?: string;
    printerId?: number;
  }): Promise<void> {
    if (data.name !== undefined) {
      await this.fillTextField('[name="name"]', data.name);
    }
    if (data.streamURL !== undefined) {
      await this.fillTextField('[name="streamURL"]', data.streamURL);
    }
    if (data.printerId !== undefined) {
      await this.selectDropdownOption('[name="printerId"]', data.printerId.toString());
    }
  }

  /**
   * Fill login form
   */
  async fillLoginForm(username: string, password: string): Promise<void> {
    await this.fillTextField('[name="username"]', username);
    await this.fillTextField('[name="password"]', password);
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(
    username: string,
    password: string,
    confirmPassword?: string
  ): Promise<void> {
    await this.fillTextField('[name="username"]', username);
    await this.fillTextField('[name="password"]', password);
    if (confirmPassword !== undefined) {
      await this.fillTextField('[name="confirmPassword"]', confirmPassword);
    }
  }

  /**
   * Select option from dropdown (Vuetify select)
   * @param selector Select field selector
   * @param value Value or visible text to select
   */
  async selectDropdownOption(selector: string, value: string): Promise<void> {
    // Click to open the select
    const select = this.page.locator(selector).first();
    await select.click();

    // Wait for menu to appear
    await this.page.waitForSelector('.v-menu--active', { state: 'visible' });

    // Try to click by value or text
    const option = this.page
      .locator('.v-menu--active .v-list-item')
      .filter({ hasText: value })
      .first();

    if (await option.isVisible()) {
      await option.click();
    } else {
      // Fallback: click first option if no match found
      await this.page.locator('.v-menu--active .v-list-item').first().click();
    }
  }

  /**
   * Toggle a checkbox
   * @param selector Checkbox selector
   * @param checked Desired state (true for checked, false for unchecked)
   */
  async toggleCheckbox(selector: string, checked: boolean): Promise<void> {
    const checkbox = this.page.locator(selector).first();
    const isChecked = await checkbox.isChecked();

    if (isChecked !== checked) {
      await checkbox.click();
    }
  }

  /**
   * Toggle a switch (Vuetify switch)
   * @param selector Switch selector
   * @param enabled Desired state (true for on, false for off)
   */
  async toggleSwitch(selector: string, enabled: boolean): Promise<void> {
    const switchElement = this.page.locator(selector).first();
    const isEnabled = await switchElement.getAttribute('aria-checked');

    if ((isEnabled === 'true') !== enabled) {
      await switchElement.click();
    }
  }

  /**
   * Wait for form validation to complete
   * Waits for error messages to appear or disappear
   */
  async waitForValidation(timeout = 2000): Promise<void> {
    await this.page.waitForTimeout(500);
    // Wait for any validation messages to settle
    await this.page
      .locator('.v-messages__message')
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => {});
  }

  /**
   * Get validation error message for a field
   * @param fieldSelector Field selector
   */
  async getFieldError(fieldSelector: string): Promise<string | null> {
    const field = this.page.locator(fieldSelector).first();
    const errorMessage = field
      .locator('.. >> .v-messages__message')
      .first();

    if (await errorMessage.isVisible().catch(() => false)) {
      return await errorMessage.textContent();
    }

    return null;
  }

  /**
   * Check if form has any validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorMessages = this.page.locator('.v-messages__message.error--text');
    return (await errorMessages.count()) > 0;
  }
}

/**
 * Create a form helper instance for a page
 */
export function createFormHelper(page: Page): FormHelper {
  return new FormHelper(page);
}
