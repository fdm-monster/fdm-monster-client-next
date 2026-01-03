<template>
  <div class="camera-grid-view">
    <!-- Header Toolbar -->
    <v-toolbar
      color="surface"
      elevation="1"
      class="px-4"
    >
      <v-icon
        size="32"
        class="mr-3"
      >videocam</v-icon>
      <v-toolbar-title class="text-h5 font-weight-bold">
        Camera Overview
      </v-toolbar-title>
    </v-toolbar>

    <!-- Search and Action Bar -->
    <div class="pa-4">
      <v-row align="center">
        <v-col
          cols="12"
          md="6"
        >
          <div class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              variant="elevated"
              @click="addCamera()"
            >
              <v-icon start>add</v-icon>
              Add Camera
            </v-btn>

            <!-- Filter Menu -->
            <v-menu :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  :color="hasActiveFilters ? 'primary' : undefined"
                >
                  <v-icon start>filter_list</v-icon>
                  Filter
                  <v-badge
                    v-if="hasActiveFilters"
                    color="primary"
                    :content="activeFilterCount"
                    inline
                    class="ml-2"
                  />
                </v-btn>
              </template>
              <v-card min-width="350">
                <v-card-text>
                  <v-select
                    v-model="filterPrinter"
                    :items="printerFilterOptions"
                    label="Filter by Printer"
                    prepend-inner-icon="print"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                    class="mb-3"
                  />
                  <PrinterTagFilter
                    v-model="selectedTags"
                    :tags="tags"
                    label="Filter by Tags"
                    class="mb-3"
                  />
                  <PrinterTypeFilter
                    v-model="selectedPrinterTypes"
                    label="Filter by Type"
                    class="mb-3"
                  />
                  <v-checkbox
                    v-model="showOnlyUnavailable"
                    label="Show only unavailable cameras"
                    density="compact"
                    hide-details
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    variant="text"
                    size="small"
                    @click="clearFilters"
                  >
                    Clear All
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>

            <v-text-field
              v-model="searchQuery"
              placeholder="Search cameras by name..."
              prepend-inner-icon="search"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="flex-grow-1"
            />
          </div>
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="text-md-right"
        >
          <v-chip
            class="mr-2"
            color="primary"
          >
            <v-icon
              start
              size="small"
            >videocam</v-icon>
            {{ filteredCameras.length }} cameras
          </v-chip>
          <v-chip
            v-if="unavailableCount > 0"
            color="error"
          >
            <v-icon
              start
              size="small"
            >error_outline</v-icon>
            {{ unavailableCount }} unavailable
          </v-chip>
        </v-col>
      </v-row>
    </div>

    <!-- Camera Grid -->
    <div class="pa-4">
      <!-- Loading State -->
      <div
        v-if="query.isLoading.value"
        class="d-flex justify-center align-center py-12"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>

      <!-- Empty State - No Results from Filters -->
      <v-card
        v-else-if="query.data.value?.length && !filteredCameras.length"
        variant="outlined"
        class="text-center py-12"
      >
        <v-icon
          size="64"
          color="medium-emphasis"
          class="mb-4"
        >
          search_off
        </v-icon>
        <div class="text-h6 text-medium-emphasis mb-2">
          No cameras match your filters
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Try adjusting your search or filters
        </div>
      </v-card>

      <!-- Camera Cards Grid -->
      <v-row v-else>
        <!-- Empty Tile - Get Started -->
        <v-col
          v-if="!query.data.value?.length"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="camera-card empty-camera-tile"
            elevation="2"
            rounded="lg"
            hover
            @click="addCamera()"
          >
            <div class="empty-tile-content">
              <v-avatar
                color="primary"
                size="64"
                class="mb-4"
              >
                <v-icon size="32">add_a_photo</v-icon>
              </v-avatar>
              <div class="text-h6 font-weight-bold mb-2">
                Get Started
              </div>
              <div class="text-body-2 text-medium-emphasis mb-4 px-4">
                Add your first camera stream to monitor your 3D printers
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                size="small"
              >
                <v-icon start>add</v-icon>
                Add Camera
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Camera Cards -->
        <v-col
          v-for="camera in filteredCameras"
          :key="camera.cameraStream.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="camera-card"
            elevation="2"
            rounded="lg"
          >
            <!-- Card Header -->
            <v-card-title class="d-flex align-center pa-3">
              <v-avatar
                :color="camera.cameraStream.printerId ? 'primary' : 'secondary'"
                size="32"
                class="mr-2"
              >
                <v-icon size="20">
                  {{ camera.cameraStream.printerId ? 'print' : 'videocam' }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1 text-truncate">
                <div class="d-flex align-center gap-2 mb-1">
                  <div class="text-subtitle-2 font-weight-bold text-truncate">
                    {{ camera.cameraStream.name || camera.printer?.name || 'Camera' }}
                  </div>
                </div>
                <div
                  v-if="camera.printer"
                  class="text-caption text-medium-emphasis text-truncate"
                >
                  {{ camera.printer.name }}
                  <v-chip
                    v-if="camera.printer"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ getPrinterTypeName(camera.printer.printerType) }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>

            <!-- Camera Stream -->
            <div class="camera-stream-container">
              <img
                v-if="camera.cameraStream.id"
                alt="Camera stream"
                v-show="camera.cameraStream.id && !cameraErrors[camera.cameraStream.id] && !cameraLoading[camera.cameraStream.id]"
                :src="camera.cameraStream.streamURL"
                class="camera-stream"
                @error="handleCameraError(camera.cameraStream.id)"
                @load="handleCameraLoad(camera.cameraStream.id)"
              />
              <div
                v-if="camera.cameraStream.id && cameraLoading[camera.cameraStream.id] && !cameraErrors[camera.cameraStream.id]"
                class="camera-loading"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="48"
                />
                <div class="text-caption mt-2">Connecting...</div>
              </div>
              <div
                v-if="camera.cameraStream.id && cameraErrors[camera.cameraStream.id]"
                class="camera-unavailable"
              >
                <v-icon
                  size="48"
                  color="error"
                >videocam_off</v-icon>
                <div class="text-body-2 font-weight-bold mt-2">Camera stream unavailable</div>
                <div class="text-caption text-medium-emphasis mt-1">Unable to connect to stream</div>
              </div>
            </div>

            <!-- Card Actions -->
            <v-card-actions class="pa-3">
              <v-btn
                variant="text"
                size="small"
                @click="updateCamera(camera.cameraStream.id)"
              >
                <v-icon start>edit</v-icon>
                Edit
              </v-btn>
              <v-btn
                v-if="camera.printer"
                variant="text"
                size="small"
                color="primary"
                @click="openPrinterSideNav(camera.printer)"
              >
                <v-icon start>folder</v-icon>
                Files
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                color="error"
                @click="confirmDeleteCamera(camera)"
              >
                <v-icon start>delete</v-icon>
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CameraStreamService } from '@/backend/camera-stream.service'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { CameraWithPrinter } from '@/models/camera-streams/camera-stream'
import { usePrinterStore } from '@/store/printer.store'
import { useFileExplorer } from '@/shared/file-explorer.composable'
import type { PrinterDto } from '@/models/printers/printer.model'
import { getServiceName } from '@/shared/printer-types.constants'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'

