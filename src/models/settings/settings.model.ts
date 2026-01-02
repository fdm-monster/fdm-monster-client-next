import { ServerSettingsDto } from './server-settings.dto'

export interface FrontendSettings {
  largeTiles: boolean
  gridCols: number
  gridRows: number
  tilePreferCancelOverQuickStop: boolean
}

export interface ConnectionInfo {
  clientIp: string
  version: string
}

export interface TimeoutSettings {
  apiTimeout: number
  apiUploadTimeout: number
}

export interface WizardSettingsDto {
  wizardCompleted: boolean
  wizardVersion: number
  latestWizardVersion: number
}

export interface SettingsDto {
  server: ServerSettingsDto
  wizard: WizardSettingsDto
  frontend: FrontendSettings
  timeout: TimeoutSettings
  connection?: ConnectionInfo
}

export interface CredentialSettingsDto {
  jwtExpiresIn: number
  refreshTokenAttempts: number
  refreshTokenExpiry: number
}

export interface ServerSettingsSensitiveDto {
  experimentalMoonrakerSupport: boolean
  experimentalPrusaLinkSupport: boolean
  experimentalThumbnailSupport: boolean
}

export interface SettingsSensitiveDto {
  server: ServerSettingsSensitiveDto
  credentials: CredentialSettingsDto
}
