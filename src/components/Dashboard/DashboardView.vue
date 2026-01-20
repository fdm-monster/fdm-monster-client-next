<template>
  <v-container fluid class="pa-4">
    <!-- Welcome Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="text-center mb-2">
          <h1 class="text-h4 font-weight-bold">Welcome to FDM Monster</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Manage your 3D print farm with ease
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4" elevation="2">
          <v-icon color="green" size="48" class="mb-2">print</v-icon>
          <h2 class="text-h4 font-weight-bold text-green">{{ printingCount }}</h2>
          <p class="text-subtitle-2">Currently Printing</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4" elevation="2">
          <v-icon color="blue" size="48" class="mb-2">settings</v-icon>
          <h2 class="text-h4 font-weight-bold text-blue">{{ operationalCount }}</h2>
          <p class="text-subtitle-2">Ready to Print</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4" elevation="2">
          <v-icon color="orange" size="48" class="mb-2">warning</v-icon>
          <h2 class="text-h4 font-weight-bold text-orange">{{ offlineCount }}</h2>
          <p class="text-subtitle-2">Offline / Issues</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4" elevation="2">
          <v-icon color="purple" size="48" class="mb-2">inventory</v-icon>
          <h2 class="text-h4 font-weight-bold text-purple">{{ totalPrinters }}</h2>
          <p class="text-subtitle-2">Total Printers</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- New User Onboarding -->
    <v-row v-if="isNewUser" class="mb-6">
      <v-col>
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
          icon="rocket_launch"
        >
          <v-alert-title class="mb-2">Welcome to FDM Monster!</v-alert-title>
          <p class="mb-3">
            It looks like you're just getting started. Let's help you set up your 3D print farm.
          </p>
          <v-btn
            color="primary"
            variant="elevated"
            class="mr-3"
            @click="goToPrinterGrid"
          >
            <v-icon class="mr-2">add</v-icon>
            Add Your First Printer
          </v-btn>
          <v-btn
            variant="outlined"
            @click="viewDocumentation"
          >
            <v-icon class="mr-2">help</v-icon>
            View Documentation
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mb-6">
      <v-col>
        <v-card class="pa-4" elevation="2">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon class="mr-2">flash_on</v-icon>
            Quick Actions
          </h3>
          <v-btn-group class="d-flex flex-wrap ga-2">
            <v-btn
              color="primary"
              variant="elevated"
              @click="goToPrinterGrid"
            >
              <v-icon class="mr-2">view_module</v-icon>
              View Printer Grid
            </v-btn>
            <v-btn
              color="secondary"
              variant="elevated"
              @click="goToPrinterList"
            >
              <v-icon class="mr-2">view_module</v-icon>
              View Printer List
            </v-btn>
            <v-btn
              color="success"
              variant="elevated"
              @click="goToCameras"
            >
              <v-icon class="mr-2">camera_alt</v-icon>
              View Cameras
            </v-btn>
            <v-btn
              color="warning"
              variant="elevated"
              @click="gotoJobs"
            >
              <v-icon class="mr-2">analytics</v-icon>
              View Jobs
            </v-btn>
            <v-btn
              variant="elevated"
              color="primary"
              @click="openYamlDialog"
            >
              <v-icon class="mr-2">code</v-icon>
              Import/Export backup
            </v-btn>
            <v-btn
              variant="elevated"
              color="purple"
              @click="openOctoFarmImportDialog"
            >
              <v-icon class="mr-2">publish</v-icon>
              Import OctoFarm printers
            </v-btn>
          </v-btn-group>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Status Overview -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4 fill-height" elevation="2">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 d-flex align-center">
              <v-icon class="mr-2">timeline</v-icon>
              Farm Status Overview
            </h3>
            <div class="d-flex align-center ga-2">
              <PrinterTagFilter
                v-model="selectedTags"
                :tags="tags"
                label="Tags"
                style="width: 200px"
              />
              <PrinterTypeFilter
                v-model="selectedPrinterTypes"
                label="Type"
                style="width: 200px"
              />
            </div>
          </div>

          <!-- Printer Status Grid -->
          <div v-if="totalPrinters > 0" class="printer-status-grid">
            <div
              v-for="printer in filteredPrinters.slice(0, 8)"
              :key="printer.id"
              class="printer-status-item"
              @click="openPrinter()"
            >
              <v-card
                class="pa-3 text-center cursor-pointer hover-effect"
                :class="getPrinterCardClass(printer)"
                elevation="1"
              >
                <div class="printer-name text-subtitle-2 font-weight-medium mb-1">
                  {{ printer.name }}
                </div>
                <v-chip
                  :color="getPrinterStatusColor(printer)"
                  size="x-small"
                  variant="elevated"
                >
                  {{ getPrinterStatus(printer) }}
                </v-chip>
                <div v-if="isPrinterPrintingState(printer)" class="mt-2">
                  <v-progress-linear
                    :model-value="getPrinterProgress(printer)"
                    height="4"
                    color="success"
                    class="mb-1"
                  />
                  <div class="text-caption">
                    {{ getPrinterProgress(printer) }}%
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Show more link if there are more printers -->
            <div v-if="totalPrinters > 8" class="text-center mt-3">
              <v-btn
                variant="outlined"
                size="small"
                @click="goToPrinterGrid"
              >
                View All {{ totalPrinters }} Printers
              </v-btn>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-8">
            <v-icon
              size="80"
              color="surface-variant"
              class="mb-4"
            >
              add_circle
            </v-icon>
            <h3 class="text-h6 mb-2">No printers configured</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Add your first 3D printer to start monitoring your farm
            </p>
            <v-btn
              color="primary"
              variant="elevated"
              @click="goToPrinterGrid"
            >
              <v-icon class="mr-2">add</v-icon>
              Add Printer
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 fill-height" elevation="2">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon class="mr-2">trending_up</v-icon>
            Performance Insights
          </h3>

          <!-- Farm efficiency metrics -->
          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">Farm Utilization</span>
              <strong>{{ farmUtilization }}%</strong>
            </div>
            <v-progress-linear
              :model-value="farmUtilization"
              color="primary"
              height="8"
              rounded
            />
          </div>

          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">Success Rate (24h)</span>
              <strong class="text-green">{{ successRate }}%</strong>
            </div>
            <v-progress-linear
              :model-value="successRate"
              color="success"
              height="8"
              rounded
            />
          </div>

          <!-- Quick stats -->
          <div class="mt-6">
            <div class="d-flex justify-space-between py-2 border-b">
              <span class="text-body-2">Active Jobs</span>
              <strong>{{ activeJobs }}</strong>
            </div>
            <div class="d-flex justify-space-between py-2 border-b">
              <span class="text-body-2">Queue Length</span>
              <strong>{{ queueLength }}</strong>
            </div>
            <div class="d-flex justify-space-between py-2">
              <span class="text-body-2">Avg. Print Time</span>
              <strong>{{ avgPrintTime }}</strong>
            </div>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            block
            class="mt-4"
            @click="gotoJobs"
          >
            <v-icon class="mr-2">analytics</v-icon>
            View Job Analytics
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePrinterStore } from '@/store/printer.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import {
  isPrinterPrinting,
  isPrinterDisconnected,
  isPrinterInMaintenance,
  isPrinterDisabled
} from '@/shared/printer-state.constants'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { PrintJobService, type PrintJobDto } from '@/backend/print-job.service'
import {
  calculateJobPerformanceMetrics,
  formatPrintTime
} from '@/shared/dashboard-statistics'
import { useGlobalQueueQuery } from '@/queries/global-queue.query'

