import {
  isPrinterPlaceDataTransfer,
  PrinterPlace
} from '@/shared/drag.constants'
import { FloorService } from '@/backend/floor.service'
import { useFloorStore } from '@/store/floor.store'
import { PrinterDto } from '@/models/printers/printer.model'
import { AppContext, Directive } from 'vue'

interface PrinterBindingValue {
  printerSet: PrinterDto | null
  x: number
  y: number
}

const defaultBorder = 'none' // Remove default border
const hoverBorder = '2px dashed rgba(255, 255, 255, 0.4)'

const bindDropConditionally = (
  el: HTMLElement,
  bindingValue: PrinterBindingValue,
  context?: AppContext | null
) => {
  const printerSet = bindingValue?.printerSet

  const floorStore = useFloorStore()

  el.style.border = defaultBorder
  el.ondrop = async (e) => {
    el.style.border = defaultBorder
    e.preventDefault()
    if (!e.dataTransfer) {
      return
    }

    const buffer = e.dataTransfer.getData('text')
    const data = JSON.parse(buffer) as PrinterPlace
    const isRecognized = isPrinterPlaceDataTransfer(data)
    if (!isRecognized) {
      console.debug('Drop not recognized', data)
      return
    }

    const floorId = floorStore.selectedFloor?.id
    if (!floorId) throw new Error('Floor is not set')
    const printerId = data.printerId
    if (!printerId) throw new Error('PrinterId was not provided')

    // If dropping on an occupied position, swap the printers
    if (printerSet && printerSet.id !== printerId) {
      const targetPrinter = printerSet
      const targetPosition = floorStore.selectedFloor?.printers.find(
        p => p.printerId === targetPrinter.id
      )
      const draggedPosition = floorStore.selectedFloor?.printers.find(
        p => p.printerId === printerId
      )

      if (targetPosition && draggedPosition) {
        // Swap positions: move target to dragged position first
        await FloorService.addPrinterToFloor(floorId, {
          printerId: targetPrinter.id,
          x: draggedPosition.x,
          y: draggedPosition.y
        })
      }
    }

    // Place the dragged printer at the target position
    await FloorService.addPrinterToFloor(floorId, {
      printerId,
      x: bindingValue.x,
      y: bindingValue.y
    })
  }
  el.ondragover = (ev: DragEvent) => {
    if (!ev?.dataTransfer) {
      return
    }

    if (
      ev.dataTransfer &&
      Array.from(ev.dataTransfer.items).filter((i) => i.kind === 'file').length
    ) {
      return
    }
    el.style.border = hoverBorder
    ev.preventDefault()
  }
  el.ondragleave = (ev: DragEvent) => {
    el.style.border = defaultBorder
    ev.preventDefault()
  }
}

export function getDropPrinterPositionDirective(): Directive {
  return {
    mounted: (el, binding, vnode) => {
      bindDropConditionally(el, binding.value, vnode.appContext)
    },
    beforeUpdate: (el, binding, vnode) => {
      bindDropConditionally(el, binding.value, vnode.appContext)
    }
  }
}
