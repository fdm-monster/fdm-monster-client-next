<template>
  <v-navigation-drawer
    v-model="drawerOpened"
    loading="true"
    absolute
    location="right"
    scrim="white"
    temporary
    width="700"
    @close="closeDrawer()"
  >
    <v-list-item
      v-if="storedSideNavPrinter"
      lines="two"
    >
      <template #prepend>
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn
              :size="iconSize"
              v-bind="props"
              icon
              class="mr-4 mt-1"
              color="primary"
              @click="openPrinterURL()"
              @click.middle="openPrinterURL()"
            >
              <v-avatar
                :size="iconSize"
                class="font-weight-bold"
                color="primary"
              >
                {{ avatarInitials() }}
              </v-avatar>
            </v-btn>
          </template>
          <span> Visit the {{ serviceName }} associated to this printer </span>
        </v-tooltip>
      </template>

      <v-list-item-title class="font-weight-bold">
        {{ storedSideNavPrinter.name }}
      </v-list-item-title>

      <!-- Spacer -->
      <v-list-item-subtitle />

      <v-list-item-media>
        <strong
          v-if="!isEnabled || !isOnline"
          class="d-flex justify-center static-disabled"
        >
          {{ isEnabled ? 'Enabled' : 'Disabled' }} -
          {{ !isOnline ? 'Offline' : printerState?.text?.toUpperCase() }}
        </strong>
        <strong
          v-if="isEnabled && printerState?.text && isOperational && isOnline"
          class="pulsating-red d-flex justify-center"
        >
          Enabled - {{ printerState?.text }}
        </strong>
      </v-list-item-media>

      <v-list-item-subtitle v-if="currentJob">
        <span
          v-if="currentJob?.progress"
          class="d-flex justify-center"
        >
          Progress:
          {{ truncateProgress(currentJob?.progress.completion) }}%
        </span>
        <v-progress-linear
          v-if="currentJob?.progress"
          :model-value="truncateProgress(currentJob.progress?.completion)"
          class="mt-1 mb-1"
          height="8px"
        />
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn
              variant="outlined"
              size="small"
              v-bind="props"
            >
              {{ currentPrintingFilePath }}
            </v-btn>
          </template>
          <span>
            {{ currentPrintingFilePath }}
          </span>
        </v-tooltip>
      </v-list-item-subtitle>
    </v-list-item>

    <v-alert
      v-if="!isEnabled || !isOnline"
      color="primary"
    >
      <span v-if="!isEnabled">
        Disabled {{ serviceName }}, enable it first to get live updates
      </span>
      <span v-else>
        This {{ serviceName }} seems unreachable... Will keep trying for you
        <v-icon>hourglass_top</v-icon>
      </span>
    </v-alert>
    <v-alert
      v-if="
        !storedSideNavPrinter?.enabled && !storedSideNavPrinter?.disabledReason
      "
      color="secondary"
    >
      This {{ serviceName }} was disabled without reason.
    </v-alert>
    <v-alert
      v-if="storedSideNavPrinter?.disabledReason"
      color="black"
    >
      This {{ serviceName }} was disabled for maintenance: <br />
      <small> &nbsp;&nbsp;{{ storedSideNavPrinter?.disabledReason }} </small>
    </v-alert>

    <v-divider />

    <v-list
      v-drop-upload="{ printers: [storedSideNavPrinter] }"
      density="compact"
    >
      <v-list-subheader inset> Manage FDM Monster instance </v-list-subheader>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="openPrinterURL()"
          >
            <template #prepend>
              <v-avatar
                class="ml-3 mr-6 ma-5"
                :size="iconSize"
              >
                <v-img
                  v-if="isOctoPrint"
                  src="/img/octoprint-tentacle.svg"
                />
                <span v-else>MO</span>
              </v-avatar>
            </template>
            <span> Open {{ serviceName }} </span>
          </v-list-item>
        </template>
        <span> Visit the {{ serviceName }} associated to this printer </span>
      </v-tooltip>

      <v-tooltip
        location="left"
        v-if="isMoonraker"
      >
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="openPrinterMainsail()"
          >
            <template #prepend>
              <v-avatar
                class="ml-3 mr-6 ma-5"
                :size="iconSize"
              >
                <span>MA</span>
              </v-avatar>
            </template>
            <span> Open Mainsail </span>
          </v-list-item>
        </template>
        <span> Visit the Mainsail for this printer </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="toggleEnabled()"
          >
            <template #prepend>
              <v-avatar
                :size="iconSize"
                color="grey-lighten-1"
              >
                <v-icon :color="isEnabled ? 'primary' : 'green'"> dns </v-icon>
              </v-avatar>
            </template>
            <span v-if="isEnabled"> Disable Printer Location </span>
            <span v-else-if="!isEnabled"> Enable Printer Location </span>
          </v-list-item>
        </template>
        <span> Deactivate connection, without impacting print </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="toggleMaintenance()"
          >
            <v-avatar
              :size="iconSize"
              color="grey-lighten-1"
            >
              <v-icon :color="!isUnderMaintenance ? 'primary' : 'green'">
                construction
              </v-icon>
            </v-avatar>
            <span v-if="!isUnderMaintenance"> Enable Maintenance </span>
            <span v-else-if="isUnderMaintenance"> Complete Maintenance </span>
          </v-list-item>
        </template>
        <span> Deactivate, set under repair, without impacting print </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="refreshSocketState()"
          >
            <v-avatar :size="iconSize">
              <v-icon
                :color="!isUnderMaintenance ? 'primary' : 'green'"
                class="grey-lighten-1"
              >
                autorenew
              </v-icon>
            </v-avatar>
            <span>
              Refresh State <small> - this does not affect the print! </small>
            </span>
          </v-list-item>
        </template>
        <span>
          Let FDM Monster know you are experiencing inconsistencies, reset all
          volatile states
        </span>
      </v-tooltip>

      <v-divider />
      <v-list-subheader inset> Commands </v-list-subheader>
      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            :disabled="!storedSideNavPrinter?.enabled || !isOnline"
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="togglePrinterConnection()"
          >
            <v-avatar :size="iconSize">
              <v-icon> usb </v-icon>
            </v-avatar>
            <span v-if="isStoppable"> Disconnect USB & Stop Print </span>
            <span v-else-if="isOperational"> Disconnect USB </span>
            <span v-else> Connect USB </span>
          </v-list-item>
        </template>
        <span> Disconnect USB, disrupting any print </span>
      </v-tooltip>

      <v-tooltip
        v-if="featureStore.hasFeature('pauseResumePrinterCommand')"
        location="left"
      >
        <template #activator="{ props }">
          <v-list-item
            :disabled="!isOnline || !isPrinting"
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="
              isPaused ? clickResumePrint() : clickPausePrint()
            "
          >
            <v-avatar :size="iconSize">
              <v-icon v-if="!isPaused"> pause </v-icon>
              <v-icon v-if="isPaused"> play_circle_outline </v-icon>
            </v-avatar>
            {{ isPaused ? 'Resume print' : 'Pause print' }}
          </v-list-item>
        </template>
        <span> Send Pause or Resume command </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            :disabled="!isStoppable"
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="clickStopPrint()"
          >
            <v-avatar :size="iconSize">
              <v-icon> stop </v-icon>
            </v-avatar>
            Cancel print
          </v-list-item>
        </template>
        <span> Cancel print gracefully </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            :disabled="!canBeCleared"
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="clickClearFiles()"
          >
            <v-avatar :size="iconSize">
              <v-icon> delete </v-icon>
            </v-avatar>
            Delete files
          </v-list-item>
        </template>
        <span> Clear all files present on OctoPrint (local) </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="refreshFiles()"
          >
            <v-avatar :size="iconSize">
              <v-icon> refresh </v-icon>
            </v-avatar>
            Refresh files
          </v-list-item>
        </template>
        <span> Rebuild the file list on OctoPrint (local) </span>
      </v-tooltip>

      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="props"
            @click.prevent.stop="clickSettings()"
          >
            <v-avatar :size="iconSize">
              <v-icon> settings </v-icon>
            </v-avatar>
            Settings
          </v-list-item>
        </template>
        <span> Edit the printer settings </span>
      </v-tooltip>
    </v-list>

    <v-divider />

    <v-list
      v-drop-upload="{ printers: [storedSideNavPrinter] }"
      density="compact"
    >
      <v-list-subheader inset> Files - drag 'n drop! </v-list-subheader>
      <v-text-field
        v-model="fileSearch"
        class="ml-5 mr-5"
        clearable
        label="Search files..."
        prepend-icon="search"
      />
      <!-- Empty file list -->
      <v-list-item v-if="!filesListed.length">
        <v-avatar :size="iconSize">
          <v-icon> clear </v-icon>
        </v-avatar>
        <v-list-item-title> No files to show </v-list-item-title>
      </v-list-item>

      <!-- Loading file list-->
      <v-progress-linear
        v-if="loading"
        indeterminate
      />
      <v-list-item
        v-for="(file, index) in filesListed"
        :key="index"
        density="compact"
        link
        style="padding-top: 0"
      >
        <v-avatar :size="iconSize">
          <v-tooltip location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                @click="clickDownloadFile(file.path)"
              >
                <v-icon> download </v-icon>
              </v-btn>
            </template>
            <span> Download GCode </span>
          </v-tooltip>
        </v-avatar>

        <v-list-item-action>
          <v-tooltip location="left">
            <template #activator="{ props }">
              <v-btn
                :disabled="isFileBeingPrinted(file)"
                icon
                v-bind="props"
                @click="clickPrintFile(file)"
              >
                <v-icon> play_arrow </v-icon>
              </v-btn>
            </template>
            <span> Select & Print </span>
          </v-tooltip>
        </v-list-item-action>

        <v-tooltip location="left">
          <template #activator="{ props }">
            <span
              :class="{ 'current-file-print': isFileBeingPrinted(file) }"
              v-bind="props"
            >
              {{ file.path }}
            </span>
          </template>
          <span>
            File: {{ file.path }} <br />
            Size: {{ formatBytes(file.size) }} <br />
            <strong>
              {{ isFileBeingPrinted(file) ? 'Printing' : 'Unused' }}
            </strong>
          </span>
        </v-tooltip>

        <v-list-item-action>
          <v-tooltip location="left">
            <template #activator="{ props }">
              <v-btn
                :disabled="isFileBeingPrinted(file)"
                v-bind="props"
                @click="deleteFile(file)"
              >
                <v-icon color="grey-lighten-1"> delete </v-icon>
              </v-btn>
            </template>
            <span> Delete file </span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { generateInitials } from '@/shared/noun-adjectives.data'
