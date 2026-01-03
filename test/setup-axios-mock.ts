import { beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

// Mock ResizeObserver for Vuetify components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  mock.onGet('/api/v2/auth/login-required').reply(200, {
    loginRequired: true
  })
})

afterAll(() => {
  mock.restore() // Restore the original Axios behavior after all tests
})
