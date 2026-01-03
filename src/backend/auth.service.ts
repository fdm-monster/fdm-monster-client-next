import { getHttpClient } from '@/shared/http-client'
import { WizardSettingsDto } from '@/models/settings/settings.model'

export interface Tokens {
  token: string
  refreshToken: string
}

export interface LoginRequiredResponse {
  loginRequired: boolean
  registration: boolean
  wizardState: WizardSettingsDto
  isDemoMode: boolean
}

export class AuthService {
  static async getLoginRequired() {
    const httpClient = await getHttpClient(false, false)
    return await httpClient.get<LoginRequiredResponse>(
      '/api/v2/auth/login-required'
    )
  }

  static async postLogin(username: string, password: string) {
    const httpClient = await getHttpClient(false, false)
    return await httpClient.post<Tokens>('/api/v2/auth/login', {
      username,
      password
    })
  }

  static async logout() {
    const httpClient = await getHttpClient(true, false)
    return await httpClient.post('/api/v2/auth/logout')
  }

  static async refreshLogin(refreshToken: string) {
    const httpClient = await getHttpClient(false, false)
    return await httpClient.post<{
      token: string
    }>('/api/v2/auth/refresh', { refreshToken })
  }

  static async verifyLogin() {
    const httpClient = await getHttpClient(true, false)
    return await httpClient.post('/api/v2/auth/verify')
  }

  static async registerAccount(username: string, password: string) {
    const httpClient = await getHttpClient(true, false)
    return await httpClient.post('/api/v2/auth/register', {
      username,
      password
    })
  }
}
