import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

export interface QueuedJob {
  id: number
  fileName: string
  queuePosition: number
  status: string
  estimatedTimeSeconds?: number
  filamentGrams?: number
  createdAt: Date
}

export interface GlobalQueueResponse {
  items: Array<{
    jobId: number
    fileName: string
    printerId: number
    printerName?: string
    queuePosition: number
    status: string
    createdAt: Date
    estimatedTimeSeconds?: number
    filamentGrams?: number
  }>
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PrinterQueueResponse {
  printerId: number
  queue: QueuedJob[]
  count: number
}

export class PrintQueueService extends BaseService {
  static async getGlobalQueue(page: number = 1, pageSize: number = 50): Promise<GlobalQueueResponse> {
    const path = `${ServerApi.printQueueRoute}?page=${page}&pageSize=${pageSize}`
    return this.get<GlobalQueueResponse>(path)
  }

  static async getPrinterQueue(printerId: number): Promise<PrinterQueueResponse> {
    const path = `${ServerApi.printQueueRoute}/${printerId}`
    return this.get<PrinterQueueResponse>(path)
  }

  static async addToQueue(printerId: number, jobId: number, position?: number): Promise<PrinterQueueResponse> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/add/${jobId}`
    return this.post<PrinterQueueResponse>(path, { position })
  }

  static async removeFromQueue(printerId: number, jobId: number): Promise<PrinterQueueResponse> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/${jobId}`
    return this.delete<PrinterQueueResponse>(path)
  }

  static async reorderQueue(printerId: number, jobIds: number[]): Promise<PrinterQueueResponse> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/reorder`
    return this.put<PrinterQueueResponse>(path, { jobIds })
  }

  static async clearQueue(printerId: number): Promise<{ message: string; printerId: number }> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/clear`
    return this.delete<{ message: string; printerId: number }>(path)
  }

  static async getNextInQueue(printerId: number): Promise<{ printerId: number; nextJob: QueuedJob | null }> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/next`
    return this.get<{ printerId: number; nextJob: QueuedJob | null }>(path)
  }

  static async processQueue(printerId: number): Promise<{ message: string; printerId: number; nextJob: QueuedJob | null }> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/process`
    return this.post<{ message: string; printerId: number; nextJob: QueuedJob | null }>(path)
  }

  static async submitToPrinter(jobId: number, printerId: number): Promise<{ message: string; jobId: number; printerId: number }> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/submit/${jobId}`
    return this.post<{ message: string; jobId: number; printerId: number }>(path)
  }

  static async createJobFromFile(printerId: number, fileStorageId: string, position?: number): Promise<PrinterQueueResponse> {
    const path = `${ServerApi.printQueueRoute}/${printerId}/from-file`
    return this.post<PrinterQueueResponse>(path, {
      fileStorageId,
      addToQueue: true,
      position
    })
  }
}
