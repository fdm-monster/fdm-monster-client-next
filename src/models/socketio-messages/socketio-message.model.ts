import { PrinterDto } from '@/models/printers/printer.model'
import { FloorDto } from '../floors/floor.model'
import { IdType } from '@/utils/id.type'
import { CurrentOrHistoryPayload } from '@/models/printers/printer-current-job.model'

export interface TrackedUpload {
  correlationToken: string
  printerId: IdType
  startedAt: number
  multerFile: {
    originalname: string
    [k: string]: any
  }
  progress: number
  completed: boolean
  completedAt?: number
  success?: boolean
  reason?: string
}

export interface UploadStates {
  current: TrackedUpload[]
}

export interface SocketState {
  socket: string
  api: string
}

export interface PrinterStateDto {
  connected: {
    payload: any
    receivedAt: number
  }
  plugins: any[]
  events: any[]
  current: {
    payload: CurrentOrHistoryPayload
    receivedAt: number
  }
  history: {
    payload: CurrentOrHistoryPayload
    receivedAt: number
  }
}

export interface SocketIoUpdateMessage {
  printers: PrinterDto[]
  socketStates: Record<IdType, SocketState>
  printerEvents: Record<IdType, PrinterStateDto>
  trackedUploads: UploadStates
  floors: FloorDto[]
  [k: string]: any
}
