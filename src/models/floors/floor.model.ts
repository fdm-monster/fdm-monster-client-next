import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export interface FloorDto {
  id: number;
  name: string;
  order: number;
  printers: PositionDto[];
}

export interface PreCreateFloor {
  id?: number;
  name: string;
  order: string;
  printers: PositionDto[];
}

export interface PositionDto {
  x: number;
  y: number;
  printerId: number;
  floorId: number;
}

export const getDefaultCreateFloor = (): PreCreateFloor => ({
  id: undefined,
  name: newRandomNamePair(),
  order: "1",
  printers: [],
});
