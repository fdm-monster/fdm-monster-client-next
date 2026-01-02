<template>
  <v-container fluid class="print-jobs-container">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h5 font-weight-bold mb-1">Print Jobs</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Track and monitor all your 3D printing jobs
            </p>
          </div>
          <v-chip
            v-if="totalJobs > 0"
            color="primary"
            variant="elevated"
            size="default"
            class="px-3"
          >
            <v-icon start size="small">work</v-icon>
            {{ totalJobs }} jobs
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters Section -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="d-flex align-center py-2">
        <v-icon class="mr-2" color="primary" size="small">search</v-icon>
        <span class="text-subtitle-1">Search & Filters</span>
        <v-spacer />
        <v-btn
          color="primary"
          @click="loadPrintJobs"
          :loading="loading"
          variant="elevated"
          size="small"
        >
          <v-icon size="small">refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.searchPrinter"
              label="Search by printer"
              prepend-inner-icon="print"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.searchFile"
              label="Search by file"
              prepend-inner-icon="description"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
        </v-row>

        <v-row dense class="mt-2">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchParams.startDate"
              label="Start Date"
              type="date"
              variant="outlined"
              density="compact"
              prepend-inner-icon="event"
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchParams.endDate"
              label="End Date"
              type="date"
              variant="outlined"
              density="compact"
              prepend-inner-icon="event"
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="4">
            <PrinterTypeFilter
              v-model="selectedPrinterTypes"
              label="Filter by Type"
            />
          </v-col>
        </v-row>

        <v-row v-if="tags.length" dense class="mt-2">
          <v-col cols="12">
            <PrinterTagFilter
              v-model="selectedTags"
              :tags="tags"
              label="Filter by Tags"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Results Section -->
    <v-card elevation="1">
      <v-card-title class="d-flex align-center py-2">
        <v-icon class="mr-2" color="primary" size="small">list_alt</v-icon>
        <span class="text-subtitle-1">Results</span>
        <v-spacer />
        <div v-if="!loading && totalJobs > 0" class="text-caption text-medium-emphasis">
          {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalJobs) }} of {{ totalJobs }}
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="currentPage"
          :headers="headers"
          :items="filteredPrintJobs"
          :items-length="totalJobs"
          :loading="loading"
          :search="searchText"
          class="print-jobs-table"
          loading-text="Loading print jobs..."
          no-data-text="No print jobs found"
          @update:options="loadPrintJobs"
        >
          <!-- Thumbnail Column -->
          <template #item.thumbnail="{ item }">
            <JobThumbnailCell :job-id="item.id" />
          </template>

          <!-- Status Column -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              :icon="getStatusIcon(item.status)"
              size="small"
              variant="elevated"
            >
              {{ item.status || 'Unknown' }}
            </v-chip>
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

          <!-- Ended Date Column -->
          <template #item.endedAt="{ item }">
            <div v-if="item.endedAt" class="text-body-2">
              <div>{{ formatDate(item.endedAt) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(item.endedAt) }}
              </div>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Progress Column -->
          <template #item.progress="{ item }">
            <div v-if="item.progress !== null" class="progress-container">
              <v-progress-linear
                :model-value="item.progress"
                :color="getProgressColor(item.progress)"
                height="20"
                rounded
                class="mb-1"
              >
                <template #default>
                  <span class="text-caption font-weight-bold">
                    {{ Math.round(item.progress) }}%
                  </span>
                </template>
              </v-progress-linear>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Duration Column -->
          <template #item.duration="{ item }">
            <div v-if="item.statistics?.actualPrintTimeSeconds" class="text-body-2">
              <v-chip
                :color="getDurationColor(item.statistics.actualPrintTimeSeconds)"
                size="small"
                variant="tonal"
              >
                <v-icon start size="small">schedule</v-icon>
                {{ formatDuration(item.statistics.actualPrintTimeSeconds) }}
              </v-chip>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Printer Name Column -->
          <template #item.printerName="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" class="mr-2" color="primary">
                <v-icon size="small">print</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ item.printerName || `Printer ${item.printerId}` }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ getFloorName(item.printerId) }}
                </div>
              </div>
            </div>
          </template>

          <!-- File Name Column -->
          <template #item.fileName="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="small" color="primary">description</v-icon>
              <div>
                <div class="text-body-2 font-weight-medium">{{ item.fileName }}</div>
                <div v-if="item.metadata?.gcodePrintTimeSeconds" class="text-caption text-medium-emphasis">
                  Est. {{ formatDuration(item.metadata.gcodePrintTimeSeconds) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Reason Column -->
          <template #item.reason="{ item }">
            <v-tooltip location="top" v-if="item.statusReason">
              <template #activator="{ props }">
                <v-icon v-bind="props" color="warning" size="small">info</v-icon>
              </template>
              <span>{{ item.statusReason }}</span>
            </v-tooltip>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Filament Column -->
          <template #item.filament="{ item }">
            <div v-if="item.metadata?.filamentUsedGrams || item.metadata?.filamentUsedMm" class="filament-info">
              <v-chip
                color="green"
                size="small"
                variant="tonal"
                v-if="item.metadata?.filamentUsedGrams"
              >
                <v-icon start size="small">fitness_center</v-icon>
                {{ Math.round(item.metadata.filamentUsedGrams) }}g
              </v-chip>
              <div v-if="item.metadata?.filamentUsedMm" class="text-caption text-medium-emphasis mt-1">
                {{ Math.round(item.metadata.filamentUsedMm / 1000) }}m
              </div>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  v-bind="props"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="viewJobDetails(item)">
                  <template #prepend>
                    <v-icon>info</v-icon>
                  </template>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="handleAddToQueue(item)"
                  :disabled="!canAddToQueue(item)"
                >
                  <template #prepend>
                    <v-icon>playlist_add</v-icon>
                  </template>
                  <v-list-item-title>Add to Queue</v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item
                  @click="handleReAnalyzeJob(item)"
                  :disabled="!canReAnalyzeJob(item)"
                >
                  <template #prepend>
                    <v-icon>refresh</v-icon>
                  </template>
                  <v-list-item-title>Re-Analyze</v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="handleMarkAsCompleted(item)"
                  :disabled="!canMarkAsCompleted(item)"
                >
                  <template #prepend>
                    <v-icon>check_circle</v-icon>
                  </template>
                  <v-list-item-title>Mark as Completed</v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item
                  @click="handleDeleteJob(item)"
                  :disabled="!canDeleteJob(item)"
                  class="text-error"
                >
                  <template #prepend>
                    <v-icon color="error">delete</v-icon>
                  </template>
                  <v-list-item-title>Delete Job</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- Loading State -->
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Empty State -->
    <v-card v-if="!loading && totalJobs === 0" class="mt-4" elevation="1">
      <v-card-text class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1" class="mb-3">work_off</v-icon>
        <h3 class="text-subtitle-1 mb-2">No Print Jobs Found</h3>
        <p class="text-body-2 text-medium-emphasis mb-3">
          Try adjusting your search criteria or date range
        </p>
        <v-btn color="primary" size="small" @click="clearFilters">
          <v-icon size="small">clear_all</v-icon>
          Clear Filters
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Mark as Completed Confirmation Dialog -->
    <v-dialog v-model="showCompleteConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center bg-success text-on-success">
          <v-icon class="mr-3">check_circle</v-icon>
          <span>Mark Job as Completed?</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-2">
            Are you sure you want to mark this print job as completed?
          </p>
          <v-alert type="info" density="compact" class="mb-2">
            <strong>Job:</strong> {{ jobToComplete?.fileName }}
          </v-alert>
          <p class="text-body-2 text-medium-emphasis">
            This will set the job status to COMPLETED and update the end time to now.
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelMarkAsCompleted"
            :disabled="completing"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="confirmMarkAsCompleted"
            :loading="completing"
          >
            Mark as Completed
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add to Queue Dialog -->
    <v-dialog v-model="showAddToQueueDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center bg-primary text-on-primary">
          <v-icon class="mr-3">playlist_add</v-icon>
          <span>Add Job to Queue</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-3">
            Select which printer(s) should queue this job:
          </p>
          <v-alert type="info" density="compact" class="mb-3">
            <strong>Job:</strong> {{ jobToQueue?.fileName }}
          </v-alert>

          <!-- Printer Selection -->
          <v-select
            v-model="selectedPrintersForQueue"
            :items="availablePrinters"
            item-title="name"
            item-value="id"
            label="Select Printer(s)"
            multiple
            chips
            prepend-inner-icon="print"
            variant="outlined"
            density="comfortable"
            hint="You can select multiple printers"
            persistent-hint
          >
            <template #chip="{ item, props }">
              <v-chip v-bind="props" color="primary" closable>
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelAddToQueue"
            :disabled="addingToQueue"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="confirmAddToQueue"
            :loading="addingToQueue"
            :disabled="selectedPrintersForQueue.length === 0"
          >
            Add to Queue ({{ selectedPrintersForQueue.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center bg-error text-on-error">
          <v-icon class="mr-3">warning</v-icon>
          <span>Delete Print Job?</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-2">
            Are you sure you want to delete this print job?
          </p>
          <v-alert type="info" density="compact" class="mb-2">
            <strong>Job:</strong> {{ jobToDelete?.fileName }}
          </v-alert>
          <p class="text-body-2 text-medium-emphasis">
            This action cannot be undone. All job data and metadata will be permanently removed.
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelDelete"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmDeleteJob"
            :loading="deleting"
          >
            Delete Job
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { PrintJobsService, type PrintJobDto, type PrintJobSearchPagedParams } from '@/backend/print-jobs.service'
import { PrintQueueService } from '@/backend/print-queue.service'
import { useFloorStore } from '@/store/floor.store'
import { useDebounceFn } from '@vueuse/core'
import { usePrinterStore } from '@/store/printer.store'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'
import JobThumbnailCell from '@/components/PrintJobs/JobThumbnailCell.vue'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'

const printJobs = ref<PrintJobDto[]>([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(25)
const totalJobs = ref(0)


// Snackbar for notifications
const { info, error } = useSnackbar()

const printerStore = usePrinterStore()
const floorStore = useFloorStore()

// Dialog composables
const jobDetailsDialog = useDialog(DialogName.PrintJobDetailsDialog)

// Delete confirmation
const showDeleteConfirmDialog = ref(false)
const jobToDelete = ref<PrintJobDto | null>(null)
const deleting = ref(false)

// Mark as completed confirmation
const showCompleteConfirmDialog = ref(false)
const jobToComplete = ref<PrintJobDto | null>(null)
const completing = ref(false)

// Add to queue confirmation
const showAddToQueueDialog = ref(false)
const jobToQueue = ref<PrintJobDto | null>(null)
const selectedPrintersForQueue = ref<number[]>([])
const addingToQueue = ref(false)

const {
  selectedTags,
  selectedPrinterTypes,
  tags,
  tagsWithPrinters,
  loadTags
} = usePrinterFilters()

// Calculate default date range: last week to today
const today = new Date()
const lastWeek = new Date(today)
lastWeek.setDate(lastWeek.getDate() - 7)

const searchParams = ref<PrintJobSearchPagedParams>({
  searchPrinter: '',
  searchFile: '',
  startDate: lastWeek.toISOString().split('T')[0], // Format: YYYY-MM-DD
  endDate: today.toISOString().split('T')[0], // Format: YYYY-MM-DD
  page: 1,
  pageSize: 25
})

const searchText = computed(() => {
  return [searchParams.value.searchPrinter, searchParams.value.searchFile]
    .filter(Boolean)
    .join(' ')
})

const filteredPrintJobs = computed(() => {
  let filtered = printJobs.value

  // Filter by tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(job => {
      if (!job.printerId) return false
      return tagsWithPrinters.value.some(group =>
        selectedTags.value.includes(group.id) &&
        group.printers.some(p => p.printerId === job.printerId)
      )
    })
  }

  // Filter by printer type
  if (selectedPrinterTypes.value.length > 0) {
    filtered = filtered.filter(job => {
      if (!job.printerId) return false
      const printer = printerStore.printers.find(p => p.id === job.printerId)
      return printer && selectedPrinterTypes.value.includes(printer.printerType)
    })
  }

  return filtered
})

const headers = [
  { title: '', key: 'thumbnail', sortable: false, width: '80px' },
  { title: 'Printer', key: 'printerName', sortable: false },
  { title: 'File Name', key: 'fileName', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Progress', key: 'progress', sortable: false },
  { title: 'Started', key: 'createdAt', sortable: false },
  { title: 'Ended', key: 'endedAt', sortable: false },
  { title: 'Duration', key: 'duration', sortable: false },
  { title: 'Filament', key: 'filament', sortable: false },
  { title: 'Reason', key: 'reason', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const }
]

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadPrintJobs()
}, 500)

onMounted(async () => {
  await loadPrintJobs()
  await loadTags()
})

const loadPrintJobs = async () => {
  console.debug('[LoadJobs] loadPrintJobs called, loading state:', loading.value)

  // Prevent concurrent calls
  if (loading.value) {
    console.debug('[LoadJobs] Already loading, skipping...')
    return
  }

  loading.value = true
  try {
    const params: PrintJobSearchPagedParams = {
      ...searchParams.value,
      page: currentPage.value,
      pageSize: itemsPerPage.value
    }

    // Remove empty strings to avoid sending unnecessary parameters
    Object.keys(params).forEach(key => {
      if (params[key as keyof PrintJobSearchPagedParams] === '') {
        delete params[key as keyof PrintJobSearchPagedParams]
      }
    })

    console.debug('[LoadJobs] Fetching jobs with params:', params)
    const response = await PrintJobsService.searchJobsPaged(params)
    printJobs.value = response.items
    totalJobs.value = response.count
    console.debug('[LoadJobs] Received', response.items.length, 'jobs')
    // Thumbnails are now loaded by JobThumbnailCell components using useJobThumbnailQuery
  } catch (error) {
    console.error('Failed to load print jobs:', error)
    printJobs.value = []
    totalJobs.value = 0
  } finally {
    loading.value = false
  }
}


const getStatusColor = (status: string | null): string => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'FAILED':
      return 'error'
    case 'CANCELLED':
      return 'warning'
    case 'PRINTING':
    case 'STARTING':
      return 'primary'
    case 'PAUSED':
      return 'orange'
    case 'ANALYZING':
    case 'ANALYZED':
    case 'QUEUED':
      return 'info'
    case 'PENDING':
      return 'grey-darken-1'
    case 'UNKNOWN':
      return 'grey'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status: string | null): string => {
  switch (status) {
    case 'COMPLETED':
      return 'check_circle'
    case 'FAILED':
      return 'error'
    case 'CANCELLED':
      return 'cancel'
    case 'PRINTING':
      return 'play_circle'
    case 'STARTING':
      return 'play_arrow'
    case 'PAUSED':
      return 'pause_circle'
    case 'QUEUED':
      return 'queue'
    case 'PENDING':
      return 'schedule'
    case 'UNKNOWN':
      return 'help_outline'
    default:
      return 'help'
  }
}

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'success'
  if (progress >= 50) return 'primary'
  if (progress >= 25) return 'warning'
  return 'error'
}

const getDurationColor = (seconds: number): string => {
  const hours = seconds / 3600
  if (hours < 1) return 'success'
  if (hours < 4) return 'primary'
  if (hours < 8) return 'warning'
  return 'error'
}

const formatDate = (dateString: Date): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString: Date): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks}w ago`
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getFloorName = (printerId: number | null): string => {
  if (!printerId) return 'Unknown'
  const floor = floorStore.floorOfPrinter(printerId)
  return floor?.name || 'No floor assigned'
}

const clearFilters = () => {
  searchParams.value = {
    searchPrinter: '',
    searchFile: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 25
  }
  currentPage.value = 1
  loadPrintJobs()
}

const viewJobDetails = (job: PrintJobDto) => {
  jobDetailsDialog.openDialog({ jobId: job.id })
}

// Available printers for queue selection
const availablePrinters = computed(() => {
  return printerStore.printers.filter(p => !p.disabled)
})

// Note: Job updates/deletes will be handled by the dialog itself
// We just need to reload the jobs list when the dialog closes
// This can be done by watching for dialog close events or manually refreshing

const canAddToQueue = (job: PrintJobDto): boolean => {
  // Allow adding to queue for completed jobs
  return job.status === 'COMPLETED'
}

const canReAnalyzeJob = (job: PrintJobDto): boolean => {
  // Allow re-analysis for jobs that are not currently printing or starting
  return job.status !== 'PRINTING' && job.status !== 'STARTING'
}

const canMarkAsCompleted = (job: PrintJobDto): boolean => {
  // Allow marking as completed for jobs that are printing, paused, failed, cancelled, or unknown
  return job.status === 'PRINTING' ||
         job.status === 'PAUSED' ||
         job.status === 'FAILED' ||
         job.status === 'CANCELLED' ||
         job.status === 'UNKNOWN'
}

const canDeleteJob = (job: PrintJobDto): boolean => {
  // Allow deletion for jobs that are not currently printing
  return job.status !== 'PRINTING' && job.status !== 'STARTING'
}

const handleReAnalyzeJob = async (job: PrintJobDto) => {
  try {
    const updatedJob = await PrintJobsService.reAnalyzeJob(job.id)

    // Update the job in the list
    const index = printJobs.value.findIndex(j => j.id === job.id)
    if (index !== -1) {
      printJobs.value[index] = updatedJob
    }

    info(
      'Job Re-Analysis Started',
      `Re-analysis triggered for "${job.fileName}". The job will be analyzed in the background.`,
      5000
    )
  } catch (err: any) {
    console.error('Failed to re-analyze job:', err)
    error(
      'Re-Analysis Failed',
      err?.response?.data?.message || err?.message || 'Failed to trigger job re-analysis. Please try again.'
    )
  }
}

const handleMarkAsCompleted = (job: PrintJobDto) => {
  jobToComplete.value = job
  showCompleteConfirmDialog.value = true
}

const confirmMarkAsCompleted = async () => {
  if (!jobToComplete.value) return

  completing.value = true
  try {
    const updatedJob = await PrintJobsService.setJobCompleted(jobToComplete.value.id)

    // Update the job in the list
    const index = printJobs.value.findIndex(j => j.id === jobToComplete.value!.id)
    if (index !== -1) {
      printJobs.value[index] = updatedJob
    }

    info(
      'Job Marked as Completed',
      `Successfully marked "${jobToComplete.value.fileName}" as completed.`,
      3000
    )

    showCompleteConfirmDialog.value = false
    jobToComplete.value = null
  } catch (err: any) {
    console.error('Failed to mark job as completed:', err)
    error(
      'Mark as Completed Failed',
      err?.response?.data?.message || err?.message || 'Failed to mark job as completed. Please try again.'
    )
  } finally {
    completing.value = false
  }
}

const cancelMarkAsCompleted = () => {
  showCompleteConfirmDialog.value = false
  jobToComplete.value = null
}

const handleDeleteJob = (job: PrintJobDto) => {
  jobToDelete.value = job
  showDeleteConfirmDialog.value = true
}

const confirmDeleteJob = async () => {
  if (!jobToDelete.value) return

  deleting.value = true
  try {
    await PrintJobsService.deleteJob(jobToDelete.value.id)

    // Remove the job from the list
    const index = printJobs.value.findIndex(j => j.id === jobToDelete.value!.id)
    if (index !== -1) {
      printJobs.value.splice(index, 1)
      totalJobs.value--
    }

    info(
      'Job Deleted',
      `Successfully deleted job "${jobToDelete.value.fileName}".`,
      3000
    )

    showDeleteConfirmDialog.value = false
    jobToDelete.value = null
  } catch (err: any) {
    console.error('Failed to delete job:', err)
    error(
      'Delete Failed',
      err?.response?.data?.message || err?.message || 'Failed to delete job. Please try again.'
    )
  } finally {
    deleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteConfirmDialog.value = false
  jobToDelete.value = null
}
</script>

<style scoped>
.print-jobs-container {
  max-width: 100%;
  padding: 0 16px;
}

.print-jobs-table {
  border-radius: 8px !important;
}

.progress-container {
  min-width: 120px;
}

.filament-info {
  min-width: 100px;
}

.thumbnail-container {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
}

.thumbnail-loading {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-surface-variant), 0.3) 25%,
    rgba(var(--v-theme-surface-variant), 0.5) 50%,
    rgba(var(--v-theme-surface-variant), 0.3) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

:deep(.v-data-table-header) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

:deep(.v-card-title) {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

:deep(.v-skeleton-loader__bone) {
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>