import { PrinterFileService, PrintersService } from '@/backend'
import { FileDto } from '@/models/printers/printer-file.model'
import { formatBytes } from '@/utils/file-size.util'
import { usePrinterStore } from '@/store/printer.store'
import { DialogName } from './Dialogs/dialog.constants'
import { PrinterJobService } from '@/backend/printer-job.service'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { interpretStates } from '@/shared/printer-state.constants'
import { useSettingsStore } from '@/store/settings.store'
import { useFeatureStore } from '@/store/features.store'
import {
  getServiceName,
  isMoonrakerType,
  isOctoPrintType
} from '@/utils/printer-type.utils'
import { useDialog } from '@/shared/dialog.composable'

const printersStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const featureStore = useFeatureStore()

const iconSize = ref(36)
const fileSearch = ref<string | undefined>(undefined)
const shownFileCache = ref<FileDto[] | undefined>(undefined)
const drawerOpened = ref(false)
const loading = ref(true)
const storedSideNavPrinter = computed(() => printersStore.sideNavPrinter)
const printerId = computed(() => storedSideNavPrinter.value?.id)
const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
)

const isOctoPrint = computed(() => {
  return isOctoPrintType(storedSideNavPrinter.value?.printerType)
})

const isMoonraker = computed(() => {
  return isMoonrakerType(storedSideNavPrinter.value?.printerType)
})

