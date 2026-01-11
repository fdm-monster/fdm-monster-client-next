import { SocketIoUpdateMessage } from "@/models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "@/store/printer.store";
import { useFloorStore } from "@/store/floor.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useTestPrinterStore } from "@/store/test-printer.store";
import { useSnackbar } from "./snackbar.composable";
import { getBaseUri } from "@/shared/http-client";
import { useAuthStore } from "@/store/auth.store";
import { useTrackedUploadsStore } from "@/store/tracked-uploads.store";
import { io, Socket } from "socket.io-client";
import { reactive } from "vue";
import { useEventBus } from "@vueuse/core";
import { useDebugSocketStore } from "@/store/debug-socket.store";
import { useOverlayStore } from "@/store/overlay.store";

enum IO_MESSAGES {
  Update = "update",
  TestPrinterState = "test-printer-state",
}

let appSocketIO: Socket | null = null;
export const socketState = reactive({
  connected: false,
  setup: false,
  id: "",
  active: false,
});

export class SocketIoService {
  private readonly printerStore = usePrinterStore();
  private readonly floorStore = useFloorStore();
  private readonly printerStateStore = usePrinterStateStore();
  private readonly testPrinterStore = useTestPrinterStore();
  private readonly trackedUploadsStore = useTrackedUploadsStore();
  private readonly debugSocketStore = useDebugSocketStore();
  private readonly appLoaderStore = useOverlayStore();
  private readonly snackbar = useSnackbar();
  private readonly authStore = useAuthStore();

  socketState() {
    if (!appSocketIO) {
      console.debug("Returning default socket state, socket was not set up");
      return { setup: false };
    }

    return {
      setup: true,
      connected: appSocketIO.connected,
      active: appSocketIO.active,
      id: appSocketIO.id,
    };
  }

  async setupSocketConnection() {
    // Skip Socket.IO setup in screenshot/test mode
    if ((window as any).__DISABLE_SOCKETIO__ || (window as any).__SCREENSHOT_MODE__) {
      console.debug("Socket.IO disabled (test/screenshot mode)");
      socketState.setup = true;
      socketState.connected = true;
      socketState.active = true;
      socketState.id = "test-mode-socket";

      // Inject mock Socket.IO data into stores if available
      const mockData = (window as any).__SOCKETIO_MOCK_DATA__;
      if (mockData) {
        this.onMessage(mockData);
      }

      return;
    }

    console.debug("Setting up socket.io client");

    if (socketState.setup) {
      throw new Error("Cant setup socket, socket already created");
    }
    socketState.setup = false;

    const apiBase = await getBaseUri();
    this.authStore.loadTokens();

    appSocketIO = io(apiBase, {
      auth: async (cb) => {
        if (!this.authStore.loginRequired) {
          return cb({});
        }

        try {
          if (this.authStore.isLoginExpired) {
            console.warn("Login expired, attempting to refresh token");
            await this.authStore.refreshLoginToken();
          }

          if (this.authStore.token) {
            cb({ token: this.authStore.token });
          } else {
            console.error("No token available after refresh");
            cb({});
          }
        } catch (err) {
          console.error("Token refresh failed:", err);
          cb({});
        }
      },
    });

    this.setupConnectionHandlers();
    this.registerMessageHandlers();

    socketState.setup = true;
  }

  disconnect() {
    if (!appSocketIO) {
      throw new Error("Cant disconnect socket, socket not created");
    }

    appSocketIO.close();
    appSocketIO = null;
    socketState.setup = false;
    socketState.connected = false;
    socketState.active = false;
    socketState.id = "";
  }

  reconnect() {
    // Skip reconnect in test/screenshot mode
    if ((window as any).__DISABLE_SOCKETIO__ || (window as any).__SCREENSHOT_MODE__) {
      console.debug("Socket.IO reconnect skipped (test/screenshot mode)");
      return;
    }

    if (!appSocketIO) {
      throw new Error("Cant reconnect socket, socket not created");
    }

    console.debug("Resetting socket connection. Previous state:", {
      connected: appSocketIO.connected,
      active: appSocketIO.active,
      id: appSocketIO.id,
    });

    appSocketIO.close();
    appSocketIO.connect();
  }

  onMessage(message: SocketIoUpdateMessage) {
    if (message.trackedUploads.current?.length) {
      this.trackedUploadsStore.setUploads(message?.trackedUploads.current);

      this.trackedUploadsStore.activeUploads.forEach((u) => {
        this.snackbar.openProgressMessage(
          u.correlationToken,
          u.multerFile.originalname,
          (u.progress || 0) * 100,
          u.completed,
        );
      });
    }

    if (message.floors?.length) {
      this.floorStore.saveFloors(message.floors);
    }

    if (message.printers?.length) {
      this.printerStore.setPrinters(message.printers);
    }

    if (message.socketStates) {
      this.printerStateStore.setSocketStates(message.socketStates);
    }

    if (message.printerEvents) {
      this.printerStateStore.setPrinterEvents(message.printerEvents);
    }
  }

  private setupConnectionHandlers() {
    if (!appSocketIO) {
      throw new Error("Cant bind socket events, socket not created");
    }

    appSocketIO.on("connect", () => {
      socketState.id = appSocketIO?.id ?? "";
      socketState.connected = true;
      socketState.active = appSocketIO?.active ?? false;
      console.debug("Socket connected:", socketState.id, "Active:", socketState.active);
      this.appLoaderStore.setServerDisconnected(false);
      this.appLoaderStore.resetRetry();
    });

    appSocketIO.on("disconnect", () => {
      socketState.id = "";
      socketState.connected = false;
      socketState.active = false;
      console.debug("Socket disconnected");
      this.appLoaderStore.setServerDisconnected(true);

      // Trigger backend retry loop
      const retryEventBus = useEventBus('backend:start-retry');
      retryEventBus.emit();
    });

    appSocketIO.on("connect_error", async (error) => {
      console.error("Socket connection error:", error.message);
      if (error.message.includes("Authentication") || error.message.includes("jwt") ||
        error.message.includes("token") || error.message.includes("auth")) {
        console.warn("Possible JWT authentication issue detected");
        try {
          await this.authStore.refreshLoginToken();
          this.reconnect();
        } catch (e) {
          console.error("Error refreshing token");
          this.disconnect();
          await this.authStore.logout();
        }
      } else {
        this.appLoaderStore.setServerDisconnected(true);
      }
    });
  }

  private registerMessageHandlers() {
    if (!appSocketIO) {
      throw new Error("Cant bind socket app events, socket not created");
    }

    // Register catch-all handler for debugging
    appSocketIO.onAny((event, ...args) => {
      this.debugSocketStore.logMessage("in", event, args.length === 1 ? args[0] : args);
    });

    // Register legacy update handler
    appSocketIO.on(IO_MESSAGES.Update, (data) => this.onMessage(data));

    // Register test printer state handler
    appSocketIO.on(IO_MESSAGES.TestPrinterState, (data) => {
      this.testPrinterStore.saveEvent(data);
    });
  }
}
