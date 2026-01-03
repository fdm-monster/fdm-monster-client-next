import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

export interface PrintJobThumbnail {
  index: number
  url: string
  filename: string
  width: number
  height: number
  format: string
  size: number
}

export interface PrintJobThumbnailsResponse {
  jobId: number
  fileStorageId: string
  thumbnails: PrintJobThumbnail[]
}

export class PrintJobService extends BaseService {
  /**
   * Get all thumbnails for a print job
   */
  static async getThumbnails(jobId: number): Promise<PrintJobThumbnailsResponse> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/thumbnails`
    return this.get<PrintJobThumbnailsResponse>(path)
  }

  /**
   * Get thumbnail URL for a specific print job and thumbnail index
   */
  static getThumbnailUrl(jobId: number, index: number): string {
    return `${ServerApi.printJobsRoute}/${jobId}/thumbnails/${index}`
  }

  /**
   * Create a print job from an existing file in storage
   */
  static async createFromFile(fileStorageId: string, printerId: number): Promise<any> {
    const path = `${ServerApi.printJobsRoute}/from-file`
    return this.post(path, { fileStorageId, printerId })
  }
}

