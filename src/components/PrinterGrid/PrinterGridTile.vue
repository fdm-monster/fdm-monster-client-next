<template>
  <div v-drop-printer-position="{ x, y, printerSet: printer }">
    <v-card
      v-drop-upload="{ printers: [printer] }"
      :draggable="!!printer"
      :ripple="isOnline"
      :class="{
        'tile-large': largeTilesEnabled,
        'tile-selected': selected,
        'tile-unselected': unselected,
        'tile-no-printer': !printer,
        'tile-draggable': !!printer
      }"
      class="tile colored-tile rounded-lg"
      elevation="5"
      @click="selectPrinterPosition()"
      @dragstart="onDragStart"
    >
      <div
        v-show="printer"
        class="printer-title"
      >
        {{ printer?.name ?? '&nbsp;' }}
      </div>

      <!-- Temperatures - positioned as overlay in top left -->
      <div
        v-if="printer && (toolTemp || bedTemp)"
        class="temperature-overlay"
      >
        <small v-if="toolTemp" class="temp-item">
          🔥 {{ toolTemp }}
        </small>
        <small v-if="bedTemp" class="temp-item">
          🛏️ {{ bedTemp }}
        </small>
      </div>

      <!-- Create printer or no printers message -->
      <div
        v-if="!printer"
        :style="{
          height: largeTilesEnabled ? 'calc(120px - 20px)' : 'calc(84px - 20px)'
        }"
        :class="isFirstTile&& noPrintersExist ? 'plus-always-visible': 'plus-hover-icon'"
        style="position: absolute"
      >
        <div
          class="d-flex flex flex-column justify-center align-center"
          style="height: 100%"
        >
          <PrinterCreateAction
            :floor-id="floorStore.selectedFloor?.id"
            :floor-x="x"
            :floor-y="y"
            :is-first-time="isFirstTile && noPrintersExist"
          />
        </div>
      </div>

      <div
        v-if="!!printer && isOnline"
        class="printer-file-or-stream-viewer"
      >
        <v-img
          v-if="!thumbnail?.length"
          :src="logoPng"
          :width="tileIconThumbnailSize"
          alt="No thumbnail was found in GCode"
          style="opacity: 0.3; filter: grayscale(100%)"
        />
        <v-img
          v-else
          :src="'data:image/png;base64,' + (thumbnail ?? '')"
          :width="tileIconThumbnailSize"
        />
      </div>
      <div
        v-else-if="!!printer"
        class="printer-file-or-stream-viewer"
      >
        <v-icon
          v-if="printerState?.text.includes('API')"
          :size="tileIconThumbnailSize"
          color="secondary"
        >
          wifi_off
        </v-icon>
        <v-icon
          v-if="!printer.enabled"
          :size="tileIconThumbnailSize"
          color="secondary"
        >
          disabled_by_default
        </v-icon>
        <v-icon
          v-if="printerState?.text.includes('unset')"
          :size="tileIconThumbnailSize"
          color="secondary"
        >
          question_mark
        </v-icon>
      </div>

      <div
        v-if="printer"
        class="printer-menu"
      >
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              elevation="2"
              size="x-small"
              rounded="xl"
              v-bind="props"
              @click.prevent.stop="clickInfo()"
            >
              <v-icon size="16">folder</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Files</template>
        </v-tooltip>

        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              color="info"
              elevation="2"
              size="x-small"
              rounded="xl"
              v-bind="props"
              @click.prevent.stop="clickShowCurrentJob()"
            >
              <v-icon size="16">work</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>
            View Printer Jobs
          </template>
        </v-tooltip>
      </div>

      <div
        v-if="printer"
        :style="{
          position: largeTilesEnabled ? 'inherit' : 'absolute',
          top: largeTilesEnabled ? 'inherit' : '28px'
        }"
        class="printer-info"
        style="overflow: clip"
      >
        <!-- File name -->
        <small class="file-name">
          {{ currentPrintingFilePath ?? 'No File' }}
        </small>
      </div>

      <!-- Hover controls -->
      <div
        v-if="printer"
        class="centered-controls"
      >
        <v-tooltip top>
          <template v-slot:activator="{ props }">
            <v-btn
              :disabled="!isOnline || !isOperational"
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="props"
              @click.prevent.stop="clickOpenPrinterControlDialog()"
            >
              <v-icon>open_with</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Move and home printer</template>
        </v-tooltip>

        <v-tooltip v-if="hasSerialConnection(printer.printerType)" top>
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              v-if="!isOperational && isOnline"
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="tooltipProps"
              @click.prevent.stop="clickConnectUsb()"
            >
              <v-icon>usb</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Connect USB (only for OctoPrint)</template>
        </v-tooltip>

        <v-tooltip v-if="hasPrinterControl(printer.printerType)" top>
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="tooltipProps"
              @click.prevent.stop="clickRefreshSocket()"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
          </template>
          <template v-slot:default
          >Reload printer connection and refresh all states
          </template>
        </v-tooltip>

        <v-tooltip v-if="hasPrinterControl(printer.printerType)" top>
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              :disabled="!isOnline || (!isPaused && !isPrinting)"
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="tooltipProps"
              @click.prevent.stop="
                isPaused ? clickResumePrint() : clickPausePrint()
              "
            >
              <v-icon v-if="!isPaused">pause</v-icon>
              <v-icon v-if="isPaused">play_arrow</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>
            {{ isPaused ? 'Resume print' : 'Pause print' }}
          </template>
        </v-tooltip>

        <v-tooltip
          v-if="hasPrinterControl(printer.printerType) && (hasEmergencyStop(printer.printerType) || preferCancelOverQuickStop)"
          top
        >
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              :disabled="
                !isOnline ||
                (preferCancelOverQuickStop && !isPrinting && !isPaused)
              "
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="tooltipProps"
              @click.prevent.stop="
                preferCancelOverQuickStop ? clickStop() : clickQuickStop()
              "
            >
              <v-icon
              >{{ preferCancelOverQuickStop ? 'stop' : 'dangerous' }}
              </v-icon>
            </v-btn>
          </template>
          <template v-slot:default
          >{{
              preferCancelOverQuickStop
                ? 'Cancel current print gracefully'
                : 'Perform quick stop of printer'
            }}
          </template>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ props }">
            <v-btn
              :size="largeTilesEnabled ? 'small' : 'x-small'"
              color="darkgray"
              elevation="0"
              style="border-radius: 7px"
              v-bind="props"
              @click.prevent.stop="clickOpenSettings()"
            >
              <v-icon>settings</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Open printer settings</template>
        </v-tooltip>
      </div>

      <!-- Progress Bar -->
      <v-progress-linear
        v-if="printer"
        :model-value="currentProgress"
        background-color="dark-gray"
        class="progress-bar"
        height="14"
      >
        <template v-slot:default="{ value }">
          <strong>
            {{ value?.toFixed(1) + '%' }}
          </strong>

          <v-tooltip
            :disabled="printer?.enabled"
            :close-delay="100"
            color="danger"
            :open-delay="0"
            top
          >
            <template v-slot:activator="{ props }">
              <span
                class="xsmall-resized-font text--secondary ml-sm-2"
                v-bind="props"
              >
                <span v-if="printer?.disabledReason">
                  <small> MAINTENANCE</small>
                  <v-icon
                    class="d-none d-xl-inline"
                    color="primary"
                    small
                  >info</v-icon
                  >
                </span>
                <span v-else>
                  <small
                    :style="{
                      'background-color': printerStateColor + '99',
                      'border-left': '5px solid ' + printerStateColor + 'ff',
                      padding: '5px'
                    }"
                  >
                    {{ printerState?.text?.toUpperCase() }}
                  </small>
                </span>
              </span>
            </template>

            <template #default>
              <span>
                {{ printer?.disabledReason ?? 'Printer disabled' }}
              </span>
            </template>
          </v-tooltip>
        </template>
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { PrintersService } from '@/backend'
import { usePrinterStore } from '@/store/printer.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useSettingsStore } from '@/store/settings.store'
import { useFloorStore } from '@/store/floor.store'
import { interpretStates } from '@/shared/printer-state.constants'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { PrinterDto } from '@/models/printers/printer.model'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useDialog } from '@/shared/dialog.composable'
import { useThumbnailQuery } from '@/queries/thumbnail.query'
import { useFileExplorer } from '@/shared/file-explorer.composable'
import { dragAppId, INTENT, PrinterPlace, DRAG_EVENTS } from '@/shared/drag.constants'
import { hasEmergencyStop, hasPrinterControl, hasSerialConnection } from '@/shared/printer-capabilities.constants'
import logoPng from '@/assets/logo.png'

