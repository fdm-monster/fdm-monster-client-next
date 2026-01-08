export interface PrinterMaintenanceLogMetadata {
  partsInvolved?: string[]
  cause?: string
  notes?: string
  completionNotes?: string
}

export interface PrinterMaintenanceLog {
  id: number
  createdAt: string
  createdBy: string
  createdByUserId: number | null
  printerId: number | null
  printerName: string
  printerUrl: string
  metadata: PrinterMaintenanceLogMetadata
  completed: boolean
  completedAt?: string
  completedByUserId: number | null
  completedBy?: string
}

export interface CreateMaintenanceLog {
  printerId: number
  metadata: {
    partsInvolved?: string[]
    cause?: string
    notes?: string
  }
}

export interface CompleteMaintenanceLog {
  completionNotes?: string
}

export interface MaintenanceLogsResponse {
  logs: PrinterMaintenanceLog[]
  total: number
  page: number
  pageSize: number
}

