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

const defaultBorder = '1px solid #2b2a27'
const hoverBorder = '1px solid gray'

const bindDropConditionally = (
  el: HTMLElement,
  bindingValue: PrinterBindingValue,
  context?: AppContext | null
) => {
  const printerSet = bindingValue?.printerSet

  const floorStore = useFloorStore()

  // If a printer is placed, we will not (yet) allow placing another printer
  if (printerSet) {
    el.ondrop = null
    el.ondragover = null
    el.ondragleave = null
    return
  }

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
