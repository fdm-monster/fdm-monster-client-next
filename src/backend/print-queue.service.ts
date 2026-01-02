import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'
import type { PrintJobDto } from '@/backend/print-jobs.service'

export interface QueuedJobDto {
  id: number
  printerId: number
  jobId: number
  position: number
  addedAt: Date
  job?: PrintJobDto
  skuCount?: number
}

export interface PrinterQueueDto {
  printerId: number
  printerName: string
  jobs: QueuedJobDto[]
}

export interface GlobalQueuePlateDto {
  jobId: number
  fileName: string
  skuCount: number
  totalQueued: number
  printers: {
    printerId: number
    printerName: string
    queuePosition: number
  }[]
}

export interface GlobalQueueViewDto {
  plates: GlobalQueuePlateDto[]
  totalPlates: number
  totalJobs: number
}

export interface ReorderQueueDto {
  jobId: number
  newPosition: number
}

export class PrintQueueService extends BaseService {
  /**
   * Get global plate view with SKU count
   */
  static async getGlobalQueue(): Promise<GlobalQueueViewDto> {
    return await this.get<GlobalQueueViewDto>(`${ServerApi.printQueueRoute}/global`)
  }

  /**
   * Get printer-specific queue
   */
  static async getPrinterQueue(printerId: number): Promise<PrinterQueueDto> {
    return await this.get<PrinterQueueDto>(`${ServerApi.printQueueRoute}/${printerId}`)
  }

  /**
   * Get next job for printer
   */
  static async getNextJob(printerId: number): Promise<QueuedJobDto | null> {
    return await this.get<QueuedJobDto | null>(`${ServerApi.printQueueRoute}/${printerId}/next`)
  }

  /**
   * Add job to printer queue
   */
  static async addToQueue(printerId: number, jobId: number): Promise<QueuedJobDto> {
    return await this.post<QueuedJobDto>(`${ServerApi.printQueueRoute}/${printerId}/add/${jobId}`)
  }

  /**
   * Remove job from queue
   */
  static async removeFromQueue(printerId: number, jobId: number): Promise<void> {
    return await this.delete<void>(`${ServerApi.printQueueRoute}/${printerId}/${jobId}`)
  }

  /**
   * Reorder queue
   */
  static async reorderQueue(printerId: number, reorder: ReorderQueueDto[]): Promise<PrinterQueueDto> {
    return await this.put<PrinterQueueDto>(`${ServerApi.printQueueRoute}/${printerId}/reorder`, reorder)
  }

  /**
   * Clear printer queue
   */
  static async clearQueue(printerId: number): Promise<void> {
    return await this.delete<void>(`${ServerApi.printQueueRoute}/${printerId}/clear`)
  }

  /**
   * Process next job in queue
   */
  static async processNext(printerId: number): Promise<QueuedJobDto> {
    return await this.post<QueuedJobDto>(`${ServerApi.printQueueRoute}/${printerId}/process`)
  }

  /**
   * Set SKU/part count for a job
   */
  static async setSkuCount(jobId: number, skuCount: number): Promise<PrintJobDto> {
    return await this.post<PrintJobDto>(`${ServerApi.printJobsRoute}/${jobId}/set-sku-count`, { skuCount })
  }
}

