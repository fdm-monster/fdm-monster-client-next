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
      const gridCols = settingsStore.gridCols
      const gridRows = settingsStore.gridRows

      const printersStore = usePrinterStore()
      const printers = printersStore.printers
      if (!printers.length) return []
      if (!this.selectedFloor) return []

      const positions = this.selectedFloor.printers
      const matrix: (PrinterDto | undefined)[][] = []
      for (let i = 0; i < gridCols; i++) {
        const row: (PrinterDto | undefined)[] = []
        matrix.push(row)
        for (let j = 0; j < gridRows; j++) {
          const position = positions.find((p) => p.x === i && p.y === j)
          if (position) {
            const printer = printers.find((p) => p.id === position.printerId)
            row.push(printer)
          } else {
            row.push(undefined)
          }
        }
      }
      return matrix
    },
    gridNameSortedPrinters() {
      const settingsStore = useSettingsStore()
      const gridCols = settingsStore.gridCols
      const gridRows = settingsStore.gridRows
      const sortDirection = settingsStore.gridNameSortDirection

      const printersStore = usePrinterStore()
      const printers = printersStore.printers
      if (!printers.length) return []
      if (!this.selectedFloor) return []

      // Get all printers on this floor and sort them by name
      const floorPrinterIds = new Set(this.selectedFloor.printers.map(p => p.printerId))
      const floorPrinters = printers
        .filter(p => floorPrinterIds.has(p.id))
        .sort((a, b) => a.name.localeCompare(b.name))

      // Create non-sparse grid - matrix is [col][row] format
      const matrix: (PrinterDto | undefined)[][] = []

      // Initialize empty matrix
      for (let i = 0; i < gridCols; i++) {
        const row: (PrinterDto | undefined)[] = []
        matrix.push(row)
        for (let j = 0; j < gridRows; j++) {
          row.push(undefined)
        }
      }

      let printerIndex = 0

      if (sortDirection === 'vertical') {
        // Fill vertically: down each column, then move to next column
        for (let x = 0; x < gridCols && printerIndex < floorPrinters.length; x++) {
          for (let y = 0; y < gridRows && printerIndex < floorPrinters.length; y++) {
            matrix[x][y] = floorPrinters[printerIndex]
            printerIndex++
          }
        }
      } else {
        // Fill horizontally: across each row, then move to next row
        for (let y = 0; y < gridRows && printerIndex < floorPrinters.length; y++) {
          for (let x = 0; x < gridCols && printerIndex < floorPrinters.length; x++) {
            matrix[x][y] = floorPrinters[printerIndex]
            printerIndex++
          }
        }
      }

      return matrix
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
