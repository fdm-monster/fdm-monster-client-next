import { BaseService } from '@/backend/base.service'
import { ServerApi } from '@/backend/server.api'
import { FileUploadCommands } from '@/models/printers/file-upload-commands.model'
import {
  ClearedFilesResult,
  FileDto
} from '@/models/printers/printer-file.model'
import { PrinterDto } from '@/models/printers/printer.model'
import { useSnackbar } from '@/shared/snackbar.composable'
import { IdType } from '@/utils/id.type'

export class PrinterFileService extends BaseService {
  static async getFiles(printerId: IdType, recursive = false) {
    const path = `${ServerApi.printerFilesRoute}/${printerId}/?recursive=${recursive}`

    return (await this.get(path)) as FileDto[]
  }

  /**
   * A nice alternative for offline or disabled printers
   * @param printerId
   */
  static async getFileCache(printerId: IdType) {
    const path = `${ServerApi.printerFilesCacheRoute(printerId)}`

    return (await this.get(path)) as FileDto[]
  }

  static async selectAndPrintFile(
    printerId: IdType,
    filePath: string,
    print = true
  ) {
    const path = ServerApi.printerFilesSelectAndPrintRoute(printerId)
    return await this.post(path, { filePath, print })
  }

  static async uploadFile(
    printer: PrinterDto,
    file: File,
    commands: FileUploadCommands = {
      select: true,
      print: true
    }
  ) {
    const path = ServerApi.printerFilesUploadRoute(printer.id)

    const formData = new FormData()
    if (commands.select) {
      formData.append('select', 'true')
    }
    if (commands.print) {
      formData.append('print', 'true')
    }
    formData.append('files[0]', file)

    return this.postUpload(path, formData, {
      onUploadProgress: (progress) => {
        const snackbar = useSnackbar()
        snackbar.openProgressMessage(
          'single-file-upload',
          `Uploading file ${file.name}`,
          (100 * progress.loaded) / progress.total!,
          false
        )
      }
    })
  }

  static async clearFiles(printerId: IdType) {
    const path = `${ServerApi.printerFilesClearRoute(printerId)}`

    return this.delete<ClearedFilesResult>(path)
  }

  static async purgeFiles() {
    const path = `${ServerApi.printerFilesPurgeRoute}`

    return this.post(path)
  }

  static async deleteFileOrFolder(printerId: IdType, path: string) {
    const urlPath = `${ServerApi.printerFilesRoute}/${printerId}/?path=${path}`

    return this.delete(urlPath)
  }

  static downloadFile(file: FileDto) {
    window.location.href = file.refs.download
  }
}
