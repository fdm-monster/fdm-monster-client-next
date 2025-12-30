import { ref } from 'vue'
import { PrinterGroupService, GroupDto, GroupWithPrintersDto } from '@/backend/printer-group.service'
import type { PrinterDto } from '@/models/printers/printer.model'

export function usePrinterFilters() {
  const selectedTags = ref<number[]>([])
  const selectedPrinterTypes = ref<number[]>([])
  const groups = ref<GroupDto[]>([])
  const groupsWithPrinters = ref<GroupWithPrintersDto[]>([])

  const loadGroups = async () => {
    groupsWithPrinters.value = await PrinterGroupService.getGroupsWithPrinters()
    groups.value = groupsWithPrinters.value.map(g => ({ id: g.id, name: g.name }))
  }

  const matchesTagFilter = (printerId: number): boolean => {
    if (selectedTags.value.length === 0) return true

    return groupsWithPrinters.value.some(group =>
      selectedTags.value.includes(group.id) &&
      group.printers.some(p => p.printerId === printerId)
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
    groups,
    groupsWithPrinters,
    loadGroups,
    matchesTagFilter,
    matchesPrinterTypeFilter,
    filterPrinters,
    clearFilters
  }
}
