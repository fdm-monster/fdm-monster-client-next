import { ServerApi } from '@/backend/server.api'
import { BaseService } from '@/backend/base.service'
import { ApiKeyDto, CreatedApiKeyDto } from '@/models/api-key/api-key.dto'

export class ApiKeyService extends BaseService {
  static async list() {
    return await this.get<ApiKeyDto[]>(ServerApi.apiKeysRoute)
  }

  /**
   * Mints a new API key. The returned object contains a `token` field that is
   * the cleartext bearer credential — the server never persists it, so it must
   * be shown to the user once and then discarded from memory.
   */
  static async create(label: string) {
    return await this.post<CreatedApiKeyDto>(ServerApi.apiKeysRoute, { label })
  }

  static async revoke(id: number) {
    return await this.delete<ApiKeyDto>(ServerApi.apiKeyRevokeRoute(id))
  }
}
