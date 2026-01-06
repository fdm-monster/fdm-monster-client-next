import { ref, computed } from 'vue'
import type { PrinterDto } from '@/models/printers/printer.model'
import { PrinterTagService, TagDto, TagWithPrintersDto } from "@/backend/printer-tag.service"
import { useGridStore } from '@/store/grid.store'

export function usePrinterFilters() {
  const gridStore = useGridStore()
  const tags = ref<TagDto[]>([])
  const tagsWithPrinters = ref<TagWithPrintersDto[]>([])

  const selectedTags = computed({
    get: () => gridStore.selectedTagFilter,
    set: (value) => gridStore.setTagFilter(value)
  })
  const selectedPrinterTypes = computed({
    get: () => gridStore.selectedPrinterTypeFilter,
    set: (value) => gridStore.setPrinterTypeFilter(value)
  })

  const loadTags = async () => {
    tagsWithPrinters.value = await PrinterTagService.getTagsWithPrinters()
    tags.value = tagsWithPrinters.value.map(t => ({ id: t.id, name: t.name, color: t.color }))
  }

  // Build a Map for O(1) printer->tags lookup
  const printerTagsMap = computed(() => {
    const map = new Map<number, Set<number>>()
    for (const tag of tagsWithPrinters.value) {
      for (const printerTag of tag.printers) {
        if (!map.has(printerTag.printerId)) {
          map.set(printerTag.printerId, new Set())
        }
        map.get(printerTag.printerId)!.add(tag.id)
      }
    }
    return map
  })

  const matchesTagFilter = (printerId: number): boolean => {
    if (selectedTags.value.length === 0) return true

    const printerTags = printerTagsMap.value.get(printerId)
    if (!printerTags) return false

    return selectedTags.value.every(tagId => printerTags.has(tagId))
  }

  const matchesPrinterTypeFilter = (printer: PrinterDto): boolean => {
    if (selectedPrinterTypes.value.length === 0) return true
    return selectedPrinterTypes.value.includes(printer.printerType)
  }

  const matchesPrinter = (printer: PrinterDto): boolean => {
    return matchesTagFilter(printer.id) && matchesPrinterTypeFilter(printer)
  }

  const filterPrinters = (printers: PrinterDto[]): PrinterDto[] => {
    return printers.filter(matchesPrinter)
  }

  const filterPrinterMatrix = (matrix: (PrinterDto | undefined)[][]): (PrinterDto | undefined)[][] => {
    const hasTagFilter = selectedTags.value.length > 0
    const hasPrinterTypeFilter = selectedPrinterTypes.value.length > 0

    if (!hasTagFilter && !hasPrinterTypeFilter) {
      return matrix
    }

    return matrix.map(row =>
      row.map(printer => {
        if (!printer) return undefined
        return matchesPrinter(printer) ? printer : undefined
      })
    )
  }

  const clearFilters = () => {
    selectedTags.value = []
    selectedPrinterTypes.value = []
  }

  return {
    selectedTags,
    selectedPrinterTypes,
    tags,
    tagsWithPrinters,
    loadTags,
    matchesTagFilter,
    matchesPrinterTypeFilter,
    matchesPrinter,
    filterPrinters,
    filterPrinterMatrix,
    clearFilters
  }
}
