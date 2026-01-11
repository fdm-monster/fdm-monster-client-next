import { Page } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Utility functions for taking documentation screenshots
 */

/**
 * Ensure a directory exists, create it if not
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get screenshot output path
 */
export function getScreenshotPath(filename: string, subdir?: string): string {
  const baseDir = path.join(__dirname, 'output');
  const targetDir = subdir ? path.join(baseDir, subdir) : baseDir;
  ensureDir(targetDir);
  return path.join(targetDir, filename);
}

/**
 * Wait for page to be fully loaded and animations to complete
 */
export async function waitForPageReady(page: Page, timeout = 1000): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(timeout); // Allow animations to complete
}

/**
 * Capture a full page screenshot with consistent settings
 */
export async function captureFullPage(
  page: Page,
  filename: string,
  subdir?: string
): Promise<void> {
  await waitForPageReady(page);
  await page.screenshot({
    path: getScreenshotPath(filename, subdir),
    fullPage: true,
  });
}

/**
 * Capture viewport screenshot with consistent settings
 */
export async function captureViewport(
  page: Page,
  filename: string,
  subdir?: string
): Promise<void> {
  await waitForPageReady(page);
  await page.screenshot({
    path: getScreenshotPath(filename, subdir),
    fullPage: false,
  });
}

/**
 * Capture element screenshot
 */
export async function captureElement(
  page: Page,
  selector: string,
  filename: string,
  subdir?: string
): Promise<void> {
  await waitForPageReady(page);
  const element = page.locator(selector).first();

  if (await element.count() === 0) {
    console.warn(`Element not found: ${selector}`);
    return;
  }

  await element.screenshot({
    path: getScreenshotPath(filename, subdir),
  });
}

/**
 * Set up authentication (example - adjust based on your auth implementation)
 */
export async function setupAuth(page: Page, token?: string): Promise<void> {
  if (token) {
    await page.goto('/');
    await page.evaluate((authToken) => {
      localStorage.setItem('auth-token', authToken);
    }, token);
  } else {
    // Default login flow
    await page.goto('/login');
    // Add your login logic here
  }
}

/**
 * Capture screenshots at multiple viewport sizes
 */
export async function captureResponsive(
  page: Page,
  route: string,
  baseFilename: string,
  viewports: Array<{ width: number; height: number; name: string }>,
  subdir?: string
): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(route);
    await waitForPageReady(page);

    const filename = `${baseFilename}-${viewport.name}.png`;
    await page.screenshot({
      path: getScreenshotPath(filename, subdir),
      fullPage: false,
    });
  }
}

/**
 * Common viewport presets
 */
export const VIEWPORTS = {
  DESKTOP_FHD: { width: 1920, height: 1080, name: 'desktop-1920x1080' },
  DESKTOP_HD: { width: 1366, height: 768, name: 'desktop-1366x768' },
  DESKTOP_LAPTOP: { width: 1280, height: 720, name: 'laptop-1280x720' },
  TABLET_PORTRAIT: { width: 768, height: 1024, name: 'tablet-portrait' },
  TABLET_LANDSCAPE: { width: 1024, height: 768, name: 'tablet-landscape' },
  MOBILE_IPHONE_SE: { width: 375, height: 667, name: 'mobile-iphone-se' },
  MOBILE_IPHONE_12: { width: 390, height: 844, name: 'mobile-iphone-12' },
  MOBILE_PIXEL_5: { width: 393, height: 851, name: 'mobile-pixel-5' },
};

/**
 * Capture both light and dark theme screenshots
 */
export async function captureBothThemes(
  page: Page,
  route: string,
  baseFilename: string,
  themeToggleSelector: string,
  subdir?: string
): Promise<void> {
  await page.goto(route);
  await waitForPageReady(page);

  // Capture light theme
  await page.screenshot({
    path: getScreenshotPath(`${baseFilename}-light.png`, subdir),
    fullPage: false,
  });

  // Toggle to dark theme
  const themeToggle = page.locator(themeToggleSelector);
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Capture dark theme
    await page.screenshot({
      path: getScreenshotPath(`${baseFilename}-dark.png`, subdir),
      fullPage: false,
    });
  }
}

/**
 * Hide elements before taking screenshot (useful for hiding dynamic content)
 */
export async function hideElements(page: Page, selectors: string[]): Promise<void> {
  for (const selector of selectors) {
    await page.locator(selector).evaluateAll((elements) => {
      elements.forEach((el: HTMLElement) => {
        el.style.visibility = 'hidden';
      });
    });
  }
}

/**
 * Mask sensitive data in screenshots
 */
export async function maskElements(page: Page, selectors: string[]): Promise<void> {
  for (const selector of selectors) {
    await page.locator(selector).evaluateAll((elements) => {
      elements.forEach((el: HTMLElement) => {
        el.style.filter = 'blur(10px)';
      });
    });
  }
}

/**
 * Wait for specific element to be visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    console.warn(`Element not visible within timeout: ${selector}`);
    return false;
  }
}