const route = useRoute()
const printerStore = usePrinterStore()
const dialog = useDialog(DialogName.AddOrUpdateCameraDialog)
const fileExplorer = useFileExplorer()

const {
  selectedTags,
  selectedPrinterTypes,
  tags,
  tagsWithPrinters,
  loadTags
} = usePrinterFilters()

// Reactive state
const searchQuery = ref('')
const filterPrinter = ref<number | undefined>(undefined)
const showOnlyUnavailable = ref(false)
const cameraErrors = reactive<Record<number, boolean>>({})
const cameraLoading = reactive<Record<number, boolean>>({})

onMounted(async () => {
  await loadTags()

  // Check for printer query parameter
  const printerParam = route.query.printer
  if (printerParam) {
    filterPrinter.value = Number(printerParam)
  }
})

// Fetch cameras with printer data
const camerasWithPrinter = async (): Promise<CameraWithPrinter[]> => {
  const streams = await CameraStreamService.listCameraStreams()
  return streams.map((cameraStream) => ({
    printer: printerStore.printers.find(
      (printer) => printer.id === cameraStream.printerId
    ),
    cameraStream
  })) as CameraWithPrinter[]
}

const query = useQuery({
  queryKey: ['cameraStream'],
  queryFn: camerasWithPrinter
})

const deleteMutation = useMutation({
  mutationFn: (cameraId: number) =>
    CameraStreamService.deleteCameraStream(cameraId),
  onSuccess: () => query.refetch()
})

