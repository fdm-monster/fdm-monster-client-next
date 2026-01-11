/**
 * Mock data for authentication-related API endpoints
 */

export interface WizardSettingsDto {
  wizardCompleted: boolean;
  wizardVersion: number;
  latestWizardVersion: number;
}

export interface LoginRequiredResponse {
  loginRequired: boolean;
  registration: boolean;
  wizardState: WizardSettingsDto;
  isDemoMode: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

export const mockLoginRequired: LoginRequiredResponse = {
  loginRequired: false,
  registration: false,
  wizardState: {
    wizardCompleted: true,
    wizardVersion: 1,
    latestWizardVersion: 1,
  },
  isDemoMode: false,
};

export const mockLoginRequiredTrue: LoginRequiredResponse = {
  loginRequired: true,
  registration: false,
  wizardState: {
    wizardCompleted: true,
    wizardVersion: 1,
    latestWizardVersion: 1,
  },
  isDemoMode: false,
};

export const mockRegistrationEnabled: LoginRequiredResponse = {
  loginRequired: false,
  registration: true,
  wizardState: {
    wizardCompleted: true,
    wizardVersion: 1,
    latestWizardVersion: 1,
  },
  isDemoMode: false,
};

export const mockLoginRequiredWithWizard: LoginRequiredResponse = {
  loginRequired: false,
  registration: false,
  wizardState: {
    wizardCompleted: false,
    wizardVersion: 0,
    latestWizardVersion: 1,
  },
  isDemoMode: false,
};

export const mockLoginResponse: LoginResponse = {
  token: 'mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  refreshToken: 'mock-refresh-token-abcd1234efgh5678ijkl9012',
};

export const mockVerifyResponse = {
  valid: true,
  userId: 1,
};

export const mockRefreshResponse = {
  token: 'mock-new-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};
