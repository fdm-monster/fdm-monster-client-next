import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineConfig } from 'vite-plus'
import { fileURLToPath, URL } from 'node:url'
import packageJson from './package.json' with { type: 'json' }
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  lint: {
    options: {
      typeAware: false,
      typeCheck: false
    },
    ignorePatterns: [
      'openapi-ts.config.ts',
      '**/screenshots/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/public/**',
      '**/build/**',
      '**/.git/**',
      '**/.idea/**'
    ]
  },
  fmt: {
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'none',
    singleAttributePerLine: true,
    printWidth: 80,
    sortPackageJson: true,
    ignorePatterns: [
      '**/*.md',
      '**/*.json',
      '**/*.yml',
      'public/**',
      '.all-contributorsrc',
      'src/auto-imports.d.ts',
      'src/backend/generated/**',
      '.idea',
      '.git',
      '.yarn',
      '**/coverage',
      '**/.github',
      '**/docs',
      '**/images',
      '**/node_modules',
      '**/assets',
      '**/dist',
      '**/README.md'
    ]
  },
  // Avoid console jumping around:
  clearScreen: false,
  plugins: [
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
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
      project: 'fdm-monster-client-next',
      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Optionally uncomment the line below to override automatic release name detection
      release: {
        name: packageJson.version
      }
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
  test: {
    globals: true,
    setupFiles: ['./test/setup-axios-mock.ts'],
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/screenshots/**' // Exclude Playwright screenshot tests
    ],
    server: {
      deps: {
        inline: ['vuetify']
      }
    }
  },
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
