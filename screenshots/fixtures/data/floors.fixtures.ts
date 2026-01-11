/**
 * Mock data for floor-related API endpoints
 */

export interface FloorDto {
  id: number;
  name: string;
  order: number;
  printers: PositionDto[];
}

export interface PositionDto {
  x: number;
  y: number;
  printerId: number;
  floorId: number;
}

export const mockFloors: FloorDto[] = [
  {
    id: 1,
    name: 'Main Workshop',
    order: 1,
    printers: [
      { x: 0, y: 0, printerId: 1, floorId: 1 },
      { x: 1, y: 0, printerId: 2, floorId: 1 },
    ],
  },
  {
    id: 2,
    name: 'Test Lab',
    order: 2,
    printers: [
      { x: 0, y: 0, printerId: 3, floorId: 2 },
    ],
  },
];

export const mockFloorsEmpty: FloorDto[] = [];