// Printer filter options
const printerFilterOptions = computed(() => {
  const options: { title: string; value: number | null | undefined }[] = [
    { title: 'All Printers', value: undefined },
    { title: 'Unassigned Cameras', value: null }
  ]

  printerStore.printers.forEach((printer) => {
    options.push({
      title: printer.name,
      value: printer.id as number
    })
  })

  return options
})

// Filtered cameras based on search and filters
const filteredCameras = computed(() => {
  if (!query.data.value) return []

  return query.data.value.filter((camera) => {
    // Search filter
    const matchesSearch =
      !searchQuery.value ||
      camera.cameraStream.name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      camera.printer?.name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    // Printer filter
    const matchesPrinter =
      filterPrinter.value === undefined ||
      (filterPrinter.value === null && !camera.cameraStream.printerId) ||
      camera.cameraStream.printerId === filterPrinter.value

    // Tag filter
    let matchesTags = selectedTags.value.length === 0
    if (selectedTags.value.length > 0 && camera.printer?.id) {
      matchesTags = tagsWithPrinters.value.some(tag =>
        selectedTags.value.includes(tag.id) &&
        tag.printers.some(p => p.printerId === camera.printer?.id)
      )
    }

    // Printer type filter
    let matchesPrinterType = selectedPrinterTypes.value.length === 0
    if (selectedPrinterTypes.value.length > 0 && camera.printer) {
      matchesPrinterType = selectedPrinterTypes.value.includes(camera.printer.printerType)
    }

    // Unavailable filter
    const matchesAvailability =
      !showOnlyUnavailable.value ||
      cameraErrors[camera.cameraStream.id!]

    return matchesSearch && matchesPrinter && matchesTags && matchesPrinterType && matchesAvailability
  })
})

// Count unavailable cameras
const unavailableCount = computed(() => {
  return Object.values(cameraErrors).filter(Boolean).length
})

// Check if filters are active
const hasActiveFilters = computed(() => {
  return (
    filterPrinter.value !== undefined ||
    showOnlyUnavailable.value ||
    selectedTags.value.length > 0 ||
    selectedPrinterTypes.value.length > 0
  )
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filterPrinter.value !== undefined) count++
  if (showOnlyUnavailable.value) count++
  if (selectedTags.value.length > 0) count++
  if (selectedPrinterTypes.value.length > 0) count++
  return count
})

// Camera error and loading handling
function handleCameraError(cameraId?: number) {
  if (cameraId) {
    cameraErrors[cameraId] = true
    cameraLoading[cameraId] = false
  }
}

function handleCameraLoad(cameraId?: number) {
  if (cameraId) {
    cameraErrors[cameraId] = false
    cameraLoading[cameraId] = false
  }
}

// Initialize loading state for cameras
watch(
  () => query.data.value,
  (cameras) => {
    if (cameras) {
      cameras.forEach((camera) => {
        if (camera.cameraStream.id && cameraLoading[camera.cameraStream.id] === undefined) {
          cameraLoading[camera.cameraStream.id] = true
        }
      })
    }
  },
  { immediate: true }
)

// Clear all filters
function clearFilters() {
  filterPrinter.value = undefined
  showOnlyUnavailable.value = false
  selectedTags.value = []
  selectedPrinterTypes.value = []
}

// Dialog actions
function addCamera() {
  dialog.openDialog({ addOrUpdate: 'add' })
}

function updateCamera(cameraId?: number) {
  if (!cameraId) return
  dialog.openDialog({ addOrUpdate: 'update', cameraId })
}

function confirmDeleteCamera(camera: CameraWithPrinter) {
  const cameraName =
    camera.cameraStream.name || camera.printer?.name || 'this camera'
  if (confirm(`Are you sure you want to delete ${cameraName}?`)) {
    deleteCamera(camera.cameraStream.id)
  }
}

function deleteCamera(cameraId?: number) {
  if (!cameraId) return
  deleteMutation.mutateAsync(cameraId)
}

// Open printer sidenav for associated printer
function openPrinterSideNav(printer: PrinterDto) {
  fileExplorer.openFileExplorer(printer)
}

// Get printer type name
function getPrinterTypeName(printerType?: number) {
  return getServiceName(printerType)
}
</script>

<style scoped>
.camera-grid-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.camera-stream-container {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 2;
  background: #000;
  overflow: hidden;
}

.camera-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 20px;
  text-align: center;
}

.camera-unavailable {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 20px;
  text-align: center;
}

.empty-camera-tile {
  cursor: pointer;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.05);
  aspect-ratio: 5 / 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-camera-tile:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.empty-tile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  width: 100%;
}
</style>
