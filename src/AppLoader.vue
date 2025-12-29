<template>
  <!-- Shows Vue router content -->
  <slot v-if="!appLoaderStore.overlay"/>

  <v-overlay
    v-model="appLoaderStore.overlay"
    :scrim="scrimColor"
    opacity="0.98"
    persistent
    no-click-animation
    class="align-center justify-center"
  >
    <!-- Loading State -->
    <AppLoadingMessage/>

    <!-- Server Disconnected State -->
    <ServerDisconnectedMessage/>

    <!-- Error State (token refresh failed) -->
    <ErrorStateMessage/>
  </v-overlay>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onUnmounted } from 'vue'
import { useEventBus } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { captureException } from '@sentry/vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from './store/auth.store'
import { useOverlayStore } from './store/overlay.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useSettingsStore } from '@/store/settings.store'
import { setSentryEnabled } from '@/utils/sentry.util'
import { useFeatureStore } from '@/store/features.store'
import { useProfileStore } from '@/store/profile.store'
import { sleep } from '@/utils/time.utils'
import { RouteNames } from '@/router/route-names'
import { AppService } from '@/backend/app.service'
import {
  AUTH_ERROR_REASON,
  PermissionDeniedEvent
} from '@/shared/auth.constants'
import { SocketIoService } from '@/shared/socketio.service'
import AppLoadingMessage from "@/components/Generic/Loaders/AppLoadingMessage.vue";
import ServerDisconnectedMessage from "@/components/Generic/Loaders/ServerDisconnectedMessage.vue";
import ErrorStateMessage from "@/components/Generic/Loaders/ErrorStateMessage.vue";

const authStore = useAuthStore();
const appLoaderStore = useOverlayStore();
const settingsStore = useSettingsStore();
const featureStore = useFeatureStore();
const profileStore = useProfileStore();
const router = useRouter();
const snackbar = useSnackbar();
const socketIoClient: SocketIoService = new SocketIoService();

const theme = useTheme()
const scrimColor = computed(() => theme.current.value.colors.background)
const RETRY_DELAY_MS = 5000 // 5 seconds between retries
let retryIntervalId: NodeJS.Timeout | null = null

function setOverlay(overlayEnabled: boolean, message: string = '') {
  if (overlayEnabled) {
    appLoaderStore.setOverlay(true, message)
    appLoaderStore.clearError()
  } else {
    appLoaderStore.hideOverlay()
  }
}

async function testConnection() {
  appLoaderStore.setTestingConnection(true)
  try {
    await AppService.test()
    console.log('[AppLoader] Backend connection successful, reloading page')
    stopRetryLoop()
    appLoaderStore.resetRetry()
    globalThis.location.reload()
  } catch (e) {
    console.log(`[AppLoader] Retry attempt failed`, e)
    appLoaderStore.setTestingConnection(false)
    appLoaderStore.incrementRetry(RETRY_DELAY_MS)
  }
}

function retryBackendConnection() {
  console.log('[AppLoader] Starting retry loop')

  // Clear any existing interval
  stopRetryLoop()

  // Check every 100ms if it's time to retry
  retryIntervalId = globalThis.setInterval(async () => {
    const nextRetryTime = appLoaderStore.nextRetryTime || 0
    if (Date.now() >= nextRetryTime && nextRetryTime > 0) {
      console.log(`[AppLoader] Retry attempt at ${ Date.now() }`)
      // Set nextRetryTime to 0 to prevent multiple simultaneous tests
      appLoaderStore.nextRetryTime = 0
      await testConnection()
    }
  }, 100)
}

function stopRetryLoop() {
  if (!retryIntervalId !== null) {
    return
  }
  
  console.log('[AppLoader] Stopping retry loop')
  clearInterval(retryIntervalId)
  retryIntervalId = null
}

async function loadAppWithAuthenticationReady() {
  try {
    await settingsStore.loadSettings()
    await featureStore.loadFeatures()
    await profileStore.getProfile()

    const enabled = settingsStore.serverSettings?.sentryDiagnosticsEnabled
    setSentryEnabled(!!enabled)
  } catch (e) {
    console.log('Error when loading settings.', e)
    snackbar.openErrorMessage({
      title: 'Error',
      subtitle: 'Error when loading settings, features and/or profile.'
    })
    captureException(e)
  }

  if (socketIoClient.socketState().setup) {
    socketIoClient.reconnect()
  } else {
    await socketIoClient.setupSocketConnection()
  }

  setOverlay(false)
}

// In use (shared/http-client.ts)
const authPermissionDeniedKey = useEventBus<PermissionDeniedEvent>(
  'auth:permission-denied'
)
authPermissionDeniedKey.on(async (event) => {
  console.log('[AppLoader] Permission denied, going to permission denied page')
  setOverlay(true, 'Permission denied')
  await router.push({
    name: RouteNames.PermissionDenied,
    query: {
      roles: event?.roles,
      page: String(router.currentRoute.value.name),
      permissions: event?.permissions,
      error: event?.error,
      url: event?.url
    }
  })
  setOverlay(false)
})

// In use (shared/http-client.ts)
const authFailKey = useEventBus('auth:failure')
authFailKey.on(async (event: any) => {
  console.debug(
    `[AppLoader] Event received: 'auth:failure', going back to login, context: ${ event }`
  )
  setOverlay(true, 'Authentication failed, going back to login')

  if (router.currentRoute.value.name !== RouteNames.Login) {
    await router.push({ name: RouteNames.Login })
  }
  setOverlay(false)
})

