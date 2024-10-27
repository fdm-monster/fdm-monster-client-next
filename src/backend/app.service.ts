import { BaseService } from './base.service'
import { VersionModel } from '@/models/server/version.model'
import { FeaturesModel } from '@/models/server/features.model'
import { IClientReleases } from '@/models/server/client-releases.model'
import { getHttpClient } from '@/shared/http-client'

export class AppService extends BaseService {
  static async updateClientDistGithub(
    version?: string,
    allowDowngrade?: boolean
  ) {
    return await this.post('api/server/update-client-bundle-github', {
      downloadRelease: version,
      allowDowngrade
    })
  }

  static async getClientReleases() {
    return (await this.get('api/server/client-releases')) as IClientReleases
  }

  static async getVersion() {
    return (await this.get('api/version')) as VersionModel
  }

  static async getFeatures() {
    return (await this.get('api/features')) as FeaturesModel
  }

  static async test() {
    const httpClient = await getHttpClient(false, false)
    return (await httpClient.get('api/test')) as { message: string }
  }
}
