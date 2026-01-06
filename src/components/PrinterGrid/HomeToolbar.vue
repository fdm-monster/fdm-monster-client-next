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
      :tags="tags"
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

    <!-- Sort mode toggle -->
    <v-btn-toggle
      :model-value="sortModeIndex"
      class="ml-4"
      rounded
      mandatory
      @update:model-value="onSortModeChange"
    >
      <v-btn
        size="small"
        title="Position mode - Sort by grid position"
      >
        <v-icon>grid_on</v-icon>
        Position
      </v-btn>
      <v-btn
        size="small"
        title="Name mode - Sort alphabetically (Shift+S)"
      >
        <v-icon>sort_by_alpha</v-icon>
        Name
      </v-btn>
    </v-btn-toggle>

    <!-- Auto Place button -->
    <v-btn
      v-if="floorStore.floorlessPrinters.length"
      color="primary"
      variant="elevated"
      size="small"
      class="ml-4"
      @click="autoPlacePrinters"
      :loading="autoPlacing"
    >
      <v-icon start>grid_on</v-icon>
      Auto Place
    </v-btn>

    <!-- Unplaced printers menu -->
    <v-menu v-if="floorStore.floorlessPrinters.length" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          color="warning"
          variant="tonal"
          size="small"
          class="ml-2"
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
            Drag these printers onto the grid or use Auto Place:
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
                {{ getPrinterTypeName(printer.printerType) }}
              </v-chip>
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-spacer />

    <!-- Grid size controls - always visible -->
    <GridSizeControl class="ml-4" />

    <!-- Grid settings menu -->
    <GridSettingsMenu class="ml-4" />
  </v-toolbar>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGridStore } from '@/store/grid.store'
import { useFloorStore } from '@/store/floor.store'
import { useSettingsStore } from '@/store/settings.store'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'
import GridSizeControl from '@/components/PrinterGrid/GridSizeControl.vue'
import GridSettingsMenu from '@/components/PrinterGrid/GridSettingsMenu.vue'
import { dragAppId, INTENT, PrinterPlace } from '@/shared/drag.constants'
import { getPrinterTypeName } from '@/shared/printer-types.constants'
import type { PrinterDto } from '@/models/printers/printer.model'

const floorStore = useFloorStore()
const gridStore = useGridStore()
const settingsStore = useSettingsStore()
const autoPlacing = ref(false)

const {
  selectedTags,
  selectedPrinterTypes,
  tags,
  loadTags
} = usePrinterFilters()

const selectedFloorToggleIndex = computed(() => floorStore.selectedFloorIndex)

const floors = computed(() => {
  return floorStore.floors
})

const sortModeIndex = computed(() => {
  return gridStore.sortMode === 'position' ? 0 : 1
})

// Keyboard shortcut handler
function handleKeyDown(event: KeyboardEvent) {
  // Shift+S toggles sort mode
  if (event.shiftKey && event.key.toLowerCase() === 's') {
    event.preventDefault()
    gridStore.toggleSortMode()
  }
}

onMounted(async () => {
  await loadTags()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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

function onSortModeChange(index: number) {
  gridStore.setSortMode(index === 0 ? 'position' : 'name')
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

async function autoPlacePrinters() {
  if (!floorStore.selectedFloor) return

  autoPlacing.value = true
  try {
    // Sort printers by type, then alphabetically by name
    const sortedPrinters = [...floorStore.floorlessPrinters].sort((a, b) => {
      if (a.printerType !== b.printerType) {
        return a.printerType - b.printerType
      }
      return a.name.localeCompare(b.name)
    })

    // Get current grid size
    const gridCols = settingsStore.gridCols
    const gridRows = settingsStore.gridRows

    // Get occupied positions
    const occupiedPositions = new Set(
      floorStore.selectedFloor.printers.map(p => `${p.x},${p.y}`)
    )

    // Find available positions
    const availablePositions: { x: number; y: number }[] = []
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const posKey = `${x},${y}`
        if (!occupiedPositions.has(posKey)) {
          availablePositions.push({ x, y })
        }
      }
    }

    // Place each printer in the next available position
    const printersToPlace = Math.min(sortedPrinters.length, availablePositions.length)
    for (let i = 0; i < printersToPlace; i++) {
      const printer = sortedPrinters[i]
      const position = availablePositions[i]
      await floorStore.addPrinterToFloor({
        floorId: floorStore.selectedFloor.id,
        printerId: printer.id,
        x: position.x,
        y: position.y
      })
    }
  } catch (error) {
    console.error('Failed to auto-place printers:', error)
  } finally {
    autoPlacing.value = false
  }
}
</script>