const defaultColor = 'rgba(100,100,100,0.1)'

const props = defineProps({
  printer: {
    type: Object as PropType<PrinterDto | undefined>,
    required: false
  },
  x: { type: Number, required: true },
  y: { type: Number, required: true }
})

const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const settingsStore = useSettingsStore()
const controlDialog = useDialog(DialogName.PrinterControlDialog)
const addOrUpdateDialog = useDialog(DialogName.AddOrUpdatePrinterDialog)
const fileExplorer = useFileExplorer()
const snackbar = useSnackbar()
const router = useRouter()

const printerId = computed(() => props.printer?.id)

const isFirstTile = computed(() => props.x === 0 && props.y === 0)
const noPrintersExist = computed(() => printerStore.printers.length === 0)

const largeTilesEnabled = computed(() => settingsStore.largeTiles)
const tileIconThumbnailSize = computed(() =>
  largeTilesEnabled.value ? '80px' : '40px'
)

const { data: thumbnail } = useThumbnailQuery(printerId)

const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
)

const isOperational = computed(() =>
  printerId.value
    ? printerStateStore.isPrinterOperational(printerId.value)
    : false
)

const isPrinting = computed(() => {
  return printerId.value
    ? printerStateStore.isPrinterPrinting(printerId.value)
    : false
})

