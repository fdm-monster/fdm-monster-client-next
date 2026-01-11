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
      { x: 100, y: 150, printerId: 1, floorId: 1 },
      { x: 300, y: 150, printerId: 2, floorId: 1 },
    ],
  },
  {
    id: 2,
    name: 'Test Lab',
    order: 2,
    printers: [
      { x: 200, y: 200, printerId: 3, floorId: 2 },
    ],
  },
];

export const mockFloorsEmpty: FloorDto[] = [];

export const mockSingleFloor: FloorDto = {
  id: 1,
  name: 'Main Workshop',
  order: 1,
  printers: [
    { x: 100, y: 150, printerId: 1, floorId: 1 },
    { x: 300, y: 150, printerId: 2, floorId: 1 },
  ],
};
