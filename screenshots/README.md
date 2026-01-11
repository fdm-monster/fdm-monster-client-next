# FDM Monster Screenshot Automation

Automated screenshot generation for FDM Monster documentation using Playwright.

## Overview

This directory contains a focused e2e screenshot automation system for generating documentation screenshots. The system:

- **Chrome-only**: Focuses on desktop Chrome (1920x1080) for consistency
- **API Mocking**: All backend API calls are mocked using Playwright route interception
- **No Backend Required**: Screenshots can be generated without running the FDM Monster backend
- **Headed Mode Support**: Run tests with visible browser for debugging
- **Organized Suites**: Tests organized by feature area for easy maintenance

## Quick Start

### 1. Install Chromium

```bash
yarn playwright:install-chromium
```

### 2. Run Screenshot Tests

```bash
# Run single example test (recommended for first try)
yarn screenshots:example

# Run with visible browser to see it in action
yarn screenshots:example --headed

# Run all screenshot tests (headless)
yarn screenshots

# Run with Playwright UI (interactive mode)
yarn screenshots:ui
```

### 3. View Screenshots

Screenshots are saved to `screenshots/output/` organized by feature:
- `auth/` - Login, registration, first-time setup
- `dashboard/` - Dashboard views
- `printer-grid/` - Printer grid screenshots
- etc.

## Directory Structure

```
screenshots/
├── playwright.screenshots.config.ts    # Chrome-only configuration
├── fixtures/                           # API mocking layer
│   ├── api-mock.ts                    # Route interception class
│   ├── test-fixtures.ts               # Custom Playwright fixtures
│   └── data/                          # Mock response data
│       ├── auth.fixtures.ts
│       ├── printers.fixtures.ts
│       ├── floors.fixtures.ts
│       ├── cameras.fixtures.ts
│       ├── files.fixtures.ts
│       ├── jobs.fixtures.ts
│       └── settings.fixtures.ts
├── helpers/                            # UI interaction helpers
│   ├── dialog.helper.ts               # Dialog/modal interactions
│   ├── form.helper.ts                 # Form filling utilities
│   └── navigation.helper.ts           # Navigation helpers
├── suites/                             # Test suites by feature
│   ├── 00-example.screenshots.spec.ts # Simple example to get started
│   ├── 01-auth.screenshots.spec.ts
│   ├── 02-dashboard.screenshots.spec.ts
│   └── ... (more suites to be added)
├── utils.ts                            # Screenshot utilities
├── output/                             # Generated screenshots (gitignored)
└── README.md                           # This file
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn screenshots` | Run all screenshot tests (headless) |
| `yarn screenshots:headed` | Run with visible browser window |
| `yarn screenshots:debug` | Run in debug mode with Playwright Inspector |
| `yarn screenshots:ui` | Open Playwright UI for interactive testing |
| `yarn screenshots:chrome` | Explicitly run Chrome project only |
| `yarn screenshots:example` | Run single example test (great for testing setup) |
| `yarn screenshots:auth` | Run authentication suite (login, register, first-time setup) |
| `yarn screenshots:dashboard` | Run dashboard suite |
| `yarn screenshots:printer-grid` | Run printer grid suite (grid views, creating floor/printer, drag operations) |
| `yarn screenshots:printer-list` | Run printer list suite (list view, attaching floor/camera/tag) |
| `yarn screenshots:cameras` | Run camera grid suite |
| `yarn screenshots:jobs` | Run print jobs suite (jobs list, job details dialog) |
| `yarn screenshots:queue` | Run queue suite |
| `yarn screenshots:files` | Run files suite (file browser, upload, operations) |
| `yarn screenshots:settings` | Run settings suite (all settings pages) |
| `yarn screenshots:dialogs` | Run panels and dialogs suite (YAML import/export, menus, dialogs) |
| `yarn screenshots:ci` | Run in CI mode (expects dev server running separately) |

## Writing Screenshot Tests

### Basic Test Structure

See `suites/00-example.screenshots.spec.ts` for a complete working example. Here's the pattern:

