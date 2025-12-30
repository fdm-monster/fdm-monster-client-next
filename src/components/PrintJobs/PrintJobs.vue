<template>
  <v-container fluid class="print-jobs-container">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Print Jobs</h1>
            <p class="text-subtitle-1 text-medium-emphasis mb-0">
              Track and monitor all your 3D printing jobs
            </p>
          </div>
          <v-chip
            v-if="totalJobs > 0"
            color="primary"
            variant="elevated"
            size="large"
            class="px-4"
          >
            <v-icon start>work</v-icon>
            {{ totalJobs }} jobs found
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters Section -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center pb-0">
        <v-icon class="mr-3" color="primary">search</v-icon>
        <span class="text-h6">Search & Filters</span>
        <v-spacer />
        <v-btn
          color="primary"
          @click="loadPrintJobs"
          :loading="loading"
          variant="elevated"
        >
          <v-icon left>refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.searchPrinter"
              label="Search by printer name"
              prepend-inner-icon="print"
              variant="outlined"
              clearable
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.searchFile"
              label="Search by file name"
              prepend-inner-icon="description"
              variant="outlined"
              clearable
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
        </v-row>

        <v-row class="mt-3">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.startDate"
              label="Start Date"
              type="date"
              variant="outlined"
              prepend-inner-icon="event"
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchParams.endDate"
              label="End Date"
              type="date"
              variant="outlined"
              prepend-inner-icon="event"
              hide-details
              @input="debouncedSearch"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Results Section -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3" color="primary">list_alt</v-icon>
        <span class="text-h6">Print Jobs Results</span>
        <v-spacer />
        <div v-if="!loading && totalJobs > 0" class="text-caption text-medium-emphasis">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalJobs) }} of {{ totalJobs }} jobs
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="currentPage"
          :headers="headers"
          :items="printJobs"
          :items-length="totalJobs"
          :loading="loading"
          :search="searchText"
          class="print-jobs-table"
          loading-text="Loading print jobs..."
          no-data-text="No print jobs found"
          @update:options="loadPrintJobs"
        >
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
            <div v-if="item.actualPrintTimeSeconds" class="text-body-2">
              <v-chip
                :color="getDurationColor(item.actualPrintTimeSeconds)"
                size="small"
                variant="tonal"
              >
                <v-icon start size="small">schedule</v-icon>
                {{ formatDuration(item.actualPrintTimeSeconds) }}
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
                <div v-if="item.gcodePrintTimeSeconds" class="text-caption text-medium-emphasis">
                  Est. {{ formatDuration(item.gcodePrintTimeSeconds) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Reason Column -->
          <template #item.reason="{ item }">
            <v-tooltip location="top" v-if="item.reason">
              <template #activator="{ props }">
                <v-icon v-bind="props" color="warning" size="small">info</v-icon>
              </template>
              <span>{{ item.reason }}</span>
            </v-tooltip>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Filament Column -->
          <template #item.filament="{ item }">
            <div v-if="item.filamentUsedGrams || item.filamentUsedMm" class="filament-info">
              <v-chip
                color="green"
                size="small"
                variant="tonal"
                v-if="item.filamentUsedGrams"
              >
                <v-icon start size="small">fitness_center</v-icon>
                {{ Math.round(item.filamentUsedGrams) }}g
              </v-chip>
              <div v-if="item.filamentUsedMm" class="text-caption text-medium-emphasis mt-1">
                {{ Math.round(item.filamentUsedMm / 1000) }}m
              </div>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Loading State -->
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Empty State -->
    <v-card v-if="!loading && totalJobs === 0" class="mt-6" elevation="1">
      <v-card-text class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">work_off</v-icon>
        <h3 class="text-h6 mb-2">No Print Jobs Found</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Try adjusting your search criteria or date range
        </p>
        <v-btn color="primary" @click="clearFilters">
          <v-icon left>clear_all</v-icon>
          Clear Filters
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { PrintJobsService, type PrintJobDto, type PrintJobSearchPagedParams } from '@/backend/print-jobs.service'
import { useFloorStore } from '@/store/floor.store'
import { useDebounceFn } from '@vueuse/core'

const printJobs = ref<PrintJobDto[]>([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(25)
const totalJobs = ref(0)

const searchParams = ref<PrintJobSearchPagedParams>({
  searchPrinter: '',
  searchFile: '',
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 25
})

const floorStore = useFloorStore()

const searchText = computed(() => {
  return [searchParams.value.searchPrinter, searchParams.value.searchFile]
    .filter(Boolean)
    .join(' ')
})

const headers = [
  { title: 'Printer', key: 'printerName', sortable: false },
  { title: 'File Name', key: 'fileName', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Progress', key: 'progress', sortable: false },
  { title: 'Started', key: 'createdAt', sortable: false },
  { title: 'Ended', key: 'endedAt', sortable: false },
  { title: 'Duration', key: 'duration', sortable: false },
  { title: 'Filament', key: 'filament', sortable: false },
  { title: 'Reason', key: 'reason', sortable: false }
]

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadPrintJobs()
}, 500)

onMounted(async () => {
  await loadPrintJobs()
})

const loadPrintJobs = async () => {
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

    const response = await PrintJobsService.searchJobsPaged(params)
    printJobs.value = response.items
    totalJobs.value = response.count
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
    case 'FINISHED':
      return 'success'
    case 'FAILED':
      return 'error'
    case 'STARTED':
      return 'primary'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status: string | null): string => {
  switch (status) {
    case 'FINISHED':
      return 'check_circle'
    case 'FAILED':
      return 'error'
    case 'STARTED':
      return 'play_circle'
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
</script>

<style scoped>
.print-jobs-container {
  min-height: 100vh;
}

.print-jobs-table {
  border-radius: 8px !important;
}

.progress-container {
  min-width: 120px;
}

.filament-info {
  min-width: 80px;
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

