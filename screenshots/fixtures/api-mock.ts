import { Page, Route } from '@playwright/test';
import {
  mockLoginRequired,
  mockLoginRequiredTrue,
  mockLoginRequiredWithWizard,
  mockRegistrationEnabled,
  mockLoginResponse,
  mockVerifyResponse,
  mockRefreshResponse,
} from './data/auth.fixtures';
import { mockPrinters, mockPrinterEmpty, mockPrinterStates } from './data/printers.fixtures';
import { mockFloors, mockFloorsEmpty, mockSingleFloor } from './data/floors.fixtures';
import { mockCameras, mockCamerasEmpty } from './data/cameras.fixtures';
import { mockFiles, mockFilesEmpty } from './data/files.fixtures';
import { mockJobs, mockJobsEmpty, mockJobDetails, mockQueue } from './data/jobs.fixtures';
import {
  mockServerSettings,
  mockUsers,
  mockCurrentUser,
} from './data/settings.fixtures';

/**
 * API mocking helper class for intercepting and mocking API requests
 * Uses Playwright route interception to return mock data
 */
export class ApiMock {
  constructor(private page: Page) {}

  /**
   * Helper to fulfill route with JSON response
   */
  private fulfillJson(route: Route, data: any, status = 200) {
    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mock authentication endpoints
   */
  async mockAuthEndpoints(options?: {
    loginRequired?: boolean;
    wizardIncomplete?: boolean;
    registrationEnabled?: boolean;
  }) {
    // Mock /api/v2/auth/login-required
    await this.page.route('**/api/v2/auth/login-required', (route) => {
      if (options?.wizardIncomplete) {
        return this.fulfillJson(route, mockLoginRequiredWithWizard);
      }
      if (options?.registrationEnabled) {
        return this.fulfillJson(route, mockRegistrationEnabled);
      }
      if (options?.loginRequired) {
        return this.fulfillJson(route, mockLoginRequiredTrue);
      }
      return this.fulfillJson(route, mockLoginRequired);
    });

    // Mock /api/v2/auth/login
    await this.page.route('**/api/v2/auth/login', (route) => {
      return this.fulfillJson(route, mockLoginResponse);
    });

    // Mock /api/v2/auth/verify
    await this.page.route('**/api/v2/auth/verify', (route) => {
      return this.fulfillJson(route, mockVerifyResponse);
    });

    // Mock /api/v2/auth/refresh
    await this.page.route('**/api/v2/auth/refresh', (route) => {
      return this.fulfillJson(route, mockRefreshResponse);
    });

    // Mock /api/v2/auth/logout
    await this.page.route('**/api/v2/auth/logout', (route) => {
      return this.fulfillJson(route, { success: true });
    });

    // Mock /api/v2/auth/register
    await this.page.route('**/api/v2/auth/register', (route) => {
      return this.fulfillJson(route, mockLoginResponse, 201);
    });
  }

  /**
   * Mock printer endpoints
   */
  async mockPrinterEndpoints(options?: { empty?: boolean }) {
    const printers = options?.empty ? mockPrinterEmpty : mockPrinters;

    // Mock GET /api/v2/printer - list printers
    await this.page.route('**/api/v2/printer', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, printers);
      }
      // POST /api/v2/printer - create printer
      if (route.request().method() === 'POST') {
        const newPrinter = {
          id: printers.length + 1,
          ...JSON.parse(route.request().postData() || '{}'),
          dateAdded: Date.now(),
        };
        return this.fulfillJson(route, newPrinter, 201);
      }
      return route.continue();
    });

    // Mock GET /api/v2/printer/:id - get single printer
    await this.page.route('**/api/v2/printer/*', (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/printer\/(\d+)/);
      if (idMatch && route.request().method() === 'GET') {
        const id = Number.parseInt(idMatch[1]);
        const printer = printers.find((p) => p.id === id);
        if (printer) {
          return this.fulfillJson(route, printer);
        }
        return this.fulfillJson(route, { error: 'Printer not found' }, 404);
      }
      return route.continue();
    });

    // Mock printer state endpoints
    await this.page.route('**/api/v2/printer/*/state', (route) => {
      return this.fulfillJson(route, mockPrinterStates.operational);
    });

    // Mock printer job control endpoints
    await this.page.route('**/api/v2/printer/*/stop-job', (route) => {
      return this.fulfillJson(route, { success: true });
    });

    await this.page.route('**/api/v2/printer/*/pause-job', (route) => {
      return this.fulfillJson(route, { success: true });
    });

    await this.page.route('**/api/v2/printer/*/resume-job', (route) => {
      return this.fulfillJson(route, { success: true });
    });

    // Mock test connection endpoint
    await this.page.route('**/api/v2/printer/*/test-connection', (route) => {
      return this.fulfillJson(route, { success: true, reachable: true });
    });
  }

  /**
   * Mock floor endpoints
   */
  async mockFloorEndpoints(options?: { empty?: boolean }) {
    const floors = options?.empty ? mockFloorsEmpty : mockFloors;

    // Mock GET /api/v2/floor - list floors
    await this.page.route('**/api/v2/floor', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, floors);
      }
      // POST /api/v2/floor - create floor
      if (route.request().method() === 'POST') {
        const newFloor = {
          id: floors.length + 1,
          ...JSON.parse(route.request().postData() || '{}'),
          printers: [],
        };
        return this.fulfillJson(route, newFloor, 201);
      }
      return route.continue();
    });

    // Mock GET /api/v2/floor/:id - get single floor
    await this.page.route('**/api/v2/floor/*', (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/floor\/(\d+)$/);
      if (idMatch && route.request().method() === 'GET') {
        const id = Number.parseInt(idMatch[1]);
        const floor = floors.find((f) => f.id === id);
        if (floor) {
          return this.fulfillJson(route, floor);
        }
        return this.fulfillJson(route, { error: 'Floor not found' }, 404);
      }
      return route.continue();
    });
  }

  /**
   * Mock camera endpoints
   */
  async mockCameraEndpoints(options?: { empty?: boolean }) {
    const cameras = options?.empty ? mockCamerasEmpty : mockCameras;

    // Mock GET /api/v2/camera-stream - list cameras
    await this.page.route('**/api/v2/camera-stream', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, cameras);
      }
      // POST /api/v2/camera-stream - create camera
      if (route.request().method() === 'POST') {
        const newCamera = {
          id: cameras.length + 1,
          ...JSON.parse(route.request().postData() || '{}'),
        };
        return this.fulfillJson(route, newCamera, 201);
      }
      return route.continue();
    });
  }

  /**
   * Mock file endpoints
   */
  async mockFileEndpoints(options?: { empty?: boolean }) {
    const files = options?.empty ? mockFilesEmpty : mockFiles;

    // Mock GET /api/v2/file-storage - list files
    await this.page.route('**/api/v2/file-storage**', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, files);
      }
      return route.continue();
    });

    // Mock file upload
    await this.page.route('**/api/v2/file-storage/upload', (route) => {
      return this.fulfillJson(
        route,
        { success: true, fileId: 'uploaded-file-id' },
        201
      );
    });
  }

  /**
   * Mock print job endpoints
   */
  async mockJobEndpoints(options?: { empty?: boolean }) {
    const jobs = options?.empty ? mockJobsEmpty : mockJobs;

    // Mock GET /api/v2/print-jobs/search-paged - paginated job search (with any query params)
    await this.page.route('**/api/v2/print-jobs/search-paged**', (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const page = Number.parseInt(url.searchParams.get('page') || '1');
        const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '500');

        return this.fulfillJson(route, {
          items: jobs,
          page,
          count: jobs.length,
          pages: Math.ceil(jobs.length / pageSize),
        });
      }
      return route.continue();
    });

    // Mock GET /api/v2/print-job/:id - get job details (register BEFORE the generic list)
    await this.page.route('**/api/v2/print-job/*', (route) => {
      const url = route.request().url();
      // Only match numeric IDs, not "search-paged"
      const idMatch = url.match(/\/print-job\/(\d+)$/);
      if (idMatch && route.request().method() === 'GET') {
        return this.fulfillJson(route, mockJobDetails);
      }
      return route.continue();
    });

    // Mock GET /api/v2/print-job - list jobs (exact match, no query params expected here)
    await this.page.route('**/api/v2/print-job', (route) => {
      const url = route.request().url();
      // Only match exact /print-job, not /print-jobs or /print-job/something
      if (url.endsWith('/print-job') || url.includes('/print-job?')) {
        if (route.request().method() === 'GET') {
          return this.fulfillJson(route, jobs);
        }
      }
      return route.continue();
    });

    // Mock GET /api/v2/print-queue - get print queue (with query params)
    await this.page.route('**/api/v2/print-queue*', (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const page = Number.parseInt(url.searchParams.get('page') || '1');
        const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '50');

        return this.fulfillJson(route, {
          items: mockQueue,
          page,
          pageSize,
          totalCount: mockQueue.length,
          totalPages: Math.ceil(mockQueue.length / pageSize),
        });
      }
      return route.continue();
    });
  }

  /**
   * Mock settings endpoints
   */
  async mockSettingsEndpoints() {
    // Mock GET /api/v2/settings - full settings object
    await this.page.route('**/api/v2/settings', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, {
          server: mockServerSettings,
          wizard: {
            wizardCompleted: true,
            wizardVersion: 1,
            latestWizardVersion: 1,
          },
          frontend: {
            largeTiles: false,
            gridCols: 4,
            gridRows: 3,
            tilePreferCancelOverQuickStop: false,
            gridNameSortDirection: 'horizontal',
          },
          timeout: {
            apiTimeout: 10000,
            apiUploadTimeout: 600000,
          },
        });
      }
      return route.continue();
    });

    // Mock GET /api/v2/settings/server
    await this.page.route('**/api/v2/settings/server', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, mockServerSettings);
      }
      // PATCH /api/v2/settings/server - update settings
      if (route.request().method() === 'PATCH') {
        return this.fulfillJson(route, mockServerSettings);
      }
      return route.continue();
    });

    // Mock user endpoints
    await this.page.route('**/api/v2/user**', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, mockUsers);
      }
      return route.continue();
    });

    // Mock current user endpoint
    await this.page.route('**/api/v2/user/me', (route) => {
      return this.fulfillJson(route, mockCurrentUser);
    });

    // Mock user profile endpoint
    await this.page.route('**/api/v2/user/profile', (route) => {
      return this.fulfillJson(route, mockCurrentUser);
    });
  }

  /**
   * Mock server/system endpoints
   */
  async mockServerEndpoints() {
    // Mock GET /api/v2/test - health check/test endpoint
    await this.page.route('**/api/v2/test', (route) => {
      return this.fulfillJson(route, {
        status: 'ok',
        message: 'API is working',
        timestamp: Date.now(),
      });
    });

    // Mock GET /api/v2/features - feature flags
    await this.page.route('**/api/v2/features', (route) => {
      return this.fulfillJson(route, {
        multiCameraSupport: true,
        experimentalClientSupport: false,
        experimentalMoonrakerSupport: false,
        experimentalPrusaLinkSupport: false,
      });
    });

    // Mock GET /api/v2/server/version
    await this.page.route('**/api/v2/server/version', (route) => {
      return this.fulfillJson(route, {
        version: '2.0.0-mock',
        apiVersion: 'v2',
      });
    });

    // Mock GET /api/v2/server/health
    await this.page.route('**/api/v2/server/health', (route) => {
      return this.fulfillJson(route, {
        status: 'healthy',
        uptime: 123456,
      });
    });
  }

  /**
   * Mock printer tag endpoints
   */
  async mockPrinterTagEndpoints() {
    // Mock GET /api/v2/printer-tag - list all tags
    await this.page.route('**/api/v2/printer-tag', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, [
          { id: 1, name: 'Production', color: '#4CAF50' },
          { id: 2, name: 'Testing', color: '#2196F3' },
          { id: 3, name: 'Maintenance', color: '#FF9800' },
        ]);
      }
      // POST /api/v2/printer-tag - create tag
      if (route.request().method() === 'POST') {
        return this.fulfillJson(route, { id: 4, name: 'New Tag', color: '#9C27B0' }, 201);
      }
      return route.continue();
    });
  }

  /**
   * Mock all endpoints at once with default options
   */
  async mockAllEndpoints(options?: {
    loginRequired?: boolean;
    emptyData?: boolean;
  }) {
    // Register catch-all FIRST so it's matched LAST (Playwright uses LIFO)
    // Catch-all for unmocked API endpoints - log and return generic success
    await this.page.route('**/api/v2/**', (route) => {
      const url = route.request().url();
      const method = route.request().method();
      console.warn(`[Mock] Unmocked API endpoint called: ${method} ${url}`);

      // Return a generic success response
      return this.fulfillJson(route, {
        success: true,
        message: 'Unmocked endpoint - generic response',
      });
    });

    // Register specific endpoints AFTER catch-all so they take precedence
    await this.mockAuthEndpoints({ loginRequired: options?.loginRequired });
    await this.mockServerEndpoints();
    await this.mockSettingsEndpoints();
    await this.mockPrinterEndpoints({ empty: options?.emptyData });
    await this.mockPrinterTagEndpoints();
    await this.mockFloorEndpoints({ empty: options?.emptyData });
    await this.mockCameraEndpoints({ empty: options?.emptyData });
    await this.mockFileEndpoints({ empty: options?.emptyData });
    await this.mockJobEndpoints({ empty: options?.emptyData });
  }

  /**
   * Remove all route mocks
   */
  async unmockAll() {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }
}
