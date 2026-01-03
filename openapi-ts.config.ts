import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://localhost:4000/api-docs/swagger.json',
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

