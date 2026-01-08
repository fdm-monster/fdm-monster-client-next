import { BaseService } from '@/backend/base.service'
import {
  CreateMaintenanceLog,
  CompleteMaintenanceLog,
  MaintenanceLogsResponse,
  PrinterMaintenanceLog
} from '@/models/printers/printer-maintenance-log.model'

export class PrinterMaintenanceLogService extends BaseService {
  static readonly baseRoute = '/api/v2/printer-maintenance-log'

  static async listLogs(params?: {
    printerId?: number
    completed?: boolean
    page?: number
    pageSize?: number
  }): Promise<MaintenanceLogsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.printerId) queryParams.append('printerId', params.printerId.toString())
    if (params?.completed !== undefined) queryParams.append('completed', params.completed.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const query = queryParams.toString()
    const path = query ? `${this.baseRoute}?${query}` : this.baseRoute

    return await this.get<MaintenanceLogsResponse>(path)
  }

  static async getLog(logId: number): Promise<PrinterMaintenanceLog> {
    return await this.get<PrinterMaintenanceLog>(`${this.baseRoute}/${logId}`)
  }

  static async getActiveByPrinterId(printerId: number): Promise<PrinterMaintenanceLog | null> {
    return await this.get<PrinterMaintenanceLog | null>(
      `${this.baseRoute}/printer/${printerId}/active`
    )
  }

  static async create(data: CreateMaintenanceLog): Promise<PrinterMaintenanceLog> {
    return await this.post<PrinterMaintenanceLog>(this.baseRoute, data)
  }

  static async complete(
    logId: number,
    data: CompleteMaintenanceLog
  ): Promise<PrinterMaintenanceLog> {
    return await this.post<PrinterMaintenanceLog>(`${this.baseRoute}/${logId}/complete`, data)
  }

  static async deleteLog(logId: number): Promise<{ success: boolean }> {
    return await this.delete<{ success: boolean }>(`${this.baseRoute}/${logId}`)
  }
}

