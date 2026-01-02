import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.json',
  output: {
    path: './src/backend/generated',
    format: 'prettier',
    lint: 'eslint',
  },
  client: {
    name: '@hey-api/client-axios',
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
    {
      name: '@hey-api/sdk',
      asClass: true,
    },
  ],
})

