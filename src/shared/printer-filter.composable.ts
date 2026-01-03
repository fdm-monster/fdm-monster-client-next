import { ref } from 'vue'
import type { PrinterDto } from '@/models/printers/printer.model'
import { PrinterTagService, TagDto, TagWithPrintersDto } from "@/backend/printer-tag.service";

export function usePrinterFilters() {
  const selectedTags = ref<number[]>([])
  const selectedPrinterTypes = ref<number[]>([])
  const tags = ref<TagDto[]>([])
  const tagsWithPrinters = ref<TagWithPrintersDto[]>([])

  const loadTags = async () => {
    tagsWithPrinters.value = await PrinterTagService.getTagsWithPrinters()
    tags.value = tagsWithPrinters.value.map(t => ({ id: t.id, name: t.name, color: t.color }))
  }

  const matchesTagFilter = (printerId: number): boolean => {
    if (selectedTags.value.length === 0) return true

    return tagsWithPrinters.value.some(tag =>
      selectedTags.value.includes(tag.id) &&
      tag.printers.some(p => p.printerId === printerId)
    )
  }

  const matchesPrinterTypeFilter = (printer: PrinterDto): boolean => {
    if (selectedPrinterTypes.value.length === 0) return true
    return selectedPrinterTypes.value.includes(printer.printerType)
  }

  const filterPrinters = (printers: PrinterDto[]): PrinterDto[] => {
    return printers.filter(printer =>
      matchesTagFilter(printer.id) && matchesPrinterTypeFilter(printer)
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
    filterPrinters,
    clearFilters
  }
}
