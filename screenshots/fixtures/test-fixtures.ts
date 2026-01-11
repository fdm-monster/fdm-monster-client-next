import { test as base, Page } from '@playwright/test';
import { ApiMock } from './api-mock';
import { mockSocketIO } from './socketio-mock';
import { mockPrinters } from './data/printers.fixtures';
import { mockFloors } from './data/floors.fixtures';
import { mockCameras } from './data/cameras.fixtures';
import { mockFiles } from './data/files.fixtures';
import { mockJobs } from './data/jobs.fixtures';

/**
 * Custom fixtures for screenshot tests
 * Extends Playwright's base test with additional fixtures for API mocking and authenticated pages
 */
type ScreenshotFixtures = {
  apiMock: ApiMock;
  authenticatedPage: Page;
  mockPrinters: typeof mockPrinters;
  mockFloors: typeof mockFloors;
  mockCameras: typeof mockCameras;
  mockFiles: typeof mockFiles;
  mockJobs: typeof mockJobs;
};

/**
 * Extended test object with custom fixtures
 * Usage: import { test, expect } from '../fixtures/test-fixtures'
 */
export const test = base.extend<ScreenshotFixtures>({
  /**
   * Page fixture override - automatically mocks SocketIO for all pages
   * This prevents "server disconnected" messages
   */
  page: async ({ page }, use) => {
    // Mock SocketIO before page loads
    await mockSocketIO(page);

    // Mock static assets to prevent loading errors
    await page.route('**/*.png', (route) => {
      // Return a 1x1 transparent PNG for any image requests
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
      });
    });

    await page.route('**/*.jpg', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==', 'base64'),
      });
    });

    await page.route('**/*.svg', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
      });
    });

    await use(page);
  },

  /**
   * ApiMock fixture - provides API mocking instance
   * Automatically cleans up routes after each test
   */
  apiMock: async ({ page }, use) => {
    const mock = new ApiMock(page);
    await use(mock);
    await mock.unmockAll();
  },

  /**
   * Authenticated page fixture - provides a page with mocked authentication
   * Use this when you need to test pages that require login
   */
  authenticatedPage: async ({ page, apiMock }, use) => {
    // Mock authentication endpoints (no login required)
    await apiMock.mockAuthEndpoints({ loginRequired: false });

    // Navigate to the app
    await page.goto('/');

    // Set auth tokens in localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-token',
        'mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      );
      localStorage.setItem(
        'refresh-token',
        'mock-refresh-token-abcd1234efgh5678ijkl9012'
      );
    });

    await use(page);
  },

  /**
   * Mock data fixtures - provides test data
   * These can be imported and used in tests or modified as needed
   */
  mockPrinters: async ({}, use) => {
    await use(mockPrinters);
  },

  mockFloors: async ({}, use) => {
    await use(mockFloors);
  },

  mockCameras: async ({}, use) => {
    await use(mockCameras);
  },

  mockFiles: async ({}, use) => {
    await use(mockFiles);
  },

  mockJobs: async ({}, use) => {
    await use(mockJobs);
  },
});

/**
 * Re-export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';
