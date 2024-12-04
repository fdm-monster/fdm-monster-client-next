import { newRandomNamePair } from '@/shared/noun-adjectives.data'
import { IdType } from '@/utils/id.type'

export const getDefaultCreatePrinter = (): PreCreatePrinter => ({
  id: undefined,
  name: newRandomNamePair(),
  apiKey: '',
  printerURL: '',
  printerType: 0,
  enabled: true
})

export interface PreCreatePrinter {
  id?: IdType // Only in case of update
  enabled: boolean
  printerType: PrinterType
  name: string
  printerURL: string | undefined
  apiKey: string
}

export interface CreatePrinter {
  id?: IdType // Only in case of update
  enabled: boolean
  printerType: number
  name: string
  printerURL: string
  apiKey: string
}
