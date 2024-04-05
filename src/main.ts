// Plugins
import {registerPlugins} from '@/plugins'

// Components
import App from './App.vue'

// Composables
import {createApp} from 'vue'
import {AxiosError} from "axios";
import {useSnackbar} from "./shared/snackbar.composable";
import {captureException} from "@sentry/vue";
import {registerFileDropDirective} from "./directives/file-upload.directive";
import {registerPrinterPlaceDirective} from "./directives/printer-place.directive";

// console.log(
//   `[DEV: ${import.meta.env.DEV}][PROD: ${import.meta.env.PROD}]`,
//   import.meta.env.PACKAGE_VERSION
// );

const app = createApp(App)

registerFileDropDirective(app);
registerPrinterPlaceDirective(app);

app.config.errorHandler = (err: unknown) => {
  if (err instanceof AxiosError) {
    console.error(
      `An error was caught [${err.name}]:\n ${err.message}\n ${err.config?.url}\n${err.stack}`
    );
    useSnackbar().openErrorMessage({
      title: "An error occurred",
      subtitle: err.message,
      timeout: 5000,
    });
    return;
  } else {
    console.error(`An error was caught [${err.name}]:\n ${err.message}\n ${err.stack}`);
  }
  useSnackbar().openErrorMessage({
    title: "An error occurred",
    subtitle: err.message,
    timeout: 5000,
  });

  captureException(err);
};

registerPlugins(app)

app.mount('#app')