const isPaused = computed(() => {
  if (!printerId.value) return false

  return printerStateStore.isPrinterPaused(printerId.value)
})

const selected = computed(() => {
  if (!printerId.value) return false
  return printerStore.isSelectedPrinter(printerId.value)
})

const unselected = computed(() => {
  return printerStore.selectedPrinters?.length && !selected.value
})

const preferCancelOverQuickStop = computed(() => {
  return settingsStore.preferCancelOverQuickStop
})

const printerState = computed(() => {
  if (!printerId.value) return
  const printer = printerStore.printer(printerId.value)
  if (!printer) return

  const printerEvents = printerStateStore.printerEventsById[printerId.value]
  const socketState = printerStateStore.socketStatesById[printerId.value]
  return interpretStates(printer, socketState, printerEvents)
})

const printerStateColor = computed(() => {
  const states = printerState.value
  if (!states) {
    return defaultColor
  }
  return states.rgb || defaultColor
})

const currentJob = computed(() => {
  if (!printerId.value) return
  return printerStateStore.printerJobsById[printerId.value]
})

const currentProgress = computed(() => {
  if (!printerId.value) return undefined

  const job = currentJob.value
  return job?.progress?.completion
})

const currentPrintingFilePath = computed(() => {
  if (!printerId.value) return
  return printerStateStore.printingFilePathsByPrinterId[printerId.value]
})

const currentTemperatures = computed(() => {
  if (!printerId.value) return null
  const printerEvents = printerStateStore.printerEventsById[printerId.value]
  if (!printerEvents?.current?.payload?.temps || printerEvents.current.payload.temps.length === 0) {
    return null
  }
  // Get the most recent temperature reading
  return printerEvents.current.payload.temps[printerEvents.current.payload.temps.length - 1]
})

const toolTemp = computed(() => {
  const temps = currentTemperatures.value
  return temps?.tool0 ? `${Math.round(temps.tool0.actual)}°/${Math.round(temps.tool0.target)}°` : null
})

const bedTemp = computed(() => {
  const temps = currentTemperatures.value
  return temps?.bed ? `${Math.round(temps.bed.actual)}°/${Math.round(temps.bed.target)}°` : null
})

const clickStop = async () => {
  if (!printerId.value) return

  await printerStore.sendStopJobCommand(printerId.value)
}

const clickPausePrint = async () => {
  if (!printerId.value) return

  await PrintersService.pausePrintJob(printerId.value)
}