```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

test('example-dashboard-screenshot', async ({ authenticatedPage, apiMock }) => {
  // 1. Mock all API endpoints with default data
  await apiMock.mockAllEndpoints({ loginRequired: false });

  // 2. Navigate to the page you want to capture
  const nav = createNavigationHelper(authenticatedPage);
  await nav.goToDashboard();

  // 3. Wait for content to load
  await authenticatedPage.waitForSelector('main, [data-testid="dashboard"]', {
    timeout: 5000,
  }).catch(() => {});

  // 4. Optional: wait a bit more for animations/dynamic content
  await authenticatedPage.waitForTimeout(1000);

  // 5. Capture the screenshot
  await captureFullPage(authenticatedPage, 'example-dashboard.png', 'examples');
});
```

**Run this example:**
```bash
yarn screenshots:example --headed
```

### Using Fixtures

The test suite provides custom fixtures:

- **`apiMock`** - API mocking instance for route interception
- **`authenticatedPage`** - Pre-authenticated page with mocked auth tokens
- **`mockPrinters`**, **`mockFloors`**, etc. - Access to mock data

Example:

```typescript
test('example-test', async ({ authenticatedPage, apiMock, mockPrinters }) => {
  // Mock printer endpoints with custom data
  await apiMock.mockPrinterEndpoints();

  // mockPrinters contains the default mock printer data
  console.log(`Testing with ${mockPrinters.length} printers`);

  // authenticatedPage is already authenticated
  await authenticatedPage.goto('/printers');
});
```

### Using Helpers

#### Navigation Helper

```typescript
import { createNavigationHelper } from '../helpers/navigation.helper';

const nav = createNavigationHelper(page);
await nav.goToDashboard();
await nav.goToPrinterGrid();
await nav.goToSettings('server');
```

#### Dialog Helper

```typescript
import { createDialogHelper } from '../helpers/dialog.helper';

const dialog = createDialogHelper(page);
await dialog.waitForDialog();
await dialog.submitDialog();
await dialog.closeDialog();
```

#### Form Helper

```typescript
import { createFormHelper } from '../helpers/form.helper';

const form = createFormHelper(page);
await form.fillPrinterForm({
  name: 'Test Printer',
  printerURL: 'http://192.168.1.100',
  apiKey: 'test-key'
});
await form.fillLoginForm('username', 'password');
```

## API & WebSocket Mocking

### Automatic SocketIO Mocking

**All tests automatically disable Socket.IO connections** to prevent "server disconnected" messages. This is handled transparently by the test fixtures - no additional setup needed!

The approach:
- Sets `window.__DISABLE_SOCKETIO__` and `window.__SCREENSHOT_MODE__` flags before page loads
- App code checks these flags and skips Socket.IO setup entirely (see `src/shared/socketio.service.ts`)
- Blocks Socket.IO polling endpoints at network level as fallback
- Hides any "Server Disconnected" UI messages that might appear
- Prevents connection errors and retry loops completely

### Mock All API Endpoints

```typescript
test('example', async ({ page, apiMock }) => {
  // Mock all endpoints with default data
  await apiMock.mockAllEndpoints();

  // Or with options
  await apiMock.mockAllEndpoints({
    loginRequired: true,
    emptyData: true,
  });
});
```

### Mock Specific Endpoints

```typescript
test('example', async ({ page, apiMock }) => {
  // Mock only auth endpoints
  await apiMock.mockAuthEndpoints({ loginRequired: true });

  // Mock only printer endpoints
  await apiMock.mockPrinterEndpoints({ empty: false });

  // Mock floor endpoints
  await apiMock.mockFloorEndpoints();
});
```

### Customize Mock Data

Edit fixture files in `fixtures/data/` to customize mock responses:

- `auth.fixtures.ts` - Authentication responses
- `printers.fixtures.ts` - Printer data and states
- `floors.fixtures.ts` - Floor layouts
- `cameras.fixtures.ts` - Camera streams
- `files.fixtures.ts` - File listings
- `jobs.fixtures.ts` - Print jobs and queue
- `settings.fixtures.ts` - Server and user settings

## Screenshot Utilities

Located in `utils.ts`:

```typescript
// Full page screenshot
await captureFullPage(page, 'filename.png', 'subdirectory');

// Viewport screenshot (above the fold)
await captureViewport(page, 'filename.png', 'subdirectory');

// Element screenshot
await captureElement(page, '[data-testid="element"]', 'filename.png', 'subdirectory');

// Wait for page to be ready (network idle + animations)
await waitForPageReady(page, 1000);
```

## Debugging

### Run in Headed Mode

