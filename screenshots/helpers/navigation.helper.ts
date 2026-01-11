import { Page } from '@playwright/test';

/**
 * Helper utilities for navigation and routing
 */

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to a specific route
   * @param path Route path (e.g., '/dashboard', '/printer-grid')
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboard(): Promise<void> {
    await this.navigateTo('/dashboard');
  }

  /**
   * Navigate to printer grid
   */
  async goToPrinterGrid(): Promise<void> {
    await this.navigateTo('/printer-grid');
  }

  /**
   * Navigate to printer list
   */
  async goToPrinterList(): Promise<void> {
    await this.navigateTo('/printers');
  }

  /**
   * Navigate to camera grid
   */
  async goToCameraGrid(): Promise<void> {
    await this.navigateTo('/camera-grid');
  }

  /**
   * Navigate to print jobs
   */
  async goToPrintJobs(): Promise<void> {
    await this.navigateTo('/print-jobs');
  }

  /**
   * Navigate to print queue
   */
  async goToPrintQueue(): Promise<void> {
    await this.navigateTo('/queue');
  }

  /**
   * Navigate to files
   */
  async goToFiles(): Promise<void> {
    await this.navigateTo('/files');
  }

  /**
   * Navigate to settings
   * @param subsection Optional settings subsection (e.g., 'server', 'users', 'floors')
   */
  async goToSettings(subsection?: string): Promise<void> {
    if (subsection) {
      await this.navigateTo(`/settings/${subsection}`);
    } else {
      await this.navigateTo('/settings');
    }
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.navigateTo('/login');
  }

  /**
   * Navigate to registration page
   */
  async goToRegister(): Promise<void> {
    await this.navigateTo('/registration');
  }

  /**
   * Navigate to first time setup
   */
  async goToFirstTimeSetup(): Promise<void> {
    await this.navigateTo('/first-time-setup');
  }

  /**
   * Open sidebar/navigation drawer (if collapsed on mobile/tablet)
   */
  async openSidebar(): Promise<void> {
    const sidebarToggle = this.page.locator('[data-testid="sidebar-toggle"]');
    const navigationDrawer = this.page.locator('.v-navigation-drawer');

    // Check if sidebar is hidden (mobile view)
    const isHidden = await navigationDrawer.isHidden().catch(() => true);

    if (isHidden && (await sidebarToggle.isVisible())) {
      await sidebarToggle.click();
      await this.page.waitForSelector('.v-navigation-drawer', {
        state: 'visible',
      });
    }
  }

  /**
   * Click a navigation link in the sidebar
   * @param linkText Text of the navigation link
   */
  async clickSidebarLink(linkText: string): Promise<void> {
    await this.openSidebar();

    const link = this.page
      .locator('.v-navigation-drawer a, .v-navigation-drawer .v-list-item')
      .filter({ hasText: linkText })
      .first();

    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be fully loaded
   * Waits for network idle and any loading indicators to disappear
   */
  async waitForPageLoad(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    // Wait for any loading spinners to disappear
    await this.page
      .locator('.v-progress-circular, .v-progress-linear')
      .first()
      .waitFor({ state: 'hidden', timeout })
      .catch(() => {});

    // Small delay for animations
    await this.page.waitForTimeout(300);
  }

  /**
   * Get current route path
   */
  async getCurrentPath(): Promise<string> {
    return await this.page.evaluate(() => window.location.pathname);
  }

  /**
   * Check if currently on a specific route
   * @param path Route path to check
   */
  async isOnRoute(path: string): Promise<boolean> {
    const currentPath = await this.getCurrentPath();
    return currentPath === path;
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Refresh current page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }
}

/**
 * Create a navigation helper instance for a page
 */
export function createNavigationHelper(page: Page): NavigationHelper {
  return new NavigationHelper(page);
}
