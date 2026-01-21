<template>
  <v-container fluid>
    <!-- Drag and Drop Upload Area -->
    <v-card
      class="mb-6 upload-drop-zone"
      elevation="2"
      :class="{ 'drag-over': isDragging }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <v-card-text class="text-center pa-6">
        <v-icon
          size="64"
          color="primary"
          class="mb-4"
          >cloud_upload</v-icon
        >
        <h3 class="text-h6 mb-2">Upload Files</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Drag and drop files here or click to browse
        </p>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".gcode,.3mf,.bgcode"
          style="display: none"
          @change="handleFileSelect"
        />
        <v-btn
          color="primary"
          variant="elevated"
          @click="fileInput?.click()"
          :loading="uploading"
        >
          <v-icon start>folder_open</v-icon>
          Select Files
        </v-btn>
        <div
          v-if="uploadProgress.length > 0"
          class="mt-4"
        >
          <v-progress-linear
            v-for="(progress, index) in uploadProgress"
            :key="index"
            :model-value="progress.percent"
            :color="progress.error ? 'error' : 'primary'"
            height="25"
            class="mb-2"
          >
            <template #default>
              <div class="text-caption">
                {{ progress.fileName }} -
                {{ progress.error || `${progress.percent}%` }}
              </div>
            </template>
          </v-progress-linear>
        </div>
      </v-card-text>
    </v-card>

    <!-- Files Grid -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center pb-0">
        <v-icon
          class="mr-3"
          color="primary"
          >inventory_2</v-icon
        >
        <span class="text-h6">File Storage</span>
        <v-spacer />
        <v-chip
          v-if="totalCount > 0"
          variant="tonal"
          size="small"
          class="mr-3"
        >
          {{ totalCount }} files
        </v-chip>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="search"
          label="Search files"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="mr-4"
          style="max-width: 300px"
        />
        <v-btn
          color="primary"
          @click="loadFiles"
          :loading="loading"
          variant="elevated"
        >
          <v-icon left>refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredFiles"
          :loading="loading"
          class="files-table"
          loading-text="Loading files..."
          no-data-text="No files found"
          :items-per-page="25"
        >
          <!-- File Name Column -->
          <template #item.fileName="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="40"
                class="mr-3"
                rounded
              >
                <v-img
                  v-if="item.thumbnailCount > 0"
                  :src="getThumbnailUrl(item.fileStorageId)"
                  cover
                >
                  <template #error>
                    <v-icon>description</v-icon>
                  </template>
                </v-img>
                <v-icon
                  v-else
                  color="primary"
                  >description</v-icon
                >
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ item.metadata?._originalFileName || item.fileName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.fileFormat.toUpperCase() }} •
                  {{ formatFileSize(item.fileSize) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Printer Type Column -->
          <template #item.printerType="{ item }">
            <v-avatar
              size="32"
              v-if="getPrinterTypeLogo(item.metadata || {}, item.fileFormat)"
              rounded="0"
            >
              <v-img
                :src="getPrinterTypeLogo(item.metadata || {}, item.fileFormat)"
                contain
              />
            </v-avatar>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Material Column -->
          <template #item.material="{ item }">
            <v-chip
              v-if="item.metadata?.filamentType"
              size="small"
              variant="tonal"
              color="orange"
            >
              {{ item.metadata.filamentType }}
            </v-chip>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Temperatures Column -->
          <template #item.temperatures="{ item }">
            <div
              v-if="
                item.metadata?.nozzleTemperature ||
                item.metadata?.bedTemperature
              "
              class="text-caption"
            >
              <div v-if="item.metadata.nozzleTemperature">
                🔥 {{ item.metadata.nozzleTemperature }}°C
              </div>
              <div v-if="item.metadata.bedTemperature">
                🛏️ {{ item.metadata.bedTemperature }}°C
              </div>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Plates Column -->
          <template #item.plates="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="blue"
            >
              <v-icon
                start
                size="small"
                >layers</v-icon
              >
              {{ item.metadata?.totalPlates ?? 1 }}
            </v-chip>
          </template>

          <!-- Printer Model Column -->
          <template #item.printerModel="{ item }">
            <div
              v-if="item.metadata?.printerModel"
              class="text-caption"
            >
              {{ item.metadata.printerModel }}
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Print Time Column -->
          <template #item.printTime="{ item }">
            <div
              v-if="item.metadata?.gcodePrintTimeSeconds"
              class="text-body-2"
            >
              <v-chip
                color="info"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  size="small"
                  >schedule</v-icon
                >
                {{ formatDuration(item.metadata.gcodePrintTimeSeconds) }}
              </v-chip>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Filament Column -->
          <template #item.filament="{ item }">
            <div
              v-if="item.metadata?.filamentUsedGrams"
              class="text-body-2"
            >
              <v-chip
                color="green"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  size="small"
                  >fitness_center</v-icon
                >
                {{ item.metadata.filamentUsedGrams.toFixed(1) }}g
              </v-chip>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Thumbnails Column -->
          <template #item.thumbnailCount="{ item }">
            <v-chip
              v-if="item.thumbnailCount > 0"
              size="small"
              color="success"
              variant="tonal"
            >
              <v-icon
                start
                size="small"
                >image</v-icon
              >
              {{ item.thumbnailCount }}
            </v-chip>
            <span
              v-else
              class="text-medium-emphasis"
              >None</span
            >
          </template>

          <!-- Created Date Column -->
          <template #item.createdAt="{ item }">
            <div class="text-body-2">
              <div>{{ formatDate(item.createdAt) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(item.createdAt) }}
              </div>
            </div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              icon="add_to_queue"
              size="small"
              variant="text"
              color="primary"
              @click="openQueueDialog(item)"
            >
              <v-icon>add_to_queue</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Add to queue
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="analytics"
              size="small"
              variant="text"
              color="info"
              @click="analyzeFile(item)"
              :loading="analyzingFiles.has(item.fileStorageId)"
            >
              <v-icon>analytics</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Trigger analysis
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="visibility"
              size="small"
              variant="text"
              color="primary"
              @click="viewFile(item)"
            >
              <v-icon>visibility</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                View details
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteFile(item)"
            >
              <v-icon>delete</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Delete file
              </v-tooltip>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- File Details Dialog -->
    <v-dialog
      v-model="detailsDialog"
      max-width="800"
    >
      <v-card v-if="selectedFile">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">description</v-icon>
          File Details
          <v-spacer />
          <v-btn
            icon="close"
            variant="text"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <h3 class="text-h6 mb-3">File Information</h3>
              <div class="mb-2">
                <strong>Name:</strong>
                {{
                  selectedFile.metadata?._originalFileName ||
                  selectedFile.fileName
                }}
              </div>
              <div class="mb-2">
                <strong>Format:</strong>
                {{ selectedFile.fileFormat.toUpperCase() }}
              </div>
              <div class="mb-2">
                <strong>Size:</strong>
                {{ formatFileSize(selectedFile.fileSize) }}
              </div>
              <div class="mb-2">
                <strong>Hash:</strong> <code>{{ selectedFile.fileHash }}</code>
              </div>
              <div class="mb-2">
                <strong>Storage ID:</strong>
                <code>{{ selectedFile.fileStorageId }}</code>
              </div>
              <div class="mb-2">
                <strong>Created:</strong>
                {{ formatDate(selectedFile.createdAt) }}
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <h3 class="text-h6 mb-3">Print Metadata</h3>
              <div v-if="selectedFile.metadata">
                <div
                  v-if="selectedFile.metadata.gcodePrintTimeSeconds"
                  class="mb-2"
                >
                  <strong>Print Time:</strong>
                  {{
                    formatDuration(selectedFile.metadata.gcodePrintTimeSeconds)
                  }}
                </div>
                <div
                  v-if="selectedFile.metadata.filamentUsedGrams"
                  class="mb-2"
                >
                  <strong>Filament:</strong>
                  {{ selectedFile.metadata.filamentUsedGrams.toFixed(1) }}g
                </div>
                <div
                  v-if="selectedFile.metadata.nozzleDiameterMm"
                  class="mb-2"
                >
                  <strong>Nozzle Diameter:</strong>
                  {{ selectedFile.metadata.nozzleDiameterMm }}mm
                </div>
                <div
                  v-if="selectedFile.metadata.layerHeight"
                  class="mb-2"
                >
                  <strong>Layer Height:</strong>
                  {{ selectedFile.metadata.layerHeight }}mm
                </div>
                <div
                  v-if="selectedFile.metadata.totalLayers"
                  class="mb-2"
                >
                  <strong>Total Layers:</strong>
                  {{ selectedFile.metadata.totalLayers }}
                </div>
              </div>
              <div
                v-else
                class="text-medium-emphasis"
              >
                No metadata available
              </div>
            </v-col>

            <v-col
              v-if="selectedFile.thumbnailCount > 0"
              cols="12"
            >
              <h3 class="text-h6 mb-3">
                Thumbnails ({{ selectedFile.thumbnailCount }})
              </h3>
              <div class="d-flex flex-wrap ga-2">
                <v-img
                  v-for="i in selectedFile.thumbnailCount"
                  :key="i"
                  :src="getGCodeThumbnailUrl(selectedFile.fileStorageId, i - 1)"
                  width="150"
                  height="150"
                  cover
                  class="rounded"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="detailsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Queue to Printers Dialog -->
    <v-dialog
      v-model="queueDialog"
      max-width="600"
    >
      <v-card v-if="selectedFileForQueue">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">add_to_queue</v-icon>
          Queue File to Printers
          <v-spacer />
          <v-btn
            icon="close"
            variant="text"
            @click="queueDialog = false"
          />
        </v-card-title>

        <v-card-text>
          <div class="mb-4">
            <strong>File:</strong>
            {{
              selectedFileForQueue.metadata?._originalFileName ||
              selectedFileForQueue.fileName
            }}
          </div>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Select one or more printers to queue this file to
          </v-alert>

          <v-list>
            <v-list-item
              v-for="printer in availablePrinters"
              :key="printer.id"
              @click="togglePrinterSelection(printer.id)"
            >
              <template #prepend>
                <v-checkbox
                  :model-value="selectedPrinters.includes(printer.id)"
                  @click.stop="togglePrinterSelection(printer.id)"
                />
              </template>
              <v-list-item-title>
                {{ printer.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ getPrinterTypeName(printer.printerType) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert
            v-if="availablePrinters.length === 0"
            type="warning"
            variant="tonal"
          >
            No printers available
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="queueDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="selectedPrinters.length === 0"
            @click="queueToSelectedPrinters"
            :loading="queuing"
          >
            Queue to {{ selectedPrinters.length }} Printer(s)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {
  FileStorageService,
  type FileMetadata
} from '@/backend/file-storage.service'
import { PrintQueueService } from '@/backend/print-queue.service'
import { PrintJobService } from '@/backend/print-job.service'
import { usePrinterStore } from '@/store/printer.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { formatFileSize } from '@/utils/file-size.util'
import {
  formatDate,
  formatRelativeTime,
  formatDuration
} from '@/utils/date-time.utils'
import {
  getPrinterTypeName,
  getPrinterTypeLogo
} from '@/shared/printer-types.constants'

const snackbar = useSnackbar()
const printerStore = usePrinterStore()

const files = ref<FileMetadata[]>([])
const loading = ref(false)
const searchQuery = ref('')
const detailsDialog = ref(false)
const selectedFile = ref<FileMetadata | null>(null)
const queueDialog = ref(false)
const selectedFileForQueue = ref<FileMetadata | null>(null)
const selectedPrinters = ref<number[]>([])
const queuing = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const dragDepth = ref(0)
const uploadProgress = ref<
  Array<{ fileName: string; percent: number; error?: string }>
>([])
const fileInput = ref<HTMLInputElement | null>(null)
const analyzingFiles = ref<Set<string>>(new Set())

const headers = [
  { title: 'File Name', key: 'fileName', sortable: true },
  { title: 'Type', key: 'printerType', sortable: false },
  { title: 'Material', key: 'material', sortable: false },
  { title: 'Temps', key: 'temperatures', sortable: false },
  { title: 'Plates', key: 'plates', sortable: false },
  { title: 'Model', key: 'printerModel', sortable: false },
  { title: 'Print Time', key: 'printTime', sortable: false },
  { title: 'Filament', key: 'filament', sortable: false },
  { title: 'Thumbnails', key: 'thumbnailCount', sortable: false },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
]

const totalCount = computed(() => files.value.length)

const availablePrinters = computed(() => {
  return printerStore.printers.filter((p) => p.enabled)
})

const filteredFiles = computed(() => {
  if (!searchQuery.value) {
    return files.value
  }
  const query = searchQuery.value.toLowerCase()
  return files.value.filter(
    (file) =>
      file.fileName.toLowerCase().includes(query) ||
      file.fileHash.toLowerCase().includes(query) ||
      file.fileStorageId.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await loadFiles()
  await printerStore.loadPrinters()
})

const loadFiles = async () => {
  loading.value = true
  try {
    const response = await FileStorageService.listFiles()
    files.value = response.files
  } catch (error) {
    console.error('Failed to load files:', error)
    snackbar.error('Failed to load files')
  } finally {
    loading.value = false
  }
}

const viewFile = (file: FileMetadata) => {
  selectedFile.value = file
  detailsDialog.value = true
}

const deleteFile = async (file: FileMetadata) => {
  if (!confirm(`Delete file "${file.fileName}"? This cannot be undone.`)) {
    return
  }

  try {
    await FileStorageService.deleteFile(file.fileStorageId)
    snackbar.info('File deleted successfully')
    await loadFiles()
  } catch (error) {
    console.error('Failed to delete file:', error)
    snackbar.error('Failed to delete file')
  }
}

const analyzeFile = async (file: FileMetadata) => {
  if (analyzingFiles.value.has(file.fileStorageId)) {
    return
  }

  analyzingFiles.value.add(file.fileStorageId)

  try {
    const result = await FileStorageService.analyzeFile(file.fileStorageId)
    snackbar.info(
      `Analysis complete! Found ${result.thumbnailCount} thumbnail(s)`
    )

    await loadFiles()
  } catch (error) {
    console.error('Failed to analyze file:', error)
    snackbar.error('Failed to analyze file')
  } finally {
    analyzingFiles.value.delete(file.fileStorageId)
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value++
  if (dragDepth.value === 1) {
    isDragging.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value--
  if (dragDepth.value === 0) {
    isDragging.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value = 0
  isDragging.value = false
  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  await uploadFiles(droppedFiles)
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  await uploadFiles(selectedFiles)
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFiles = async (filesToUpload: File[]) => {
  if (filesToUpload.length === 0) return

  uploading.value = true
  uploadProgress.value = filesToUpload.map((f) => ({
    fileName: f.name,
    percent: 0
  }))

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i]
    try {
      // Upload to the file upload endpoint using service
      await FileStorageService.uploadFile(file)

      uploadProgress.value[i].percent = 100
      snackbar.info(`Uploaded ${file.name}`)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      uploadProgress.value[i].error = 'Failed'
      uploadProgress.value[i].percent = 100
      snackbar.error(`Failed to upload ${file.name}`)
    }
  }

  uploading.value = false

  // Reload files after upload
  setTimeout(() => {
    uploadProgress.value = []
    loadFiles()
  }, 2000)
}

const openQueueDialog = (file: FileMetadata) => {
  selectedFileForQueue.value = file
  selectedPrinters.value = []
  queueDialog.value = true
}

const togglePrinterSelection = (printerId: number) => {
  const index = selectedPrinters.value.indexOf(printerId)
  if (index > -1) {
    selectedPrinters.value.splice(index, 1)
  } else {
    selectedPrinters.value.push(printerId)
  }
}

const queueToSelectedPrinters = async () => {
  if (!selectedFileForQueue.value || selectedPrinters.value.length === 0) {
    return
  }

  queuing.value = true
  let successCount = 0
  let failCount = 0

  try {
    // First, create a pending job for this file (without a printer)
    // We'll need to call the backend to create a job from the file storage
    for (const printerId of selectedPrinters.value) {
      try {
        // Create a print job from the file
        const job = await PrintJobService.createFromFile(
          selectedFileForQueue.value.fileStorageId,
          printerId
        )

        // Add the job to the printer's queue
        await PrintQueueService.addToQueue(printerId, job.id)
        successCount++
      } catch (error) {
        console.error(`Failed to queue to printer ${printerId}:`, error)
        failCount++
      }
    }

    if (successCount > 0) {
      snackbar.info(`Queued file to ${successCount} printer(s)`)
    }
    if (failCount > 0) {
      snackbar.error(`Failed to queue to ${failCount} printer(s)`)
    }

    queueDialog.value = false
    selectedFileForQueue.value = null
    selectedPrinters.value = []
  } catch (error) {
    console.error('Failed to queue file:', error)
    snackbar.error('Failed to queue file')
  } finally {
    queuing.value = false
  }
}

const getThumbnailUrl = async (fileStorageId: string, index: number = 0) => {
  //return FileStorageService.getThumbnailUrl(fileStorageId, index)
  }

const getGCodeThumbnailUrl = async (fileStorageId: string, index: number = 0) => {
  const gcodeThumbnail = await FileStorageService.getGcodeThumbnail(
    fileStorageId,
    index
  )

  return gcodeThumbnail
}
</script>

<style scoped>
.files-table {
  background-color: transparent;
}

.upload-drop-zone {
  transition: all 0.3s ease;
  border: 2px dashed transparent;
}

.upload-drop-zone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.01);
}
</style>
