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
import { mockFloors, mockFloorsEmpty } from './data/floors.fixtures';
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

    // Mock GET /api/v2/floor/:id - get single floor (must be before generic floor route)
    await this.page.route('**/api/v2/floor/*/**', (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/floor\/(\d+)\//);
      if (idMatch) {
        const id = Number.parseInt(idMatch[1]);

        // Handle floor-specific operations
        if (url.includes('/printer')) {
          // Add/remove printer from floor
          if (route.request().method() === 'POST') {
            const floor = floors.find((f) => f.id === id);
            if (floor) {
              return this.fulfillJson(route, floor);
            }
          }
          if (route.request().method() === 'DELETE') {
            const floor = floors.find((f) => f.id === id);
            if (floor) {
              return this.fulfillJson(route, floor);
            }
          }
        }

        // Handle floor name/order updates
        if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
          const floor = floors.find((f) => f.id === id);
          if (floor) {
            return this.fulfillJson(route, floor);
          }
        }

        // Handle floor GET
        if (route.request().method() === 'GET') {
          const floor = floors.find((f) => f.id === id);
          if (floor) {
            return this.fulfillJson(route, floor);
          }
          return this.fulfillJson(route, { error: 'Floor not found' }, 404);
        }

        // Handle floor DELETE
        if (route.request().method() === 'DELETE') {
          return this.fulfillJson(route, { success: true });
        }
      }
      return route.continue();
    });

    // Mock GET/POST /api/v2/floor/ - list/create floors (generic endpoint)
    await this.page.route('**/api/v2/floor/', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, floors);
      }
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
  }

  /**
   * Mock camera endpoints
   */
  async mockCameraEndpoints(options?: { empty?: boolean }) {
    const cameras = options?.empty ? mockCamerasEmpty : mockCameras;

    // Mock actual camera stream URLs to return a placeholder image
    // This prevents the browser from trying to load real camera streams
    await this.page.route('**://*/webcam/**', (route) => {
      // Return a simple 1x1 gray pixel as PNG
      const grayPixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8w8DwHwAEOQHNmnaaOAAAAABJRU5ErkJggg==',
        'base64'
      );
      return route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: grayPixel,
      });
    });

    // Mock any IP-based camera stream URLs (like http://192.168.1.100/...)
    await this.page.route('**://192.168.*/**', (route) => {
      const grayPixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8w8DwHwAEOQHNmnaaOAAAAABJRU5ErkJggg==',
        'base64'
      );
      return route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: grayPixel,
      });
    });

    // Mock individual camera operations /api/v2/camera-stream/:id (must be before generic route)
    await this.page.route('**/api/v2/camera-stream/*/***', (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/camera-stream\/(\d+)/);

      if (idMatch) {
        const id = Number.parseInt(idMatch[1]);
        const camera = cameras.find((c) => c.id === id);

        if (route.request().method() === 'GET' && camera) {
          return this.fulfillJson(route, camera);
        }

        if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
          if (camera) {
            return this.fulfillJson(route, camera);
          }
        }

        if (route.request().method() === 'DELETE') {
          return this.fulfillJson(route, { success: true });
        }
      }

      return route.continue();
    });

    // Mock GET/POST /api/v2/camera-stream/ - list/create cameras
    await this.page.route('**/api/v2/camera-stream/', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, cameras);
      }
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
    // Register settings routes in LIFO order (generic FIRST, specific LAST)

    // Mock GET /api/v2/settings - full settings object (generic)
    await this.page.route('**/api/v2/settings', (route) => {
      const url = route.request().url();
      // Skip if it's a more specific settings endpoint
      if (url.includes('/settings/')) {
        return route.continue();
      }

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

    // Mock GET /api/v2/settings/sensitive (specific - registered late)
    await this.page.route('**/api/v2/settings/sensitive', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, {
          sentryDiagnosticsEnabled: false,
        });
      }
      return route.continue();
    });

    // Mock GET /api/v2/settings/slicer-api-key (specific - registered late)
    await this.page.route('**/api/v2/settings/slicer-api-key', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, {
          slicerApiKey: 'mock-slicer-api-key-12345',
        });
      }
      return route.continue();
    });

    // Register user routes in reverse order (LIFO - Last In First Out)
    // Most generic routes registered FIRST, specific routes LAST

    // Mock individual user operations (generic)
    await this.page.route('**/api/v2/user/*', (route) => {
      const url = route.request().url();
      // Skip if it's /user/profile, /user/me, or /user/roles (handled by more specific routes)
      if (url.endsWith('/user/profile') || url.endsWith('/user/me') || url.endsWith('/user/roles')) {
        return route.continue();
      }

      const idMatch = url.match(/\/user\/(\d+)$/);
      if (idMatch && route.request().method() === 'GET') {
        const id = Number.parseInt(idMatch[1]);
        const user = mockUsers.find((u) => u.id === id);
        if (user) {
          return this.fulfillJson(route, user);
        }
      }
      return route.continue();
    });

    // Mock user list endpoint
    await this.page.route('**/api/v2/user/', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, mockUsers);
      }
      return route.continue();
    });

    // Mock user roles endpoint (specific)
    await this.page.route('**/api/v2/user/roles', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, [
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'user', description: 'Regular User' },
          { id: 3, name: 'guest', description: 'Guest' },
        ]);
      }
      return route.continue();
    });

    // Mock current user endpoint (more specific)
    await this.page.route('**/api/v2/user/me', (route) => {
      return this.fulfillJson(route, mockCurrentUser);
    });

    // Mock user profile endpoint (most specific - registered LAST, matched FIRST)
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

    // Mock GET /api/v2/version
    await this.page.route('**/api/v2/version', (route) => {
      return this.fulfillJson(route, {
        version: '2.0.0-mock',
        installedAt: 1704067200000,
        updateAvailable: false,
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

    // Mock GET /api/v2/server/github-rate-limit
    await this.page.route('**/api/v2/server/github-rate-limit', (route) => {
      return this.fulfillJson(route, {
        limit: 60,
        remaining: 58,
        reset: Date.now() + 3600000, // 1 hour from now
        used: 2,
      });
    });
  }

  /**
   * Mock printer tag endpoints
   */
  async mockPrinterTagEndpoints() {
    // Mock GET /api/v2/printer-tag - list all tags with printers
    await this.page.route('**/api/v2/printer-tag', (route) => {
      if (route.request().method() === 'GET') {
        return this.fulfillJson(route, [
          {
            id: 1,
            name: 'Production',
            color: '#4CAF50',
            printers: [
              { printerId: 1, tagId: 1 },
              { printerId: 2, tagId: 1 },
            ],
          },
          {
            id: 2,
            name: 'Testing',
            color: '#2196F3',
            printers: [
              { printerId: 3, tagId: 2 },
            ],
          },
          {
            id: 3,
            name: 'Maintenance',
            color: '#FF9800',
            printers: [],
          },
        ]);
      }
      // POST /api/v2/printer-tag - create tag
      if (route.request().method() === 'POST') {
        return this.fulfillJson(
          route,
          {
            id: 4,
            name: 'New Tag',
            color: '#9C27B0',
            printers: [],
          },
          201
        );
      }
      return route.continue();
    });

    // Mock tag operations (update name, color, add/remove printer)
    await this.page.route('**/api/v2/printer-tag/*', (route) => {
      // Return updated tags array for all operations
      return this.fulfillJson(route, [
        {
          id: 1,
          name: 'Production',
          color: '#4CAF50',
          printers: [
            { printerId: 1, tagId: 1 },
            { printerId: 2, tagId: 1 },
          ],
        },
        {
          id: 2,
          name: 'Testing',
          color: '#2196F3',
          printers: [{ printerId: 3, tagId: 2 }],
        },
        {
          id: 3,
          name: 'Maintenance',
          color: '#FF9800',
          printers: [],
        },
      ]);
    });
  }

  /**
   * Mock all endpoints at once with default options
   */
  async mockAllEndpoints(options?: {
    loginRequired?: boolean;
    emptyData?: boolean;
  }) {
    // Playwright uses LIFO (Last In First Out) for route matching
    // Routes registered LAST are matched FIRST
    // So: register catch-all FIRST, specific routes LAST

    // Register catch-all FIRST (will be matched LAST, only if nothing else matched)
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

    // Register specific endpoints LAST (will be matched FIRST, taking precedence)
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
   * Update Socket.IO mock data at runtime (for empty data scenarios)
   */
  async updateSocketIOData(data: any) {
    await this.page.evaluate((newData) => {
      (globalThis as any).__SOCKETIO_MOCK_DATA__ = newData;
    }, data);
  }

  /**
   * Remove all route mocks
   */
  async unmockAll() {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }
}
