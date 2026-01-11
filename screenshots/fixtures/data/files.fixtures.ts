/**
 * Mock data for file-related API endpoints
 */

export interface FileDto {
  id: string;
  name: string;
  path: string;
  size: number;
  date: number;
  type?: string;
}

export const mockFiles: FileDto[] = [
  {
    id: 'file-1',
    name: 'benchy.gcode',
    path: '/files/benchy.gcode',
    size: 5242880, // 5 MB
    date: Date.now() - 86400000,
    type: 'model',
  },
  {
    id: 'file-2',
    name: 'cube_calibration.gcode',
    path: '/files/cube_calibration.gcode',
    size: 1048576, // 1 MB
    date: Date.now() - 86400000 * 2,
    type: 'model',
  },
  {
    id: 'file-3',
    name: 'phone_holder.gcode',
    path: '/files/phone_holder.gcode',
    size: 3145728, // 3 MB
    date: Date.now() - 86400000 * 5,
    type: 'model',
  },
  {
    id: 'file-4',
    name: 'vase_mode_spiral.gcode',
    path: '/files/vase_mode_spiral.gcode',
    size: 2097152, // 2 MB
    date: Date.now() - 86400000 * 7,
    type: 'model',
  },
];

export const mockFilesEmpty: FileDto[] = [];

export const mockFileUploadProgress = {
  filename: 'test-model.gcode',
  progress: 45,
  total: 100,
  status: 'uploading',
};
