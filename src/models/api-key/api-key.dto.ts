export interface ApiKeyDto {
  id: number
  userId: number
  label: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

/** Server returns the cleartext token only on the create response — show, copy, never persist. */
export interface CreatedApiKeyDto extends ApiKeyDto {
  token: string
}
