import { ServerSettingsDto } from './server-settings.dto'
import { FileCleanSettings } from './printer-file-clean-settings.model'

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
  printerFileClean: FileCleanSettings
  timeout: TimeoutSettings
  connection?: ConnectionInfo
}

export interface CredentialSettingsDto {
  jwtExpiresIn: number
  refreshTokenAttempts: number
  refreshTokenExpiry: number
}

export interface ServerSettingsSensitiveDto {
  experimentalTypeormSupport: boolean
  experimentalMoonrakerSupport: boolean
  experimentalPrusaLinkSupport: boolean
  experimentalClientSupport: boolean
  experimentalThumbnailSupport: boolean
}

export interface SettingsSensitiveDto {
  server: ServerSettingsSensitiveDto
  credentials: CredentialSettingsDto
}
