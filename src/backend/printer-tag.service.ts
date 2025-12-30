import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export interface PrinterTagDto {
  printerId: number;
  groupId: number;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface TagWithPrintersDto extends TagDto {
  printers: PrinterTagDto[];
}

export class PrinterTagService extends BaseService {
  static async createTag(name: string) {
    const path = `${ ServerApi.createGroupRoute }`;
    const body = {
      name,
    };
    return await this.post(path, body);
  }

  static async deleteTag(groupId: number) {
    const path = `${ ServerApi.deleteTagRoute(groupId) }`;
    return await this.delete<TagWithPrintersDto[]>(path);
  }

  static async getTagsWithPrinters() {
    const path = `${ ServerApi.printerTagsRoute }`;
    return await this.get<TagWithPrintersDto[]>(path);
  }

  static async addPrinterToTag(groupId: number, printerId: number) {
    const path = `${ ServerApi.addPrinterToGroupRoute(groupId) }`;
    const body = {
      printerId,
    };
    return await this.post<TagWithPrintersDto[]>(path, body);
  }

  static async deletePrinterTag(groupId: number, printerId: number) {
    const path = `${ ServerApi.deletePrinterFromTagRoute(groupId) }`;
    const body = {
      printerId,
    };
    return await this.delete< TagWithPrintersDto[]>(path, body);
  }

  static async updateGroupName(groupId: number, name: string) {
    const path = `${ ServerApi.updateTagNameRoute(groupId) }`;
    const body = {
      name,
    };
    return await this.patch<TagWithPrintersDto[]>(path, body);
  }
}
