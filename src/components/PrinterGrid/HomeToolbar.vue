<template>
  <v-toolbar
    flat
    color="surface"
    class="text-on-surface"
  >
    <!-- Floor selection toggle group -->
    <v-btn-toggle
      :model-value="selectedFloorToggleIndex"
      class="ml-4"
      rounded
      mandatory
      @update:model-value="changeFloorIndex"
    >
      <v-btn
        v-for="f in floors"
        :key="f.id"
        size="small"
      >
        <v-icon>layers</v-icon>
        {{ f.name }}
      </v-btn>
    </v-btn-toggle>

    <!-- Tag filter -->
    <PrinterTagFilter
      v-model="selectedTags"
      :groups="groups"
      label="Filter by tags"
      class="ml-4"
      style="max-width: 300px"
      @update:model-value="onTagFilterChange"
    />

    <!-- Printer type filter -->
    <PrinterTypeFilter
      v-model="selectedPrinterTypes"
      label="Filter by type"
      class="ml-2"
      style="max-width: 300px"
      @update:model-value="onPrinterTypeFilterChange"
    />

    <!-- Unplaced printers menu -->
    <v-menu v-if="floorStore.floorlessPrinters.length" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          color="warning"
          variant="tonal"
          size="small"
          class="ml-4"
        >
          <v-icon start>warning</v-icon>
          {{ floorStore.floorlessPrinters.length }} Unplaced
        </v-btn>
      </template>
      <v-card min-width="300">
        <v-card-title class="text-subtitle-1">
          <v-icon class="mr-2" color="warning">warning</v-icon>
          Unplaced Printers
        </v-card-title>
        <v-card-text>
          <div class="text-caption mb-2 text-medium-emphasis">
            Drag these printers onto the grid:
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="printer of floorStore.floorlessPrinters"
              :key="printer.id"
              draggable
              size="small"
              color="warning"
              style="cursor: move"
              @dragstart="onUnplacedDragStart(printer, $event)"
            >
              <v-icon start size="x-small">drag_indicator</v-icon>
              <span class="font-weight-medium">{{ printer.name }}</span>
              <v-chip size="x-small" variant="flat" class="ml-2 px-2" style="height: 18px">
                {{ getServiceName(printer.printerType) }}
              </v-chip>
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-spacer />
    <span class="d-flex flex-wrap gap-2">
      <span class="pr-2">
        <v-icon>print</v-icon>
        {{ printerStateStore.printingCount }}
      </span>
      <span class="pr-2">
        <v-icon>ac_unit</v-icon>
        {{ printerStateStore.operationalNotPrintingCount }}
      </span>
      <span class="pr-2">
        <v-icon>handyman</v-icon>
        {{ printerStore.maintenanceCount }}
      </span>
      <span class="pr-2">
        <v-icon>usb_off</v-icon>
        {{ printerStore.disconnectedCount }}
      </span>
      <span class="pr-2">
        <v-icon>print_disabled</v-icon>
        {{ printerStore.disabledCount }}
      </span>
    </span>

    <!-- Grid size controls - always visible -->
    <GridSizeControl class="ml-4" />

    <!-- Grid settings menu -->
    <GridSettingsMenu class="ml-4" />
  </v-toolbar>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { usePrinterStore } from '@/store/printer.store'
import { useGridStore } from '@/store/grid.store'
import { useFloorStore } from '@/store/floor.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'
import GridSizeControl from '@/components/PrinterGrid/GridSizeControl.vue'
import GridSettingsMenu from '@/components/PrinterGrid/GridSettingsMenu.vue'
import { dragAppId, INTENT, PrinterPlace } from '@/shared/drag.constants'
import { getServiceName } from '@/shared/printer-types.constants'
import type { PrinterDto } from '@/models/printers/printer.model'

const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const gridStore = useGridStore()

const {
  selectedTags,
  selectedPrinterTypes,
  groups,
  loadGroups
} = usePrinterFilters()

const selectedFloorToggleIndex = computed(() => floorStore.selectedFloorIndex)

const floors = computed(() => {
  return floorStore.floors
})

onMounted(async () => {
  await loadGroups()
})

function changeFloorIndex(index: any) {
  floorStore.changeSelectedFloorByIndex(index)
}

function onTagFilterChange(tagIds: number[]) {
  gridStore.setTagFilter(tagIds)
}

function onPrinterTypeFilterChange(typeIds: number[]) {
  gridStore.setPrinterTypeFilter(typeIds)
}

function onUnplacedDragStart(printer: PrinterDto, ev: DragEvent) {
  if (!ev.dataTransfer || !printer.id) return

  ev.dataTransfer.setData(
    'text',
    JSON.stringify({
      appId: dragAppId,
      intent: INTENT.PRINTER_PLACE,
      printerId: printer.id
    } as PrinterPlace)
  )
}
</script>