const serviceName = computed(() =>
  getServiceName(storedSideNavPrinter.value?.printerType)
)

const isOperational = computed(() =>
  printerId.value
    ? printerStateStore.isPrinterOperational(printerId.value)
    : false
)
const isEnabled = computed(() => {
  return storedSideNavPrinter.value?.enabled
})
const isUnderMaintenance = computed(() => {
  return !!storedSideNavPrinter.value?.disabledReason?.length
})
const isPrinting = computed(() => {
  return printerId.value
    ? printerStateStore.isPrinterPrinting(printerId.value)
    : false
})
const filesListed = computed(() => {
  if (!shownFileCache.value?.length) return []
  return (
    shownFileCache.value.filter((f) =>
      fileSearch.value?.length
        ? `${f.path}`.toLowerCase().includes(fileSearch.value)
        : true
    ) || []
  )
})
const isStoppable = computed(() => {
  if (!storedSideNavPrinter.value || !printerId.value) return false
  return printerStateStore.isPrinterStoppable(printerId.value)
})
const isPaused = computed(() => {
  if (!storedSideNavPrinter.value || !printerId.value) return false
  return printerStateStore.isPrinterPaused(printerId.value)
})
const canBeCleared = computed(() => {
  if (!printerId.value) {
    return false
  }
  return (
    shownFileCache.value?.length &&
    printerStateStore.isApiResponding(printerId.value)
  )
})
const currentJob = computed(() => {
  if (!printerId.value) {
    throw new Error('Printer ID not set, cannot get current job')
  }
  return printerStateStore.printerJobsById[printerId.value]
})
const currentPrintingFilePath = computed(() => {
  if (!printerId.value) {
    throw new Error('Printer ID not set, cannot get current printing file name')
  }
  return printerStateStore.printingFilePathsByPrinterId[printerId.value]
})
const printerState = computed(() => {
  if (!printerId.value || !storedSideNavPrinter.value) return null
  const printerEvents = printerStateStore.printerEventsById[printerId.value]
  const socketState = printerStateStore.socketStatesById[printerId.value]
  const states = interpretStates(
    storedSideNavPrinter.value,
    socketState,
    printerEvents
  )
  const debugInterpretedState =
    useSettingsStore().frontendDebugSettings?.showInterpretedPrinterState
  if (debugInterpretedState) {
    console.debug(
      '[FileExplorerSideNav] rendered for printerId',
      printerId.value,
      states?.text,
      states?.color,
      states?.rgb
    )
  }
  return states
})
const refreshFiles = async () => {
  loading.value = true
  const currentPrinterId = storedSideNavPrinter.value?.id
  if (!currentPrinterId) return
  try {
    if (printerStateStore.isApiResponding(currentPrinterId)) {
      shownFileCache.value = await printersStore.loadPrinterFiles(
        currentPrinterId
      )
    } else {
      shownFileCache.value = await PrinterFileService.getFileCache(
        currentPrinterId
      )
    }
  } finally {
    loading.value = false
  }
}
const deleteFile = async (file: FileDto) => {
  if (!printerId.value) return
  await printersStore.deletePrinterFile(printerId.value, file.path)
}

