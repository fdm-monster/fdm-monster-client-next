export interface ApiKeyDto {
  id: number
  userId: number
  label: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
  roles: string[]
}

/** Server returns the cleartext token only on create. */
export interface CreatedApiKeyDto extends ApiKeyDto {
  token: string
}
