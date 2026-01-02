export const isDevEnv = true // process.env.NODE_ENV === 'development'
export const isProdEnv = false // process.env.NODE_ENV === 'production'

export interface AppConstants {
  apiKeyLength: number
  maxPrinterNameLength: number
  minFloorNameLength: number
  minUsernameLength: number
}

export const appConstants: Readonly<AppConstants> = Object.freeze({
  apiKeyLength: 43,
  maxPrinterNameLength: 25,
  minFloorNameLength: 3,
  minUsernameLength: 3
}) as Readonly<AppConstants>

