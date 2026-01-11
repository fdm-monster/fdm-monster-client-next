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
   * This prevents "server disconnected" messages and injects initial data
   */
  page: async ({ page }, use) => {
    // Mock SocketIO with initial data before page loads
    await mockSocketIO(page, {
      floors: mockFloors,
      printers: mockPrinters,
      socketStates: {},
      printerEvents: {},
      trackedUploads: { current: [] },
    });

    // Let all assets (PNG, JPG, SVG) load normally from Vite dev server
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
   * Note: Socket.IO data is injected via page fixture above
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
