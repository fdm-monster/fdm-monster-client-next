<template>
  <v-navigation-drawer
    v-model="drawerOpened"
    location="right"
    temporary
    width="420"
    class="printer-side-nav"
    @update:model-value="closeDrawer"
  >
    <!-- Printer Header Card -->
    <v-card
      v-if="storedSideNavPrinter"
      class="ma-3 mb-4"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="pb-2">
        <div class="d-flex align-center mb-3">
          <v-avatar
            :size="48"
            color="primary"
            class="mr-3"
          >
            <span class="text-h6 font-weight-bold">
              {{ avatarInitials() }}
            </span>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-h6 font-weight-bold">
              {{ storedSideNavPrinter.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ serviceName }}
            </div>
          </div>

          <v-btn
            icon="open_in_new"
            variant="text"
            size="small"
            @click="openPrinterURL()"
          />
        </div>

        <!-- Status Chip -->
        <v-chip
          :color="getStatusColor()"
          :prepend-icon="getStatusIcon()"
          size="small"
          class="mb-2"
        >
          {{ getStatusText() }}
        </v-chip>

        <!-- Print Progress -->
        <div
          v-if="currentJob?.progress && isPrinting"
          class="mt-3"
        >
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-body-2">{{ currentPrintingFilePath }}</span>
            <span class="text-body-2 font-weight-bold">
              {{ truncateProgress(currentJob.progress.completion) }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="currentJob.progress.completion"
            color="primary"
            height="6"
            rounded
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Status Alerts -->
    <div class="ma-3">
      <v-alert
        v-if="!isEnabled"
        type="warning"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        <template #prepend>
          <v-icon>power_off</v-icon>
        </template>
        Printer is disabled. Enable to receive live updates.
      </v-alert>

      <v-alert
        v-else-if="!isOnline"
        type="info"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        <template #prepend>
          <v-icon>wifi_off</v-icon>
        </template>
        Printer appears offline. Attempting to reconnect...
      </v-alert>

      <v-alert
        v-if="storedSideNavPrinter?.disabledReason"
        type="error"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        <template #prepend>
          <v-icon>construction</v-icon>
        </template>
        <div>
          <div class="font-weight-bold">Under Maintenance</div>
          <div class="text-caption">{{ storedSideNavPrinter.disabledReason }}</div>
        </div>
      </v-alert>

      <v-alert
        v-if="fileLoadError"
        type="warning"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        <template #prepend>
          <v-icon>warning</v-icon>
        </template>
        <div>
          <div>Unable to load files from {{ serviceName }}</div>
          <v-btn
            size="small"
            variant="outlined"
            class="mt-2"
            @click="refreshFiles()"
          >
            Try Again
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- Quick Actions -->
    <v-card
      class="ma-3 mb-4"
      elevation="1"
      rounded="lg"
    >
      <v-card-title class="text-subtitle-1 py-3">
        Quick Actions
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            :disabled="!isEnabled || !isOnline"
            :color="isOperational ? 'warning' : 'success'"
            size="small"
            variant="outlined"
            @click="togglePrinterConnection()"
          >
            <v-icon start>{{ isOperational ? 'usb_off' : 'usb' }}</v-icon>
            {{ isOperational ? 'Disconnect' : 'Connect' }}
          </v-btn>

          <v-btn
            :color="isEnabled ? 'warning' : 'success'"
            size="small"
            variant="outlined"
            @click="toggleEnabled()"
          >
            <v-icon start>{{ isEnabled ? 'pause' : 'play_arrow' }}</v-icon>
            {{ isEnabled ? 'Disable' : 'Enable' }}
          </v-btn>

          <v-btn
            size="small"
            variant="outlined"
            @click="refreshSocketState()"
          >
            <v-icon start>refresh</v-icon>
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Print Controls -->
    <v-card
      v-if="isPrinting || isStoppable || isPaused"
      class="ma-3 mb-4"
      elevation="1"
      rounded="lg"
    >
      <v-card-title class="text-subtitle-1 py-3">
        Print Controls
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-if="isPrinting || isPaused"
            :disabled="!isOnline"
            :color="isPaused ? 'success' : 'warning'"
            size="small"
            variant="outlined"
            @click="isPaused ? clickResumePrint() : clickPausePrint()"
          >
            <v-icon start>{{ isPaused ? 'play_arrow' : 'pause' }}</v-icon>
            {{ isPaused ? 'Resume' : 'Pause' }}
          </v-btn>

          <v-btn
            v-if="isStoppable"
            color="error"
            size="small"
            variant="outlined"
            @click="clickStopPrint()"
          >
            <v-icon start>stop</v-icon>
            Cancel Print
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Files Section -->
    <v-card
      class="ma-3 mb-4 flex-grow-1"
      elevation="1"
      rounded="lg"
    >
      <v-card-title class="d-flex align-center py-3">
        <span class="text-subtitle-1">Files</span>
        <v-spacer />
        <v-btn
          icon="refresh"
          size="small"
          variant="text"
          @click="refreshFiles()"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-3">
        <!-- Search Field -->
        <v-text-field
          v-model="fileSearch"
          placeholder="Search files..."
          prepend-inner-icon="search"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-3"
        />

        <!-- File List -->
        <div class="file-list">
          <!-- Loading State -->
          <div
            v-if="loading"
            class="d-flex justify-center py-4"
          >
            <v-progress-circular
              indeterminate
              size="32"
            />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!filesListed.length && !fileLoadError"
            class="text-center py-6"
          >
            <v-icon
              size="48"
              color="medium-emphasis"
              class="mb-2"
            >
              folder_open
            </v-icon>
            <div class="text-body-2 text-medium-emphasis">
              No files found
            </div>
          </div>

          <!-- File Items -->
          <div
            v-for="(file, index) in filesListed"
            :key="index"
            class="file-item"
          >
            <v-card
              :class="{ 'file-printing': isFileBeingPrinted(file) }"
              variant="outlined"
              class="mb-2"
              rounded="lg"
            >
              <v-card-text class="py-2 px-3">
                <div class="d-flex align-center">
                  <v-icon
                    :color="isFileBeingPrinted(file) ? 'primary' : 'medium-emphasis'"
                    class="mr-3"
                  >
                    {{ isFileBeingPrinted(file) ? 'play_circle' : 'insert_drive_file' }}
                  </v-icon>

                  <div class="flex-grow-1 min-width-0">
                    <div
                      :class="{ 'text-primary font-weight-bold': isFileBeingPrinted(file) }"
                      class="text-body-2 text-truncate"
                      :title="file.path"
                    >
                      {{ file.path }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatBytes(file.size) }}
                    </div>
                  </div>

                  <div class="d-flex ga-1">
                    <v-btn
                      icon="download"
                      size="x-small"
                      variant="text"
                      @click="clickDownloadFile(file.path)"
                    />
                    <v-btn
                      :disabled="isFileBeingPrinted(file)"
                      icon="play_arrow"
                      size="x-small"
                      variant="text"
                      color="success"
                      @click="clickPrintFile(file)"
                    />
                    <v-btn
                      :disabled="isFileBeingPrinted(file)"
                      icon="delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="deleteFile(file)"
                    />
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Bottom Actions -->
    <v-card
      class="ma-3"
      elevation="1"
      rounded="lg"
    >
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            :disabled="!canBeCleared"
            color="error"
            size="small"
            variant="outlined"
            @click="clickDeleteAllFiles()"
          >
            <v-icon start>delete_sweep</v-icon>
            Clear All
          </v-btn>

          <v-btn
            size="small"
            variant="outlined"
            @click="clickSettings()"
          >
            <v-icon start>settings</v-icon>
            Settings
          </v-btn>

          <v-btn
            v-if="isUnderMaintenance"
            size="small"
            variant="outlined"
            color="warning"
            @click="toggleMaintenance()"
          >
            <v-icon start>build</v-icon>
            Maintenance
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
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
import { usePrinterStateStore } from '@/store/printer-state.store'
import {
  getServiceName,
} from "@/shared/printer-types.constants";
import { useDialog } from '@/shared/dialog.composable'
import { useFileExplorer } from '@/shared/file-explorer.composable'

const printersStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const fileExplorer = useFileExplorer()

const fileSearch = ref<string | undefined>(undefined)
const shownFileCache = ref<FileDto[] | undefined>(undefined)
const drawerOpened = fileExplorer.isOpen
const loading = fileExplorer.loading
const fileLoadError = fileExplorer.error
const printerId = fileExplorer.currentPrinterId

const storedSideNavPrinter = computed(() => {
  if (!printerId.value) return undefined
  return printersStore.printer(printerId.value)
})
const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
)

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
const refreshFiles = async () => {
  fileExplorer.setLoading(true)
  fileExplorer.setError(false)
  const currentPrinterId = printerId.value
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
  } catch (error) {
    console.warn('Failed to load printer files:', error)
    fileExplorer.setError(true)
    // Fallback to empty array to show "No files to show" message
    shownFileCache.value = []
  } finally {
    fileExplorer.setLoading(false)
  }
}
const deleteFile = async (file: FileDto) => {
  if (!printerId.value) return
  await printersStore.deletePrinterFile(printerId.value, file.path)
}

watch(printerId, async (newPrinterId, oldPrinterId) => {
  if (newPrinterId && newPrinterId !== oldPrinterId) {
    await refreshFiles()
  } else if (!newPrinterId) {
    shownFileCache.value = undefined
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
    await PrintersService.stopPrintJob(printerId.value)
  }
}

async function clickPausePrint() {
  if (!printerId.value) return
  await PrintersService.pausePrintJob(printerId.value)
}

async function clickResumePrint() {
  if (!printerId.value) return
  await PrintersService.resumePrintJob(printerId.value)
}

async function clickDeleteAllFiles() {
  if (!printerId.value) return
  if (!confirm('Are you sure to delete all files for this printer?')) {
    return
  }

  fileExplorer.setLoading(true)
  await printersStore.deletePrinterFiles(printerId.value)
  fileExplorer.setLoading(false)
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
  fileExplorer.closeFileExplorer()
}

function getStatusColor() {
  if (!isEnabled.value) return 'error'
  if (!isOnline.value) return 'warning'
  if (isPrinting.value) return 'success'
  if (isOperational.value) return 'primary'
  return 'medium-emphasis'
}

function getStatusIcon() {
  if (!isEnabled.value) return 'power_off'
  if (!isOnline.value) return 'wifi_off'
  if (isPrinting.value) return 'print'
  if (isOperational.value) return 'check_circle'
  return 'radio_button_unchecked'
}

function getStatusText() {
  if (!isEnabled.value) return 'Disabled'
  if (!isOnline.value) return 'Offline'
  if (isPrinting.value && isPaused.value) return 'Paused'
  if (isPrinting.value) return 'Printing'
  if (isOperational.value) return 'Ready'
  return 'Idle'
}
</script>
<style scoped>
.printer-side-nav {
  background: rgb(var(--v-theme-surface));
}

.file-printing {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.05);
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  transition: all 0.2s ease;
}

.file-item:hover {
  transform: translateY(-1px);
}

.min-width-0 {
  min-width: 0;
}

/* Scrollbar styling */
.file-list::-webkit-scrollbar {
  width: 4px;
}

.file-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 2px;
}

.file-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 2px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>
