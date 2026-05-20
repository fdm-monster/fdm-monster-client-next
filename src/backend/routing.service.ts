import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

export interface RoutingResolution {
  routingTarget: string | null
  kind: 'printer' | 'tag' | 'none' | 'ambiguous'
  matchedName: string | null
  printerIds: number[]
}

export interface RoutingQueueResult {
  resolution: RoutingResolution
  queued: boolean
  jobId: number | null
  printerId: number | null
}

export class RoutingService extends BaseService {
  static async resolve(fileStorageId: string): Promise<RoutingResolution> {
    return this.get<RoutingResolution>(
      ServerApi.resolveRoutingRoute(fileStorageId)
    )
  }

  static async queue(fileStorageId: string): Promise<RoutingQueueResult> {
    return this.post<RoutingQueueResult>(
      ServerApi.queueRoutingRoute(fileStorageId),
      {}
    )
  }
}
