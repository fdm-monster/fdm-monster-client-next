<template>
  <div>
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
      </div>
    </div>

    <!-- Drop zone for removing printers from grid - only show when dragging placed printers -->
    <div
      v-show="isDraggingPlacedPrinter"
      class="remove-drop-zone"
      @dragover.prevent
      @dragenter.prevent="onDragEnterRemove"
      @dragleave.prevent="onDragLeaveRemove"
      @drop.prevent="onDropRemove"
    >
      <v-icon size="large" class="mr-2">delete_forever</v-icon>
      <span class="text-h6">Drop here to remove from grid</span>
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
import { dragAppId, INTENT, DRAG_EVENTS } from '@/shared/drag.constants'
import { useSettingsStore } from '@/store/settings.store'
import { useFloorStore } from '@/store/floor.store'
import { FloorService } from '@/backend/floor.service'
import { usePrinterFilters } from '@/shared/printer-filter.composable'

const printerStore = usePrinterStore()
const floorStore = useFloorStore()
const settingsStore = useSettingsStore()
const isDragging = ref(false)
const isDraggingPlacedPrinter = ref(false)
const isOverRemoveZone = ref(false)

const { loadTags, filterPrinterMatrix } = usePrinterFilters()

// Track when dragging placed vs unplaced printers
globalThis.addEventListener('dragstart', (e: any) => {
  isDragging.value = true
})
globalThis.addEventListener('dragend', () => {
  isDragging.value = false
  isDraggingPlacedPrinter.value = false
})

// Custom event from tiles to indicate dragging a placed printer
globalThis.addEventListener(DRAG_EVENTS.TILE_DRAG_START, () => {
  isDraggingPlacedPrinter.value = true
})

onMounted(async () => {
  await printerStore.loadPrinters()
  await floorStore.loadFloors()
  await loadTags()
})

const props = defineProps({
  gap: {
    type: String,
    default: '4px'
  }
})

const printerMatrix = computed(() => {
  return filterPrinterMatrix(floorStore.gridSortedPrinters)
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

function getPrinter(col: number, row: number) {
  const x = col
  const y = row
  if (!printerMatrix.value?.length || !printerMatrix.value[x]) return undefined
  return printerMatrix.value[x][y]
}

function onDragEnterRemove() {
  isOverRemoveZone.value = true
}

function onDragLeaveRemove() {
  isOverRemoveZone.value = false
}

async function onDropRemove(ev: DragEvent) {
  isOverRemoveZone.value = false

  if (!ev.dataTransfer) return

  try {
    const data = JSON.parse(ev.dataTransfer.getData('text'))
    if (data.appId !== dragAppId || data.intent !== INTENT.PRINTER_PLACE) return

    const printerId = data.printerId
    if (!printerId || !floorStore.selectedFloor) return

    // Remove printer from floor
    await FloorService.deletePrinterFromFloor(floorStore.selectedFloor.id, printerId)
    await floorStore.loadFloors()
  } catch (e) {
    console.error('Failed to remove printer from grid:', e)
  }
}

</script>

<style scoped>
.remove-drop-zone {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: rgba(211, 47, 47, 0.3);
  border-top: 3px dashed rgba(211, 47, 47, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background-color 0.2s;
  backdrop-filter: blur(4px);
}

.remove-drop-zone:hover {
  background-color: rgba(211, 47, 47, 0.5);
}

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
