/**
 * Mock data for camera stream-related API endpoints
 */

export interface CameraStream {
  id: number;
  printerId?: number;
  streamURL: string;
  name?: string;
  aspectRatio?: string;
  rotationClockwise?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export const mockCameras: CameraStream[] = [
  {
    id: 1,
    printerId: 1,
    streamURL: 'http://192.168.1.100/webcam/?action=stream',
    name: 'Prusa i3 MK3S Camera',
    aspectRatio: '16:9',
    rotationClockwise: 0,
    flipHorizontal: false,
    flipVertical: false,
  },
  {
    id: 2,
    printerId: 2,
    streamURL: 'http://192.168.1.101/webcam/?action=stream',
    name: 'Ender 3 V2 Camera',
    aspectRatio: '16:9',
    rotationClockwise: 0,
    flipHorizontal: false,
    flipVertical: false,
  },
  {
    id: 3,
    streamURL: 'http://192.168.1.200/stream',
    name: 'Workshop Overview',
    aspectRatio: '16:9',
    rotationClockwise: 0,
    flipHorizontal: false,
    flipVertical: false,
  },
];

export const mockCamerasEmpty: CameraStream[] = [];