const router = useRouter()
const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()

// Print jobs data for performance insights
const recentJobs = ref<PrintJobDto[]>([])

// Queue data
const { data: queueData } = useGlobalQueueQuery()

const {
  selectedTags,
  selectedPrinterTypes,
  tags,
  loadTags,
  filterPrinters
} = usePrinterFilters()

onMounted(async () => {
  await loadTags()
  await loadRecentJobs()
})

// Load recent jobs for performance metrics
async function loadRecentJobs() {
  try {
    // Get jobs from last 7 days for better statistics
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const response = await PrintJobService.searchJobsPaged({
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      page: 1,
      pageSize: 500 // API maximum
    })

    recentJobs.value = response.items
  } catch (error) {
    console.error('Failed to load recent jobs:', error)
    recentJobs.value = []
  }
}

// Computed properties for dashboard metrics
const printers = computed(() => printerStore.printers)
const filteredPrinters = computed(() => filterPrinters(printers.value))
const totalPrinters = computed(() => printers.value.length)
const printingCount = computed(() => printerStateStore.printingCount)
const operationalCount = computed(() => printerStateStore.operationalNotPrintingCount)
const offlineCount = computed(() =>
  printers.value.filter(p => {
    const state = printerStateStore.printerEventsById[p.id]
    return isPrinterDisconnected(p, state) || isPrinterInMaintenance(p)
  }).length
)

