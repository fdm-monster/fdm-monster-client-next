import { ServerApi } from '@/backend/server.api'
import { BaseService } from '@/backend/base.service'
import { ApiKeyDto, CreatedApiKeyDto } from '@/models/api-key/api-key.dto'

export class ApiKeyService extends BaseService {
  static async list() {
    return await this.get<ApiKeyDto[]>(ServerApi.apiKeysRoute)
  }

  static async create(label: string, roleIds: number[]) {
    return await this.post<CreatedApiKeyDto>(ServerApi.apiKeysRoute, { label, roleIds })
  }

  static async deleteKey(id: number) {
    return await this.delete<void>(ServerApi.apiKeyRoute(id))
  }
}
