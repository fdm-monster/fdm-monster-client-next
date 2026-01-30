import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { FilesDto } from "@/models/printers/printer-file.model";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSnackbar } from "@/shared/snackbar.composable";
import { downloadFileByBlob } from "@/utils/download-file.util";

export class PrinterRemoteFileService extends BaseService {
  static async getFiles(printerId: number, recursive = false, startDir?: string) {
    let path = `${ServerApi.printerRemoteFilesRoute}/${printerId}?recursive=${recursive}`;
    if (startDir) {
      path += `&startDir=${encodeURIComponent(startDir)}`;
    }

    return await this.get<FilesDto>(path);
  }

  static async getThumbnail(printerId: number) {
    const path = `${ServerApi.printerRemoteFilesRoute}/${printerId}/thumbnail`;

    return await this.get<{
      id: string
      thumbnailBase64: string
    }>(path)
  }

  static async selectAndPrintFile(
    printerId: number,
    filePath: string,
    print = true,
  ) {
    const path = ServerApi.printerFilesStartPrintRoute(printerId);
    return await this.post(path, { filePath, print });
  }

  static async uploadFile(printer: PrinterDto, file: File, startPrint: boolean = true) {
    const path = ServerApi.printerFilesUploadRoute(printer.id);

    const formData = new FormData();
    formData.append("startPrint", startPrint.toString());
    formData.append("files[0]", file);

    return this.postUpload(path, formData, {
      onUploadProgress: (progress) => {
        const snackbar = useSnackbar();
        snackbar.openProgressMessage(
          "single-file-upload",
          `Uploading file ${file.name}`,
          (100 * progress.loaded) / progress.total!,
          false,
        );
      },
    });
  }

  static async deleteFileOrFolder(printerId: number, path: string) {
    const urlPath = `${
      ServerApi.printerRemoteFilesRoute
    }/${printerId}?path=${encodeURIComponent(path)}`;
    return this.delete(urlPath);
  }

  static async downloadFile(printerId: number, path: string) {
    const urlPath = `${
      ServerApi.printerRemoteFilesRoute
    }/${printerId}/download/${encodeURIComponent(path)}`;
    const arrayBuffer = await this.getDownload(urlPath);
    downloadFileByBlob(arrayBuffer.data, path);
  }
}
