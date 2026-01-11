/**
 * Mock data for print job-related API endpoints
 * Based on PrintJobDto and GlobalQueueResponse from backend services
 */

export interface PrintJobDto {
  id: number;
  printerId: number;
  printerName: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  status: 'QUEUED' | 'STARTING' | 'PRINTING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress?: number;
  statistics?: {
    actualPrintTimeSeconds?: number;
    estimatedPrintTimeSeconds?: number;
  };
}

// Mock jobs with various statuses for testing dashboard statistics
export const mockJobs: PrintJobDto[] = [
  // Active printing job
  {
    id: 1,
    printerId: 1,
    printerName: 'Prusa i3 MK3S',
    fileName: 'benchy.gcode',
    filePath: '/files/benchy.gcode',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'PRINTING',
    progress: 45,
    statistics: {
      estimatedPrintTimeSeconds: 7200, // 2 hours
      actualPrintTimeSeconds: 3600, // 1 hour so far
    },
  },
  // Completed job from 1 day ago
  {
    id: 2,
    printerId: 2,
    printerName: 'Ender 3 V2',
    fileName: 'cube_calibration.gcode',
    filePath: '/files/cube_calibration.gcode',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    endedAt: new Date(Date.now() - 86400000 + 1800000).toISOString(), // 30 minutes later
    status: 'COMPLETED',
    progress: 100,
    statistics: {
      actualPrintTimeSeconds: 1800, // 30 minutes
    },
  },
  // Completed job from 2 days ago
  {
    id: 3,
    printerId: 3,
    printerName: 'Artillery Sidewinder X1',
    fileName: 'phone_holder.gcode',
    filePath: '/files/phone_holder.gcode',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 2 + 5400000).toISOString(), // 1.5 hours later
    status: 'COMPLETED',
    progress: 100,
    statistics: {
      actualPrintTimeSeconds: 5400, // 1.5 hours
    },
  },
  // Failed job from 3 days ago
  {
    id: 4,
    printerId: 1,
    printerName: 'Prusa i3 MK3S',
    fileName: 'vase_mode_spiral.gcode',
    filePath: '/files/vase_mode_spiral.gcode',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 3 + 3000000).toISOString(), // 50 minutes later
    status: 'FAILED',
    progress: 75,
    statistics: {
      actualPrintTimeSeconds: 3000, // 50 minutes
    },
  },
  // Completed job from 12 hours ago
  {
    id: 5,
    printerId: 4,
    printerName: 'CR-10 S5',
    fileName: 'large_model.gcode',
    filePath: '/files/large_model.gcode',
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    startedAt: new Date(Date.now() - 43200000).toISOString(),
    endedAt: new Date(Date.now() - 43200000 + 14400000).toISOString(), // 4 hours later
    status: 'COMPLETED',
    progress: 100,
    statistics: {
      actualPrintTimeSeconds: 14400, // 4 hours
    },
  },
];

export const mockJobsEmpty: PrintJobDto[] = [];

export const mockJobDetails: PrintJobDto = {
  id: 1,
  printerId: 1,
  printerName: 'Prusa i3 MK3S',
  fileName: 'benchy.gcode',
  filePath: '/files/benchy.gcode',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  status: 'PRINTING',
  progress: 45,
  statistics: {
    estimatedPrintTimeSeconds: 7200,
    actualPrintTimeSeconds: 3600,
  },
};

// Mock print queue items (GlobalQueueResponse items structure)
export interface QueueItemDto {
  jobId: number;
  fileName: string;
  printerId: number;
  printerName?: string;
  queuePosition: number;
  status: string;
  createdAt: string;
  estimatedTimeSeconds?: number;
  filamentGrams?: number;
}

export const mockQueue: QueueItemDto[] = [
  {
    jobId: 10,
    fileName: 'model_1.gcode',
    printerId: 2,
    printerName: 'Ender 3 V2',
    queuePosition: 1,
    status: 'queued',
    createdAt: new Date().toISOString(),
    estimatedTimeSeconds: 3600,
    filamentGrams: 15.5,
  },
  {
    jobId: 11,
    fileName: 'model_2.gcode',
    printerId: 2,
    printerName: 'Ender 3 V2',
    queuePosition: 2,
    status: 'queued',
    createdAt: new Date().toISOString(),
    estimatedTimeSeconds: 5400,
    filamentGrams: 22.3,
  },
  {
    jobId: 12,
    fileName: 'model_3.gcode',
    printerId: 3,
    printerName: 'Artillery Sidewinder X1',
    queuePosition: 1,
    status: 'queued',
    createdAt: new Date().toISOString(),
    estimatedTimeSeconds: 7200,
    filamentGrams: 30.0,
  },
];
