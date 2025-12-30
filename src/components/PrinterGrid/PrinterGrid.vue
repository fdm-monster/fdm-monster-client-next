<template>
  <div>
    <v-banner v-if="gridStore.gridEditMode">
      <v-row style="margin-bottom: -5px">
        <v-col>
          <span>
            Drag {{ floorStore.floorlessPrinters.length }} unplaced printer(s)
            from here to place it on the grid.
          </span>
          <v-chip-group>
            <v-chip
              v-for="printer of floorStore.floorlessPrinters"
              :key="printer.id"
              draggable
              size="small"
              style="cursor: move"
              @dragstart="onDragStart(printer, $event)"
            >
              {{ printer.name }}
            </v-chip>
          </v-chip-group>
        </v-col>
        <v-col>
          <div>
            Clear printers by clicking on
            <strong>
              <v-icon>disabled_visible</v-icon>
              Click to clear
            </strong>
          </div>
        </v-col>
      </v-row>
    </v-banner>

    <div class="printer-grid-container">
      <div
        class="printer-grid"
        :style="gridStyle"
      >
        <div
          v-for="index in totalCells"
          :key="`printer-${getX(index - 1)}-${getY(index - 1)}`"
          class="printer-cell"
          :class="{
            'printer-cell-large': largeTileMode
          }"
        >
          <PrinterGridTile
            :printer="getPrinter(getX(index - 1), getY(index - 1))"
            :x="getX(index - 1)"
            :y="getY(index - 1)"
          />
        </div>
        <!-- Columns increment/decrement -->
        <div
          v-if="gridStore.gridEditMode"
          class="d-flex flex-row justify-start"
          style="gap: 10px; width: 100%"
        >
          Columns
          <v-btn
            x-small
            rounded
            :disabled="settingsStore.gridCols <= 1"
            @click="decrementGridCols()"
          >
            <v-icon>remove</v-icon>
          </v-btn>
          <v-btn
            x-small
            rounded
            :disabled="settingsStore.gridCols >= 12"
            @click="incrementGridCols()"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </div>
      </div>
      <!-- Rows increment/decrement -->
      <div
        v-if="gridStore.gridEditMode"
        class="d-flex flex-column justify-start"
        style="gap: 10px; margin-top: 10px"
      >
        Rows
        <v-btn
          x-small
          rounded
          :disabled="settingsStore.gridRows <= 1"
          @click="decrementGridRows()"
        >
          <v-icon>remove</v-icon>
        </v-btn>
        <v-btn
          x-small
          rounded
          :disabled="settingsStore.gridRows >= 16"
          @click="incrementGridRows()"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </div>
    </div>

    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08; pointer-events: none"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import PrinterGridTile from '@/components/PrinterGrid/PrinterGridTile.vue'
import { usePrinterStore } from '@/store/printer.store'
import { PrinterDto } from '@/models/printers/printer.model'
import { useGridStore } from '@/store/grid.store'
import { dragAppId, INTENT, PrinterPlace } from '@/shared/drag.constants'
import { useSettingsStore } from '@/store/settings.store'
import { useFloorStore } from '@/store/floor.store'
import { PrinterGroupService, GroupWithPrintersDto } from '@/backend/printer-group.service'

const printerStore = usePrinterStore()
const floorStore = useFloorStore()
const settingsStore = useSettingsStore()
const gridStore = useGridStore()
const groupsWithPrinters = ref<GroupWithPrintersDto[]>([])

onMounted(async () => {
  await printerStore.loadPrinters()
  await floorStore.loadFloors()
  groupsWithPrinters.value = await PrinterGroupService.getGroupsWithPrinters()
})

const props = defineProps({
  gap: {
    type: String,
    default: '4px'
  }
})

const printerMatrix = computed(() => {
  const matrix = floorStore.gridSortedPrinters
  const hasTagFilter = gridStore.selectedTagFilter?.length > 0
  const hasPrinterTypeFilter = gridStore.selectedPrinterTypeFilter?.length > 0

  // If no filters, return all printers
  if (!hasTagFilter && !hasPrinterTypeFilter) {
    return matrix
  }

  // Filter printers based on selected tags and printer types
  return matrix.map(row =>
    row.map(printer => {
      if (!printer) return undefined

      // Check tag filter
      let matchesTagFilter = !hasTagFilter
      if (hasTagFilter) {
        matchesTagFilter = groupsWithPrinters.value.some(group =>
          gridStore.selectedTagFilter.includes(group.id) &&
          group.printers.some(p => p.printerId === printer.id)
        )
      }

      // Check printer type filter
      let matchesPrinterType = !hasPrinterTypeFilter
      if (hasPrinterTypeFilter) {
        matchesPrinterType = gridStore.selectedPrinterTypeFilter.includes(printer.printerType)
      }

      // Printer must match both filters (if active)
      return matchesTagFilter && matchesPrinterType ? printer : undefined
    })
  )
})
const columns = computed(() => settingsStore.gridCols)
const rows = computed(() => settingsStore.gridRows)
const largeTileMode = computed(() => settingsStore.largeTiles)

const totalCells = computed(() => rows.value * columns.value)
const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gap: props.gap
}))

const getX = (index: number) => index % columns.value
const getY = (index: number) => Math.floor(index / columns.value)

function onDragStart(printer: PrinterDto, ev: DragEvent) {
  if (!ev.dataTransfer) return
  if (!printer.id) return

  ev.dataTransfer.setData(
    'text',
    JSON.stringify({
      appId: dragAppId,
      intent: INTENT.PRINTER_PLACE,
      printerId: printer.id
    } as PrinterPlace)
  )
}

function getPrinter(col: number, row: number) {
  const x = col
  const y = row
  if (!printerMatrix.value?.length || !printerMatrix.value[x]) return undefined
  return printerMatrix.value[x][y]
}

async function incrementGridRows() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return
  if (settingsStore.frontendSettings.gridRows >= 16) return

  settingsStore.frontendSettings.gridRows++
  await settingsStore.saveFrontendSettings()
}

async function incrementGridCols() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return
  if (settingsStore.frontendSettings.gridCols >= 12) return

  settingsStore.frontendSettings.gridCols++
  await settingsStore.saveFrontendSettings()
}

async function decrementGridRows() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return
  if (settingsStore.frontendSettings.gridRows == 1) return
  settingsStore.frontendSettings.gridRows--
  await settingsStore.saveFrontendSettings()
}

async function decrementGridCols() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return
  if (settingsStore.frontendSettings.gridCols == 1) return
  settingsStore.frontendSettings.gridCols--
  await settingsStore.saveFrontendSettings()
}
</script>

<style scoped>
.printer-grid-container {
  width: 100%;
}

.printer-grid {
  width: 100%;
}

.printer-cell {
  padding: 4px;
}

.printer-cell-large {
  padding: 8px;
}

.grid-bg-img {
  position: fixed;
  height: 100vh;
  top: 50vh;
  width: 600%;
  left: -250%;
  filter: grayscale(100%);
}
</style>