watch(storedSideNavPrinter, async (viewedPrinter, oldVal) => {
  drawerOpened.value = !!viewedPrinter
  const currentPrinterId = viewedPrinter?.id
  if (!viewedPrinter || !currentPrinterId) {
    return
  }
  if (!shownFileCache.value || viewedPrinter.id !== oldVal?.id || !oldVal) {
    await refreshFiles()
  }
})

watch(drawerOpened, (newVal) => {
  if (!newVal) {
    printersStore.setSideNavPrinter(undefined)
  }
})

function truncateProgress(progress?: number) {
  if (!progress) return ''
  return progress?.toFixed(1)
}

function isFileBeingPrinted(file: FileDto) {
  if (!printerId.value) {
    return false
  }
  const jobFilePath =
    printerStateStore.printingFilePathsByPrinterId[printerId.value]
  return jobFilePath === file.path
}

function avatarInitials() {
  const viewedPrinter = storedSideNavPrinter.value
  if (viewedPrinter && drawerOpened.value) {
    return generateInitials(viewedPrinter.name)
  }
}

function openPrinterURL() {
  if (!storedSideNavPrinter.value) return
  PrintersService.openPrinterURL(storedSideNavPrinter.value.printerURL)
  closeDrawer()
}

function openPrinterMainsail() {
  if (!storedSideNavPrinter.value) return

  const url = new URL(storedSideNavPrinter.value.printerURL)
  url.port = '8080'
  PrintersService.openPrinterURL(url.toString())
  closeDrawer()
}