// In use (components/Login/LoginForm.vue)
const loginEventKey = useEventBus('auth:login')
loginEventKey.on(async () => {
  console.debug("[AppLoader] Event received: 'auth:login', loading app")
  setOverlay(true, 'Loading app')
  await loadAppWithAuthenticationReady()
})

// Emitted by auth.store.ts handleAndEmitAuthenticationError
const accountNotVerifiedEventKey = useEventBus(
  `auth:${ AUTH_ERROR_REASON.AccountNotVerified }`
)
accountNotVerifiedEventKey.on(async () => {
  console.debug(
    `[AppLoader] Event received: 'auth:${ AUTH_ERROR_REASON.AccountNotVerified }', going to login`
  )
  snackbar.error(
    'Account not verified, please ask an administrator to verify your account.'
  )
  setOverlay(
    true,
    'Account not verified, please ask an administrator to verify your account.'
  )
  if (router.currentRoute.value.name !== RouteNames.Login) {
    await router.push({ name: RouteNames.Login })
  }
  setOverlay(false)
})

// Emitted by auth.store.ts handleAndEmitAuthenticationError
const passwordChangeRequiredEventKey = useEventBus(
  `auth:${ AUTH_ERROR_REASON.PasswordChangeRequired }`
)
passwordChangeRequiredEventKey.on(async () => {
  console.debug(
    `[AppLoader] Event received: 'auth:${ AUTH_ERROR_REASON.PasswordChangeRequired }', going to login`
  )
  snackbar.error('Password change required, please change your password.')
  setOverlay(true, 'Password change required, please change your password.')
  if (router.currentRoute.value.name !== RouteNames.Login) {
    await router.push({ name: RouteNames.Login })
  }
  setOverlay(false)
})

// Emitted by socketio.service.ts when socket disconnects
const backendRetryEventKey = useEventBus('backend:start-retry')
backendRetryEventKey.on(() => {
  console.debug('[AppLoader] Event received: backend:start-retry, starting retry loop')
  appLoaderStore.startRetry(RETRY_DELAY_MS)
  retryBackendConnection()
})

onUnmounted(() => {
  stopRetryLoop()

  if (!socketIoClient.socketState().setup) {
    return
  }

  socketIoClient.disconnect()
})

onBeforeMount(async () => {
  appLoaderStore.setLoading(true)
  const loadingMessages = [
    'Loading FDM Monster',
    'Loading it all',
    'Loading features',
    'Loading what needs to be loaded',
    'Farming potatoes',
    'Wiping the floor',
    'Cleaning cobwebs',
    'Loading filament.dll',
    'Loading 3D_printer.exe',
    'Loading spools',
    'Forking PrusaSlicer',
    'Filling progress bar',
    'Eating printed spaghetti'
  ]

  const message =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  setOverlay(true, message)

  try {
    await AppService.test();
  } catch (e) {
    appLoaderStore.setServerDisconnected(true);
    captureException(e);
    appLoaderStore.startRetry(5000);
    await retryBackendConnection();
    return;
  }

  // If the route is wrong about login requirements, an error will be shown
  const { loginRequired, wizardState } =
    await authStore.checkAuthenticationRequirements()
  if (!wizardState.wizardCompleted) {
    console.debug('[AppLoader] Wizard not completed, going to wizard')
    await authStore.logout(false)
    if (router.currentRoute.value.name !== RouteNames.FirstTimeSetup) {
      await router.replace({ name: RouteNames.FirstTimeSetup })
    }
    setOverlay(false)
    return
  }

  // Login is not required, load app directly
  if (!loginRequired) {
    console.debug('[AppLoader] Login not required, loading app')
    return await loadAppWithAuthenticationReady()
  }

  // Router will have tackled routing already
  console.debug('[AppLoader] Checking if tokens are present')
  if (!authStore.hasAuthToken && !authStore.hasRefreshToken) {
    console.debug(
      '[AppLoader] No tokens present, hiding overlay as router will have handled it'
    )
    return setOverlay(false)
  }

  // What if refreshToken is not present or not valid?
  setOverlay(true, 'Refreshing login')
  console.debug('[AppLoader] Verifying or refreshing login once')
  try {
    const { success, handled } =
      await authStore.verifyOrRefreshLoginOnceOrLogout()
    if (handled) {
      console.debug('[AppLoader] received handled event, hiding overlay')
      return
    }

    if (!success) {
      console.debug('[AppLoader] No success refreshing')
      setOverlay(true, 'Login expired, going back to login')

      await sleep(500)
      if (router.currentRoute.value.name !== RouteNames.Login) {
        await router.push({ name: RouteNames.Login })
      }
      setOverlay(false)
      // Don't load app as it will be redirected to login
      return
    }
  } catch (e) {
    console.log('[AppLoader] Error when refreshing login', e)
    appLoaderStore.setLoading(false)
    appLoaderStore.setError(
      (e as AxiosError).message,
      (e as AxiosError).config?.url,
      (e as AxiosError).response?.data
    )
    captureException(e)
    return
  }

  await loadAppWithAuthenticationReady()
})
</script>
