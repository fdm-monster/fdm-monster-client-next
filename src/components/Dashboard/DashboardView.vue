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
            @click="goToSettings"
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
              Manage Printers
            </v-btn>
            <v-btn
              color="success"
              variant="elevated"
              @click="goToCameras"
              :disabled="totalPrinters === 0"
            >
              <v-icon class="mr-2">camera_alt</v-icon>
              View Cameras
            </v-btn>
            <v-btn
              variant="outlined"
              @click="goToStatistics"
            >
              <v-icon class="mr-2">analytics</v-icon>
              View Statistics
            </v-btn>
          </v-btn-group>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Status Overview -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4 fill-height" elevation="2">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon class="mr-2">timeline</v-icon>
            Farm Status Overview
          </h3>

          <!-- Printer Status Grid -->
          <div v-if="totalPrinters > 0" class="printer-status-grid">
            <div
              v-for="printer in printers.slice(0, 8)"
              :key="printer.id"
              class="printer-status-item"
              @click="openPrinter(printer)"
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
              @click="goToSettings"
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
            @click="goToStatistics"
          >
            <v-icon class="mr-2">analytics</v-icon>
            View Detailed Analytics
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePrinterStore } from '@/store/printer.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import {
  isPrinterPrinting,
  isPrinterDisconnected,
  isPrinterInMaintenance
} from '@/shared/printer-state.constants'

const router = useRouter()
const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()

// Computed properties for dashboard metrics
const printers = computed(() => printerStore.printers)
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

const successRate = computed(() => {
  // This would need to be implemented with actual statistics data
  // For now, return a placeholder
  return 94
})

const activeJobs = computed(() => printingCount.value)
const queueLength = computed(() => 0) // Placeholder - would need queue implementation
const avgPrintTime = computed(() => '2h 34m') // Placeholder - would calculate from stats

// Navigation methods
const goToPrinterGrid = () => {
  router.push('/printers-grid')
}

const goToCameras = () => {
  router.push('/cameras')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToStatistics = () => {
  router.push('/statistics')
}

const viewDocumentation = () => {
  window.open('https://docs.fdm-monster.net', '_blank')
}

// Printer interaction methods
const openPrinter = (printer: any) => {
  router.push('/printers-grid')
}

// Printer status helpers
const isPrinterPrintingState = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  return isPrinterPrinting(state)
}

const getPrinterStatus = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  if (isPrinterInMaintenance(printer)) return 'MAINTENANCE'
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
    default: return 'surface'
  }
}

const getPrinterCardClass = (printer: any) => {
  const status = getPrinterStatus(printer)
  return {
    'border-l-4 border-success': status === 'PRINTING',
    'border-l-4 border-primary': status === 'READY',
    'border-l-4 border-warning': status === 'MAINTENANCE',
    'border-l-4 border-error': status === 'OFFLINE'
  }
}

const getPrinterProgress = (printer: any) => {
  const state = printerStateStore.printerEventsById[printer.id]
  return state?.current?.payload?.progress?.completion || 0
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