const isNewUser = computed(() => totalPrinters.value === 0)

const farmUtilization = computed(() => {
  if (totalPrinters.value === 0) return 0
  return Math.round((printingCount.value / totalPrinters.value) * 100)
})

// Job performance metrics computed from real data
const jobMetrics = computed(() => {
  return calculateJobPerformanceMetrics(recentJobs.value, 24)
})

const successRate = computed(() => jobMetrics.value.successRate)
const activeJobs = computed(() => jobMetrics.value.activeJobs)
const queueLength = computed(() => queueData.value?.totalJobs || 0)
const avgPrintTime = computed(() => formatPrintTime(jobMetrics.value.averagePrintTimeHours))

// Navigation methods
const goToPrinterGrid = () => {
  router.push('/printer-grid')
}

const goToPrinterList = () => {
  router.push('/printer-list')
}

const goToCameras = () => {
  router.push('/cameras')
}

const gotoJobs = () => {
  router.push('/jobs')
}

const viewDocumentation = () => {
  globalThis.open('https://docs.fdm-monster.net', '_blank')
}

const openYamlDialog = () => {
  useDialog(DialogName.YamlImportExport).openDialog()
}

const openOctoFarmImportDialog = () => {
  useDialog(DialogName.ImportOctoFarmDialog).openDialog()
}

// Printer interaction methods
const openPrinter = () => {
  router.push('/printer-grid')
}

// Printer status helpers
const isPrinterPrintingState = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  return isPrinterPrinting(state)
}

const getPrinterStatus = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  if (isPrinterInMaintenance(printer)) return 'MAINTENANCE'
  if (isPrinterDisabled(printer)) return 'DISABLED'
  if (isPrinterDisconnected(printer, state)) return 'OFFLINE'
  if (isPrinterPrinting(state)) return 'PRINTING'
  return 'READY'
}

const getPrinterStatusColor = (printer: any) => {
  const status = getPrinterStatus(printer)
  switch (status) {
    case 'PRINTING': return 'success'
    case 'READY': return 'primary'
    case 'MAINTENANCE': return 'warning'
    case 'OFFLINE': return 'error'
    case 'DISABLED': return 'secondary'
    default: return 'surface'
  }
}

const getPrinterCardClass = (printer: any) => {
  const status = getPrinterStatus(printer)
  return {
    'border-l-4 border-success': status === 'PRINTING',
    'border-l-4 border-primary': status === 'READY',
    'border-l-4 border-warning': status === 'MAINTENANCE',
    'border-l-4 border-error': status === 'OFFLINE',
    'border-l-4 border-secondary': status === 'DISABLED'
  }
}

const getPrinterProgress = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  return state?.current?.payload?.progress?.completion?.toFixed(1) || 0
}
</script>

<style scoped>
.printer-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.printer-status-item {
  transition: transform 0.2s ease-in-out;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