See the browser in action:

```bash
yarn screenshots:headed
```

### Use Playwright UI

Interactive mode with time-travel debugging:

```bash
yarn screenshots:ui
```

### Debug Specific Test

Step through a specific test:

```bash
yarn screenshots:debug suites/01-auth
```

### View Playwright Report

After a test run:

```bash
npx playwright show-report screenshots/playwright-report
```

## CI/CD Integration

### Run in CI

The `screenshots:ci` script expects the dev server to be running separately:

```bash
# Terminal 1: Start dev server
yarn dev

# Terminal 2: Run screenshot tests
yarn screenshots:ci
```

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: yarn install

- name: Install Chromium
  run: npx playwright install --with-deps chromium

- name: Start dev server and run screenshots
  run: |
    yarn dev &
    npx wait-on http://localhost:3000
    yarn screenshots:ci

- name: Upload screenshots
  uses: actions/upload-artifact@v4
  with:
    name: documentation-screenshots
    path: screenshots/output/
```

## Best Practices

1. **Naming Convention**: Use descriptive filenames like `printer-grid-with-printers.png`
2. **Organize by Feature**: Save screenshots to appropriate subdirectories
3. **Wait for Content**: Always wait for content to load before capturing
4. **Mock Consistently**: Use the same mock data across related tests
5. **Test Independence**: Each test should be self-contained and not depend on others
6. **Numbered Tests**: Prefix test names with numbers for execution order clarity

## Troubleshooting

### "Server disconnected" messages appear

This should be automatically handled by SocketIO mocking in the test fixtures. If you still see these messages:

1. Verify you're using the custom `test` from `../fixtures/test-fixtures`
2. Check browser console for: `[Mock] Socket.IO disabled via test flags`
3. Ensure the page fixture is being used (it applies SocketIO mocking automatically)
4. Verify the app code has the test flag checks in `src/shared/socketio.service.ts`

### Screenshots are blank or show loading spinners

Ensure you're waiting for content to load:

```typescript
await page.waitForSelector('[data-testid="content"]');
await waitForPageReady(page);
```

### API calls are not being mocked

Verify mocking is set up before navigation:

```typescript
// Mock BEFORE navigating
await apiMock.mockAllEndpoints();
await page.goto('/path');
```

### Dialog not found

Dialogs may use different selectors. Check the helper or use a custom selector:

```typescript
await dialog.waitForDialog('.custom-dialog-class');
```

### Tests fail on CI but pass locally

Check that:
- Dev server is running in CI
- Network timeout settings are appropriate
- Mock data is consistent

## Future Enhancements

- Responsive testing (mobile/tablet viewports)
- Visual regression testing (screenshot comparison)
- Real backend integration (optional Docker support)
- Mock printer containers (OctoPrint simulators)
- WebSocket mocking for real-time updates
- Light/dark theme variations

## Coverage Summary

All test suites have been implemented covering all pages and features from `screenshots.md`:

### Completed Suites

- ✅ **00-example** - Simple working example for testing setup
- ✅ **01-auth** - Login, registration, first-time setup wizard (5 tests)
- ✅ **02-dashboard** - Dashboard views with stats (4 tests)
- ✅ **03-printer-grid** - Grid views, creating floor/printer, drag operations, batch bar, context menus (7 tests)
- ✅ **04-printer-list** - List view, creating printer, attaching floor/camera/tag (8 tests)
- ✅ **05-camera-grid** - Camera grid, creating camera, fullscreen view (6 tests)
- ✅ **06-print-jobs** - Jobs list, job details dialog, filtering by status (7 tests)
- ✅ **07-queue** - Queue view, reordering, context menus (5 tests)
- ✅ **08-files** - File browser, upload, grid/list views, file operations (8 tests)
- ✅ **09-settings** - All settings pages: overview, floors, printer, emergency commands, server protection, user management, account, software upgrade, diagnostics, experimental, slicer, debug socket, about (13 tests)
- ✅ **10-panels-dialogs** - YAML import/export, OctoFarm import, menus, printer dialogs (create, update, duplicate, test connection, type dropdown, force save), edit floor, delete confirmation (13 tests)

**Total: 76 screenshot tests covering all pages and dialogs**

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Screenshots Guide](https://playwright.dev/docs/screenshots)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## License

AGPL-3.0-or-later
