import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

// Job lifecycle states
export type PrintJobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'STARTING'
  | 'PRINTING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN'

// File format types
export type FileFormatType = 'gcode' | '3mf' | 'bgcode'

// Base metadata interface
export interface BaseMetadata {
  fileName: string
  fileFormat: FileFormatType
  fileSize?: number
  gcodePrintTimeSeconds: number | null
  nozzleDiameterMm: number | null
  filamentDiameterMm: number | null
  filamentDensityGramsCm3: number | null
  filamentUsedMm: number | null
  filamentUsedCm3: number | null
  filamentUsedGrams: number | null
  totalFilamentUsedGrams: number | null
  layerHeight: number | null
  firstLayerHeight: number | null
  bedTemperature: number | null
  nozzleTemperature: number | null
  fillDensity: string | null
  filamentType: string | null
  printerModel: string | null
  slicerVersion: string | null
  maxLayerZ: number | null
  totalLayers: number | null
}

// Print statistics (runtime tracking)
export interface PrintStatistics {
  startedAt: Date | null
  endedAt: Date | null
  actualPrintTimeSeconds: number | null
  progress: number | null
  failureReason?: string
  failureTime?: Date
  toolChanges?: number
  currentLayer?: number
  totalLayers?: number
}

export interface ThumbnailInfo {
  index: number
  width: number
  height: number
  format: string
  size: number
}

export interface PrintJobDto {
  id: number
  printerId: number | null
  printerName: string | null
  fileName: string
  fileFormat: FileFormatType | null
  fileStorageId: string | null
  fileHash: string | null
  createdAt: Date
  updatedAt: Date
  startedAt: Date | null
  endedAt: Date | null
  status: PrintJobStatus
  statusReason: string | null
  progress: number | null
  metadata: BaseMetadata | null
  statistics: PrintStatistics | null
  thumbnails: ThumbnailInfo[]
}

export interface PrintJobSearchParams {
  searchPrinter?: string
  searchFile?: string
  startDate?: string
  endDate?: string
}

export interface PrintJobSearchPagedParams extends PrintJobSearchParams {
  page?: number
  pageSize?: number
}

export interface PrintJobsPagedResponse {
  items: PrintJobDto[]
  count: number
  pages: number
}

export class PrintJobService extends BaseService {
  static async searchJobs(params: PrintJobSearchParams = {}): Promise<PrintJobDto[]> {
    const searchParams = new URLSearchParams()

    if (params.searchPrinter) searchParams.set('searchPrinter', params.searchPrinter)
    if (params.searchFile) searchParams.set('searchFile', params.searchFile)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)

    const path = `${ServerApi.printJobsSearchRoute}?${searchParams.toString()}`
    return (await this.get(path)) as PrintJobDto[]
  }

  static async searchJobsPaged(params: PrintJobSearchPagedParams = {}): Promise<PrintJobsPagedResponse> {
    const searchParams = new URLSearchParams()

    if (params.searchPrinter) searchParams.set('searchPrinter', params.searchPrinter)
    if (params.searchFile) searchParams.set('searchFile', params.searchFile)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())

    const path = `${ServerApi.printJobsSearchPagedRoute}?${searchParams.toString()}`
    return await this.get<PrintJobsPagedResponse>(path);
  }

  static async getJob(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}`
    return await this.get<PrintJobDto>(path);
  }

  static async reAnalyzeJob(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/re-analyze`
    return await this.post<PrintJobDto>(path);
  }

  static async setJobCompleted(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/set-completed`
    return await this.post<PrintJobDto>(path);
  }

  static async setJobFailed(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/set-failed`
    return await this.post<PrintJobDto>(path);
  }

  static async setJobCancelled(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/set-cancelled`
    return await this.post<PrintJobDto>(path);
  }

  static async setJobUnknown(jobId: number): Promise<PrintJobDto> {
    const path = `${ServerApi.printJobsRoute}/${jobId}/set-unknown`
    return await this.post<PrintJobDto>(path);
  }

  static async deleteJob(jobId: number, deleteFile: boolean = false): Promise<any> {
    const path = `${ServerApi.printJobsRoute}/${jobId}${deleteFile ? '?deleteFile=true' : ''}`
    return await this.delete(path);
  }

  static async createFromFile(fileStorageId: string, printerId: number): Promise<any> {
    const path = `${ServerApi.printJobsRoute}/from-file`
    return this.post(path, { fileStorageId, printerId })
  }
}
