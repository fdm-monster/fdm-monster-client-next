import App from '@/App.vue'
import router from './router'
import { registerPlugins } from '@/plugins'
import * as Sentry from '@sentry/vue'
import { createApp } from 'vue'
import { AxiosError } from 'axios'
import { useSnackbar } from './shared/snackbar.composable'
import {
  browserTracingIntegration,
  captureException,
  replayIntegration
} from '@sentry/vue'
import { getFileDropDirective } from './directives/file-upload.directive'
import { getDropPrinterPositionDirective } from './directives/printer-drop-position.directive'
import { generateAppConstants } from '@/shared/app.constants'

const app = createApp(App)

console.log(
  `[DEV: ${import.meta.env.DEV}][PROD: ${import.meta.env.PROD}]`,
  import.meta.env.PACKAGE_VERSION
)

Sentry.init({
  app,
  dsn: 'https://f64683e8d1cb4ac291434993cff1bf9b@o4503975545733120.ingest.sentry.io/4503975546912768',
  integrations: [
    browserTracingIntegration({
      router
    }),
    replayIntegration()
  ],
  release: import.meta.env.PACKAGE_VERSION,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production', // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0, // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

app.config.errorHandler = (err: AxiosError | any) => {
  if (err instanceof AxiosError) {
    console.error(
      `An error was caught [${err.name}]:\n ${err.message}\n ${err.config?.url}\n${err.stack}`
    )
    useSnackbar().openErrorMessage({
      title: 'An error occurred',
      subtitle: err.message,
      timeout: 5000
    })
    return
  } else {
    console.error(
      `An error was caught [${err.name}]:\n ${err.message}\n ${err.stack}`
    )
  }
  useSnackbar().openErrorMessage({
    title: 'An error occurred',
    subtitle: err.message,
    timeout: 5000
  })

  captureException(err)
}

app.directive('drop-upload', getFileDropDirective())
app.directive('drop-printer-position', getDropPrinterPositionDirective())

registerPlugins(app)
app.provide('appConstants', generateAppConstants())
app.use(router)
app.mount('#app')
