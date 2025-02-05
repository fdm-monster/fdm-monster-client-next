export const isDevEnv = true // process.env.NODE_ENV === 'development'
export const isProdEnv = false // process.env.NODE_ENV === 'production'

export interface AppConstants {
  apiKeyLength: number
  maxPort: number
  maxPrinterNameLength: number
  maxPrinterGroupNameLength: number
  maxPrinterGroupLocationX: number
  maxPrinterGroupLocationY: number
  minPrinterFloorNameLength: number
  minUsernameLength: number
}

export const generateAppConstants = (): Readonly<AppConstants> =>
  Object.freeze({
    apiKeyLength: 43,
    maxPort: 65535,
    maxPrinterNameLength: 25,
    maxPrinterGroupNameLength: 30, // Doesn't exist on backend
    maxPrinterGroupLocationX: 4,
    maxPrinterGroupLocationY: 4,
    minPrinterFloorNameLength: 3,
    minUsernameLength: 3
  }) as Readonly<AppConstants>