async function togglePrinterConnection() {
  if (!printerId.value) return
  if (printerStateStore.isPrinterOperational(printerId.value)) {
    return await PrintersService.sendPrinterDisconnectCommand(printerId.value)
  }
  await PrintersService.sendPrinterConnectCommand(printerId.value)
}

async function toggleEnabled() {
  if (!printerId.value) {
    throw new Error('Printer ID not set, cant toggle enabled')
  }
  if (!storedSideNavPrinter.value) {
    throw new Error('Cant toggle enabled, sidenav printer unset')
  }
  const newSetting = !storedSideNavPrinter.value.enabled
  await PrintersService.toggleEnabled(printerId.value, newSetting)
}

async function toggleMaintenance() {
  if (!printerId.value) {
    throw new Error('Printer ID not set, cant toggle maintenance')
  }
  if (!storedSideNavPrinter.value) {
    throw new Error('Cant toggle enabled, sidenav printer unset')
  }
  if (isUnderMaintenance.value) {
    await PrintersService.updatePrinterMaintenance(printerId.value)
    return
  }
  printersStore.setMaintenanceDialogPrinter(storedSideNavPrinter.value)
  await useDialog(DialogName.PrinterMaintenanceDialog).openDialog()

  closeDrawer()
}

async function refreshSocketState() {
  if (!printerId.value) return

  await PrintersService.refreshSocket(printerId.value)
}

async function clickStopPrint() {
  if (!printerId.value) return
  if (confirm('Are you sure to cancel the current print job?')) {
    await PrinterJobService.stopPrintJob(printerId.value)
  }
}

async function clickPausePrint() {
  if (!printerId.value) return
  await PrinterJobService.pausePrintJob(printerId.value)
}

async function clickResumePrint() {
  if (!printerId.value) return
  await PrinterJobService.resumePrintJob(printerId.value)
}

async function clickClearFiles() {
  if (!printerId.value) return
  loading.value = true
  await printersStore.clearPrinterFiles(printerId.value)
  loading.value = false
  shownFileCache.value = printersStore.printerFiles(printerId.value)
}

function clickSettings() {
  if (!storedSideNavPrinter.value) return
  printersStore.setUpdateDialogPrinter(storedSideNavPrinter.value)
  useDialog(DialogName.AddOrUpdatePrinterDialog).openDialog()
  closeDrawer()
}

async function clickPrintFile(file: FileDto) {
  if (!printerId.value) return
  await printerStateStore.selectAndPrintFile({
    printerId: printerId.value,
    fullPath: file.path
  })
}

function clickDownloadFile(path: string) {
  if (!printerId.value) return
  PrinterFileService.downloadFile(printerId.value, path)
}

function closeDrawer() {
  printersStore.setSideNavPrinter(undefined)
}
</script>
<style>
.extra-dense-list-item {
  margin-top: -7px;
}

.current-file-print {
  color: red;
}

.pulsating-red {
  background: darkred;
  margin: 10px;
  border-radius: 15px;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  transform: scale(1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
