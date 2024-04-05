/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'

// Types
import type {App} from 'vue'
import {VueQueryPlugin} from "@tanstack/vue-query";

export function registerPlugins(app: App) {
  app
    .use(vuetify)
    .use(VueQueryPlugin)
    .use(router)
    .use(pinia)
}
