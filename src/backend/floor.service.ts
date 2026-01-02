import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import { FloorDto, getDefaultCreateFloor, PreCreateFloor } from "@/models/floors/floor.model";

export class FloorService extends BaseService {
  static convertPrinterFloorToCreateForm(printerFloor?: FloorDto): PreCreateFloor {
    // Inverse transformation
    const newFormData = getDefaultCreateFloor();

    newFormData.id = printerFloor?.id;
    newFormData.name = printerFloor?.name || newRandomNamePair();
    newFormData.printers = [];

    newFormData.order = (printerFloor?.order || 1).toString();

    return newFormData;
  }

  static convertCreateFormToFloor(formData: PreCreateFloor) {
    const modifiedData: any = { ...formData };

    // Fix the string properties to become int
    modifiedData.order = Number.parseInt(modifiedData.order);

    if (Number.isNaN(modifiedData.order)) {
      throw new TypeError("Floor order did not convert to number.");
    }

    return modifiedData as FloorDto;
  }

  static async getFloors() {
    const path = `${ServerApi.floorRoute}/`;

    return await this.get<FloorDto[]>(path);
  }

  static async createFloor(floor: FloorDto) {
    const path = `${ServerApi.floorRoute}/`;

    return await this.post<FloorDto>(path, floor);
  }

  static async updateFloorName(floorId: number, name: string) {
    const path = `${ServerApi.updatePrinterFloorNameRoute(floorId)}/`;

    return await this.patch<FloorDto>(path, { name });
  }

  static async updateFloorOrder(floorId: number, order: number) {
    const path = `${ServerApi.updatePrinterFloorOrderRoute(floorId)}/`;

    return await this.patch<FloorDto>(path, { order });
  }

  static async deleteFloor(floorId: number) {
    const path = `${ServerApi.getFloorRoute(floorId)}/`;

    return await this.delete(path);
  }

  static async addPrinterToFloor(
    floorId: number,
    body: { printerId: number; x: number; y: number }
  ) {
    const path = `${ServerApi.addOrRemovePrinterFromFloorRoute(floorId)}/`;

    return await this.post<FloorDto>(path, body);
  }

  static async deletePrinterFromFloor(floorId: number, printerId: number) {
    const path = `${ServerApi.addOrRemovePrinterFromFloorRoute(floorId)}/`;

    return await this.delete<FloorDto>(path, { printerId });
  }
}
