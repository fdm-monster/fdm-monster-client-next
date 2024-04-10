/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly PACKAGE_VERSION: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
