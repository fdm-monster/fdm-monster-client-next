import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup-axios-mock.ts'],
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify'],
      },
    }
  }
}))