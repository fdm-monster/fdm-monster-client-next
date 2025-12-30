import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

export interface PrintJobDto {
  id: number
  printerId: number | null
  printerName: string | null
  fileName: string
  createdAt: Date
  endedAt: Date | null
  status: 'STARTED' | 'FINISHED' | 'FAILED' | null
  progress: number | null
  completed: boolean
  reason: string | null
  gcodePrintTimeSeconds: number | null
  actualPrintTimeSeconds: number | null
  nozzleDiameterMm: number | null
  filamentDiameterMm: number | null
  filamentDensityGramsCm3: number | null
  filamentUsedMm: number | null
  filamentUsedCm3: number | null
  filamentUsedGrams: number | null
  totalFilamentUsedGrams: number | null
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

export class PrintJobsService extends BaseService {
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
    return (await this.get(path)) as PrintJobsPagedResponse
  }
}
