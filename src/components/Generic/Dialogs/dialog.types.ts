import { DialogName } from './dialog.constants'
import { PrinterDto } from '@/models/printers/printer.model'

// Context types for each dialog
export interface AddOrUpdatePrinterDialogContext {
  id?: number
  floorId?: number
  floorX?: number
  floorY?: number
}

export interface AddOrUpdateFloorDialogContext {
  printerFloorId?: number
}

export interface AddOrUpdateCameraDialogContext {
  cameraId?: number
  addOrUpdate?: 'add' | 'update'
}

export interface PrinterMaintenanceDialogContext {
  printerId?: number
}

export interface PrinterControlDialogContext {
  printer?: PrinterDto
}

export interface JsonViewerDialogContext {
  data?: any
  title?: string
}

export interface ManageTagsDialogContext {
  tagId?: number
  tagName?: string
}

// Map dialog names to their context types
export interface DialogContextTypeMap {
  [DialogName.AddOrUpdatePrinterDialog]: AddOrUpdatePrinterDialogContext
  [DialogName.AddOrUpdateFloorDialog]: AddOrUpdateFloorDialogContext
  [DialogName.AddOrUpdateCameraDialog]: AddOrUpdateCameraDialogContext
  [DialogName.PrinterMaintenanceDialog]: PrinterMaintenanceDialogContext
  [DialogName.PrinterControlDialog]: PrinterControlDialogContext
  [DialogName.JsonViewerDialog]: JsonViewerDialogContext
  [DialogName.CreateUserDialog]: undefined
  [DialogName.ImportOctoFarmDialog]: undefined
  [DialogName.BatchReprintDialog]: undefined
  [DialogName.YamlImportExport]: undefined
  [DialogName.ManageTagsDialog]: ManageTagsDialogContext
}

// Helper type to get context type for a specific dialog
export type DialogContextType<T extends DialogName> = DialogContextTypeMap[T]