const clickResumePrint = async () => {
  if (!printerId.value) return

  await PrintersService.resumePrintJob(printerId.value)
}

const clickInfo = () => {
  if (!props.printer) return
  fileExplorer.openFileExplorer(props.printer)
}

const clickRefreshSocket = async () => {
  if (!printerId.value) return
  await PrintersService.refreshSocket(printerId.value)
  snackbar.openInfoMessage({
    title: 'Refreshing connection state'
  })
}

const onDragStart = (ev: DragEvent) => {
  if (!ev.dataTransfer || !props.printer?.id) return

  // Notify that we're dragging a placed printer (for showing remove zone)
  globalThis.dispatchEvent(new CustomEvent(DRAG_EVENTS.TILE_DRAG_START))

  ev.dataTransfer.setData(
    'text',
    JSON.stringify({
      appId: dragAppId,
      intent: INTENT.PRINTER_PLACE,
      printerId: props.printer.id
    } as PrinterPlace)
  )
}

const clickOpenSettings = () => {
  const printer = props.printer
  if (!printer) return
  addOrUpdateDialog.openDialog({ id: printer.id })
}

const clickShowCurrentJob = async () => {
  if (!printerId.value) {
    snackbar.openInfoMessage({
      title: 'No Printer',
      subtitle: 'No printer to find jobs for'
    })
    return
  }

  await router.push({
    path: '/jobs',
    query: { printerId: printerId.value.toString() }
  })
}

const clickOpenPrinterControlDialog = async () => {
  if (!printerId.value || !props.printer) {
    throw new Error('PrinterId not set, cant open dialog')
  }

  await controlDialog.openDialog({ printer: props.printer })
}

const clickQuickStop = async () => {
  if (!printerId.value) return

  if (
    confirm(
      'Are you sure to abort the print in Quick Stop mode? Please reconnect after.'
    )
  ) {
    await PrintersService.postQuickStopM112Command(printerId.value)
  }
}

const clickConnectUsb = async () => {
  if (!printerId.value) return
  await PrintersService.sendPrinterConnectCommand(printerId.value)
}

const selectPrinterPosition = async () => {
  if (!props.printer || !printerId.value) {
    return
  }

  printerStore.toggleSelectedPrinter(props.printer)
}
</script>

<style>
.tile {
  min-height: 84px;
  max-height: 92px;
}

.tile-large {
  min-height: 120px;
}

.colored-tile {
  padding: 8px;
  color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.2s;
}

.tile-selected {
  outline: 2px solid rgb(var(--v-theme-primary));
  opacity: 1;
}

.tile.tile-no-printer {
  background-color: #171717;
  height: 84px;
  border: 2px #3a3a3a dashed !important;
  outline: none;
}

.tile.tile-large {
  min-height: 120px;
}

.tile-draggable {
  cursor: move;
}

.tile-draggable:active {
  opacity: 0.7;
}

.tile-no-printer:hover {
  background-color: #2a2a2a;
  cursor: not-allowed;
}

.plus-hover-icon {
  display: none;
}

.plus-always-visible {
  display: block !important;
}

.tile-no-printer:hover .plus-hover-icon {
  display: block;
}

.tile:hover .plus-hover-icon {
  display: block;
}

.printer-title {
  font-size: 16px !important;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
}

.printer-file-or-stream-viewer {
  position: absolute;
  left: 16px;
  height: calc(100% - 36px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.printer-menu {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.temperature-overlay {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 3px 5px;
  border-radius: 6px;
}

.printer-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 4px;
  gap: 0;
}

.file-name {
  font-size: 11px;
  color: #ffffff;
  max-width: 80%;
  display: block;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.3;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
}

.temp-item {
  font-size: 9px;
  color: #ffffff;
  white-space: nowrap;
  line-height: 1.3;
}

.centered-controls {
  opacity: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
  transition: opacity 0.2s;
}

.colored-tile:hover .centered-controls {
  opacity: 1;
}

.control-icons v-btn {
  color: #ffffff;
}

.progress-bar {
  width: 100%;
  background-color: #2c2c2c;
  border-radius: 7px !important;
}
</style>
