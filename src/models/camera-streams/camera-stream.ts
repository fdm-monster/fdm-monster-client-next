import { PrinterDto } from '@/models/printers/printer.model'

export interface CreateCameraStreamDto {
  streamURL: string
  name?: string
  printerId?: number
  aspectRatio?: string
  rotationClockwise?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
}

export interface CameraStream {
  id?: number
  printerId?: number
  streamURL: string
  name?: string
  aspectRatio?: string
  rotationClockwise?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
}

export interface CameraWithPrinter {
  printer: PrinterDto
  cameraStream: CameraStream
}
