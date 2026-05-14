/// <reference types="vite/client" />
interface ImportMetaEnv {
  // Builtin variables
  readonly BASE_URL: string
  readonly PACKAGE_VERSION: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean

  // Added by us
  readonly VITE_API_BASE: string | undefined
  readonly VITE_SERVER_INSTANCE_LABEL: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
