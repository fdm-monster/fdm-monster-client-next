import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import packageJson from './package.json'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
// As advised by vite 7 docs, we now use sass-embedded for increased vuetify/sass performance
export default defineConfig({
  // Avoid console jumping around:
  clearScreen: false,
  plugins: [
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      },
      vueTemplate: true
    }),
    // https://github.com/unplugin/unplugin-vue-components
    Components({
      dts: 'src/components.d.ts'
    }),
    Vue({
      template: {transformAssetUrls}
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    }),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      telemetry: false,
      org: 'fdm-monster',
      project: 'fdm-monster-client-next',
      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Optionally uncomment the line below to override automatic release name detection
      release: {
        name: packageJson.version
      },
    }),
    Fonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900'
          }
        ]
      }
    })
  ],
  define: {
    'process.env': {},
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
      '.png',
      '.gif',
      '.css',
      '.scss'
    ]
  },
  build: {
    sourcemap: true
  },
  server: {
    port: 3000
  }
})
