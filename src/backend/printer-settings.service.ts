import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'

export class PrinterSettingsService extends BaseService {
  static async syncPrinterName(printerId: number) {
    const path = `${ServerApi.syncPrinterNameSettingRoute(printerId)}`

    return await this.post(path)
  }
}
