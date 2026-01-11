/**
 * Mock data for settings-related API endpoints
 */

export interface ServerSettings {
  sentryDiagnosticsEnabled: boolean;
  whitelistEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
}

export interface User {
  id: number;
  username: string;
  isRootUser: boolean;
  isVerified: boolean;
  needsPasswordChange: boolean;
  roles: string[];
}

export const mockServerSettings: ServerSettings = {
  sentryDiagnosticsEnabled: false,
  whitelistEnabled: false,
  loginRequired: false,
  registration: false,
};

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    isRootUser: true,
    isVerified: true,
    needsPasswordChange: false,
    roles: ['admin', 'operator'],
  },
  {
    id: 2,
    username: 'operator1',
    isRootUser: false,
    isVerified: true,
    needsPasswordChange: false,
    roles: ['operator'],
  },
  {
    id: 3,
    username: 'viewer1',
    isRootUser: false,
    isVerified: true,
    needsPasswordChange: false,
    roles: ['viewer'],
  },
];

export const mockCurrentUser: User = {
  id: 1,
  username: 'admin',
  isRootUser: true,
  isVerified: true,
  needsPasswordChange: false,
  roles: ['admin', 'operator'],
};
