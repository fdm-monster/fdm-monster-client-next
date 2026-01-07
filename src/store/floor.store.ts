import { defineStore } from 'pinia'
import { FloorDto } from '@/models/floors/floor.model'
import { useSettingsStore } from './settings.store'
import { PrinterDto } from '@/models/printers/printer.model'
import { usePrinterStore } from './printer.store'
import { FloorService } from '@/backend/floor.service'

export interface State {
  floors: FloorDto[]
  selectedFloorIndex: number
}

type PrinterMatrix = (PrinterDto | undefined)[][]

function createEmptyMatrix(cols: number, rows: number): PrinterMatrix {
  const matrix: PrinterMatrix = []
  for (let i = 0; i < cols; i++) {
    const row: (PrinterDto | undefined)[] = []
    matrix.push(row)
    for (let j = 0; j < rows; j++) {
      row.push(undefined)
    }
  }
  return matrix
}

function fillMatrixVertically(
  matrix: PrinterMatrix,
  printers: PrinterDto[],
  cols: number,
  rows: number
): void {
  let printerIndex = 0
  for (let x = 0; x < cols && printerIndex < printers.length; x++) {
    for (let y = 0; y < rows && printerIndex < printers.length; y++) {
      matrix[x][y] = printers[printerIndex]
      printerIndex++
    }
  }
}

function fillMatrixHorizontally(
  matrix: PrinterMatrix,
  printers: PrinterDto[],
  cols: number,
  rows: number
): void {
  let printerIndex = 0
  for (let y = 0; y < rows && printerIndex < printers.length; y++) {
    for (let x = 0; x < cols && printerIndex < printers.length; x++) {
      matrix[x][y] = printers[printerIndex]
      printerIndex++
    }
  }
}

export const useFloorStore = defineStore('Floors', {
  state: (): State => ({
    floors: [],
    selectedFloorIndex: 0
  }),
  getters: {
    selectedFloor(state): FloorDto | null {
      if (state.floors.length <= state.selectedFloorIndex) {
        return null
      }
      return state.floors[state.selectedFloorIndex]
    },
    sortedFloors(state) {
      return state.floors.sort((f, f2) => f.order - f2.order)
    },
    floor(state) {
      return (floorId: number) => state.floors.find((pf) => pf.id === floorId)
    },
    floorNames(state) {
      return state.floors.map((f) => f.name)
    },
    floorOfPrinter() {
      return (printerId: number) => {
        return this.floors.find((f: FloorDto) =>
          f.printers.map((pid) => pid.printerId).includes(printerId)
        )
      }
    },
    floorlessPrinters(state): PrinterDto[] {
      const printersStore = usePrinterStore()
      return printersStore.printers.filter(
        (p) =>
          !state.floors.some((f) =>
            f.printers.find((fp) => fp.printerId === p.id)
          )
      )
    },
    gridSortedPrinters() {
      const settingsStore = useSettingsStore()
      const printersStore = usePrinterStore()

      if (!printersStore.printers.length || !this.selectedFloor) {
        return []
      }

      const matrix = createEmptyMatrix(settingsStore.gridCols, settingsStore.gridRows)
      const positions = this.selectedFloor.printers

      for (let x = 0; x < settingsStore.gridCols; x++) {
        for (let y = 0; y < settingsStore.gridRows; y++) {
          const position = positions.find((p) => p.x === x && p.y === y)
          if (position) {
            const printer = printersStore.printers.find((p) => p.id === position.printerId)
            if (printer) {
              matrix[x][y] = printer
            }
          }
        }
      }
      return matrix
    },
    gridNameSortedPrinters() {
      return (filteredPrinters?: PrinterDto[]) => {
        const settingsStore = useSettingsStore()
        const printersStore = usePrinterStore()

        if (!printersStore.printers.length || !this.selectedFloor) {
          return []
        }

        const floorPrinterIds = new Set(this.selectedFloor.printers.map(p => p.printerId))
        const sourcePrinters = filteredPrinters ?? printersStore.printers
        const floorPrinters = sourcePrinters.filter(p => floorPrinterIds.has(p.id))

        floorPrinters.sort((a, b) => a.name.localeCompare(b.name))

        const matrix = createEmptyMatrix(settingsStore.gridCols, settingsStore.gridRows)
        const fillFunction = settingsStore.gridNameSortDirection === 'vertical'
          ? fillMatrixVertically
          : fillMatrixHorizontally

        fillFunction(matrix, floorPrinters, settingsStore.gridCols, settingsStore.gridRows)

        return matrix
      }
    }
  },
  actions: {
    async loadFloors() {
      const floors = await FloorService.getFloors()

      this.saveFloors(floors)
      return floors
    },
    async createFloor(newPrinterFloor: FloorDto) {
      const data = await FloorService.createFloor(newPrinterFloor)
      this.floors.push(data)
      return data
    },
    saveFloors(floors: FloorDto[]) {
      if (!floors?.length) return
      this.floors = floors.toSorted((f, f2) => f.order - f2.order)
      const floorId = this.selectedFloor?.id
      const foundFloorIndex = this.floors.findIndex((f) => f.id === floorId)
      this.selectedFloorIndex = foundFloorIndex === -1 ? 0 : foundFloorIndex
    },
    async deleteFloor(floorId: number) {
      await FloorService.deleteFloor(floorId)
      this._popPrinterFloor(floorId)
    },
    async updateFloorName({
      floorId,
      name
    }: {
      floorId: number
      name: string
    }) {
      const floor = await FloorService.updateFloorName(floorId, name)
      this._replaceFloor(floor)
      return floor
    },
    async updateFloorOrder({
      floorId,
      order
    }: {
      floorId: number
      order: number
    }) {
      const floor = await FloorService.updateFloorOrder(floorId, order)
      this._replaceFloor(floor)
      return floor
    },
    async addPrinterToFloor({
      floorId,
      printerId,
      x,
      y
    }: {
      floorId: number
      printerId: number
      x: number
      y: number
    }) {
      const result = await FloorService.addPrinterToFloor(floorId, {
        printerId,
        x,
        y
      })
      this._replaceFloor(result)
    },
    async changeSelectedFloorByIndex(selectedPrinterFloorIndex: number) {
      if (!this.floors?.length) return
      if (this.floors.length <= selectedPrinterFloorIndex) {
        console.warn('Selected floor index exceeds floors array')
        this.selectedFloorIndex = 0
        return
      }

      const newFloor = this.floors[selectedPrinterFloorIndex]
      if (!newFloor) {
        console.warn('Selected floor index did not exist in floors array')
        this.selectedFloorIndex = 0
        return
      }

      this.selectedFloorIndex = selectedPrinterFloorIndex
    },
    async deletePrinterFromFloor({
      floorId,
      printerId
    }: {
      floorId: number
      printerId: number
    }) {
      const result = await FloorService.deletePrinterFromFloor(
        floorId,
        printerId
      )
      this._replaceFloor(result)
    },
    _popPrinterFloor(floorId: number) {
      const foundFloorIndex = this.floors.findIndex((pg) => pg.id === floorId)
      if (foundFloorIndex !== -1) {
        this.floors.splice(foundFloorIndex, 1)
      }
    },
    _replaceFloor(printerFloor: FloorDto) {
      const foundFloorIndex = this.floors.findIndex(
        (pf) => pf.id === printerFloor.id
      )
      if (foundFloorIndex !== -1) {
        this.floors[foundFloorIndex] = printerFloor
      }
    }
  }
})
