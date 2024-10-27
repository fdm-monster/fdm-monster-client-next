import { beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

beforeAll(() => {
  mock.onGet('/api/auth/login-required').reply(200, {
    loginRequired: true
  })
})

afterAll(() => {
  mock.restore() // Restore the original Axios behavior after all tests
})
