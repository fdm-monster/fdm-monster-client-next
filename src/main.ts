/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import {registerPlugins} from '@/plugins'

// Components
import App from './App.vue'

// Composables
import {createApp} from 'vue'

// console.log(
//   `[DEV: ${import.meta.env.DEV}][PROD: ${import.meta.env.PROD}]`,
//   import.meta.env.PACKAGE_VERSION
// );

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
