import { Page } from '@playwright/test';

/**
 * Mock SocketIO to prevent "server disconnected" messages
 * Sets flags that the app checks to skip Socket.IO setup entirely
 * Also injects Socket.IO update data into stores
 */
export async function mockSocketIO(page: Page, data?: any): Promise<void> {
  // Set test mode flags AND inject Socket.IO data BEFORE page loads
  await page.addInitScript((mockData) => {
    (window as any).__DISABLE_SOCKETIO__ = true;
    (window as any).__SCREENSHOT_MODE__ = true;

    // Store mock data to be consumed by stores
    if (mockData) {
      (window as any).__SOCKETIO_MOCK_DATA__ = mockData;
    }
  }, data);

  // Block any Socket.IO network requests as a fallback (should not happen now)
  await page.route('**/socket.io/**', (route) => {
    console.warn('[Mock] Unexpected Socket.IO request blocked:', route.request().url());
    route.abort('blockedbyclient');
  });

  // Hide "Server Disconnected" messages if they somehow appear
  await page.addInitScript(() => {
    const hideDisconnectedMessages = () => {
      const cards = document.querySelectorAll('.v-card');
      cards.forEach((card) => {
        const text = card.textContent || '';
        if (text.includes('Server Disconnected') || text.includes('Cannot connect to FDM Monster')) {
          (card as HTMLElement).style.display = 'none';
        }
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideDisconnectedMessages);
    } else {
      hideDisconnectedMessages();
    }

    const observer = new MutationObserver(hideDisconnectedMessages);
    const startObserving = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        setTimeout(startObserving, 10);
      }
    };
    startObserving();
  });
}

/**
 * Mock SocketIO with simulated data updates
 */
export async function mockSocketIOWithData(
  page: Page,
  data?: {
    printers?: any[];
    floors?: any[];
    socketStates?: any;
    printerEvents?: any;
    trackedUploads?: any;
  }
): Promise<void> {
  await mockSocketIO(page);

  if (data) {
    await page.addInitScript((mockData) => {
      (window as any).__MOCK_SOCKETIO_DATA__ = mockData;
    }, data);
  }
}
