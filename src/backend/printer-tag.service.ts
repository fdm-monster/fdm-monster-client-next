import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { DEFAULT_TAG_COLOR } from "@/shared/tag.constants";

export interface PrinterTagDto {
  printerId: number;
  tagId: number;
}

export interface TagDto {
  id: number;
  name: string;
  color: string;
}

export interface TagWithPrintersDto extends TagDto {
  printers: PrinterTagDto[];
}

export class PrinterTagService extends BaseService {
  static async createTag(name: string, color: string = DEFAULT_TAG_COLOR) {
    const path = `${ ServerApi.createTagRoute }`;
    const body = {
      name,
      color,
    };
    return await this.post(path, body);
  }

  static async deleteTag(tagId: number) {
    const path = `${ ServerApi.deleteTagRoute(tagId) }`;
    return await this.delete<TagWithPrintersDto[]>(path);
  }

  static async getTagsWithPrinters() {
    const path = `${ ServerApi.printerTagRoute }`;
    return await this.get<TagWithPrintersDto[]>(path);
  }

  static async addPrinterToTag(tagId: number, printerId: number) {
    const path = `${ ServerApi.addPrinterToTagRoute(tagId) }`;
    const body = {
      printerId,
    };
    return await this.post<TagWithPrintersDto[]>(path, body);
  }

  static async deletePrinterTag(tagId: number, printerId: number) {
    const path = `${ ServerApi.deletePrinterFromTagRoute(tagId) }`;
    const body = {
      printerId,
    };
    return await this.delete< TagWithPrintersDto[]>(path, body);
  }

  static async updateTagName(tagId: number, name: string) {
    const path = `${ ServerApi.updateTagNameRoute(tagId) }`;
    const body = {
      name,
    };
    return await this.patch<TagWithPrintersDto[]>(path, body);
  }

  static async updateTagColor(tagId: number, color: string) {
    const path = `${ ServerApi.updateTagColorRoute(tagId) }`;
    const body = {
      color,
    };
    return await this.patch<TagWithPrintersDto[]>(path, body);
  }
}
