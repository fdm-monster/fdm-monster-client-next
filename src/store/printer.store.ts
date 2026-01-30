import { defineStore } from 'pinia'
import { PrinterDto } from '@/models/printers/printer.model'
import {
  FileDto
} from '@/models/printers/printer-file.model'
import { PrinterRemoteFileService, PrintersService } from '@/backend'
import { CreatePrinter } from '@/models/printers/create-printer.model'
import { usePrinterStateStore } from './printer-state.store'
import {
  isPrinterDisabled,
  isPrinterDisconnected,
  isPrinterInMaintenance
} from '@/shared/printer-state.constants'

interface State {
  printers: PrinterDto[]
  printerFileCache: Record<number, FileDto[]>
  selectedPrinters: PrinterDto[]
}

export const usePrinterStore = defineStore('Printers', {
  state: (): State => ({
    printers: [],
    printerFileCache: {},
    selectedPrinters: []
  }),
  getters: {
    printer() {
      return (printerId?: number) => {
        return this.printers.find((p) => p.id == printerId)
      }
    },
    isSelectedPrinter(state) {
      return (printerId?: number) =>
        !!state.selectedPrinters.some((p: PrinterDto) => p.id === printerId)
    },
    printerFiles() {
      return (printerId: number) => this.printerFileCache[printerId]
    },
    disabledCount(): number {
      return this.printers.filter(isPrinterDisabled).length
    },
    disconnectedCount(): number {
      const printerStateStore = usePrinterStateStore()
      return this.printers.filter((p) =>
        isPrinterDisconnected(p, printerStateStore.printerEventsById[p.id])
      ).length
    },
    maintenanceCount(): number {
      return this.printers.filter((p) => isPrinterInMaintenance(p)).length
    }
  },
  actions: {
    async createPrinter(newPrinter: CreatePrinter, forceSave: boolean) {
      const data = await PrintersService.createPrinter(newPrinter, forceSave)
      this.printers.push(data)
      this.printers.sort((a: PrinterDto, b: PrinterDto) =>
        a.name?.toLowerCase()?.localeCompare(b?.name?.toLowerCase()) ? 1 : -1
      )
      return data
    },
    toggleSelectedPrinter(printer: PrinterDto) {
      const printerStateStore = usePrinterStateStore()
      const selectedPrinterIndex = this.selectedPrinters.findIndex(
        (sp) => sp.id == printer.id
      )
      if (selectedPrinterIndex === -1) {
        if (printerStateStore.isApiResponding(printer.id)) {
          this.selectedPrinters.push(printer)
        }
      } else {
        this.selectedPrinters.splice(selectedPrinterIndex, 1)
      }
    },
    clearSelectedPrinters() {
      this.selectedPrinters = []
    },
    async updatePrinter(
      {
        printerId,
        updatedPrinter
      }: {
        printerId: number
        updatedPrinter: CreatePrinter
      },
      forceSave: boolean
    ) {
      const data = await PrintersService.updatePrinter(
        printerId,
        updatedPrinter,
        forceSave
      )
      this._replacePrinter({ printerId, printer: data })
      return data
    },
    async loadPrinters() {
      const data = await PrintersService.getPrinters()
      this.setPrinters(data)
      return data
    },
    async deletePrinter(printerId: number) {
      const data = await PrintersService.deletePrinter(printerId)
      this._popPrinter(printerId)
      return data
    },
    setPrinters(printers: PrinterDto[]) {
      if (!printers?.length) {
        this.printers = []
        return
      }
      this.printers = printers.toSorted((a: PrinterDto, b: PrinterDto) =>
        a.name?.toLowerCase()?.localeCompare(b?.name?.toLowerCase()) ? 1 : -1
      )
    },
    _popPrinter(printerId: number) {
      const printerIndex = this.printers.findIndex(
        (p: PrinterDto) => p.id === printerId
      )

      if (printerIndex === -1) {
        console.warn(
          'Printer was not popped as it did not occur in state',
          printerId
        )
        return;
      }

      this.printers.splice(printerIndex, 1)
    },
    _replacePrinter({
                      printerId,
                      printer
                    }: {
      printerId: number
      printer: PrinterDto
    }) {
      const printerIndex = this.printers.findIndex(
        (p: PrinterDto) => p.id === printerId
      )

      if (printerIndex === -1) {
        console.warn(
          'Printer was not purged as it did not occur in state',
          printerId
        )
        return;
      }


      this.printers[printerIndex] = printer
    },
    async loadPrinterFiles(printerId: number, recursive = false, startDir?: string) {
      const response = await PrinterRemoteFileService.getFiles(printerId, recursive, startDir)
      const files = [...response.dirs, ...response.files]

      files.sort((f1, f2) => {
        if (f1.dir !== f2.dir) return f1.dir ? -1 : 1

        if (f1.date === null && f2.date === null) return 0
        if (f1.date === null) return 1
        if (f2.date === null) return -1
        return f1.date < f2.date ? 1 : -1
      })

      this.printerFileCache[printerId] = files
      return files
    },
    async deletePrinterFile(printerId: number, fullPath: string) {
      await PrinterRemoteFileService.deleteFileOrFolder(printerId, fullPath)

      const fileBucket = this.printerFileCache[printerId]
      if (!fileBucket?.length) {
        console.warn('Printer file list was nonexistent', printerId)
        return
      }

      const deletedFileIndex = fileBucket.findIndex((f) => f.path === fullPath)

      if (deletedFileIndex === -1) {
        console.warn('File was not purged as it did not occur in state', fullPath)
        return;
      }

      fileBucket.splice(deletedFileIndex, 1)
      return this.printerFiles(printerId)
    },
    async sendStopJobCommand(printerId?: number) {
      const printerStateStore = usePrinterStateStore()
      if (!printerId) return
      const printer = this.printer(printerId)
      if (!printer) return

      const question = printerStateStore.isPrinterPrinting(printerId)
        ? 'The printer seems idle - do you want to command it to stop anyway?'
        : 'The printer is still printing - are you sure to stop it?'

      const answer = confirm(question)
      if (answer) {
        await PrintersService.stopPrintJob(printer.id)
      }
    }
  }
})
