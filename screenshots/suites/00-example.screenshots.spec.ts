import { test, expect } from '../fixtures/test-fixtures';
import { captureFullPage } from '../utils';
import { createNavigationHelper } from '../helpers/navigation.helper';

/**
 * Example Screenshot Test
 * A single, complete example showing the full workflow
 */
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

  // Done! Screenshot saved to screenshots/output/examples/example-dashboard.png
});
