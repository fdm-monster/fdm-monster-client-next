// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import packageJson from './package.json'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { splashScreen } from './plugins/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    splashScreen({
      logoSrc: 'vite.svg',
      splashBg: 'rgb(40, 40, 40)',
      loaderType: 'dots',
      loaderBg: 'rgb(155, 5, 5)',
      minTime: 1000
    }),
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
      template: { transformAssetUrls }
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
      project: 'fdm-monster-client',
      // Specify the directory containing build artifacts
      include: './dist',
      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Optionally uncomment the line below to override automatic release name detection
      release: packageJson.version,
      dryRun: !process.env.SENTRY_AUTH_TOKEN?.length
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
  test: {
    globals: true,
    // globalSetup: ["./vitest/setup.ts"],
    setupFiles: ['./test/setup-axios-mock.ts'],
    environment: 'jsdom',
    deps: {
      inline: ['vuetify']
    }
  },
  build: {
    sourcemap: true
  },
  server: {
    port: 3000
  }
})
