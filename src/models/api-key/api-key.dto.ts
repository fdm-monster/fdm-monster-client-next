export interface ApiKeyDto {
  id: number
  createdByUserId: number
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
