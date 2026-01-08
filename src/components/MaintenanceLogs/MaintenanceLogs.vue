<template>
  <v-container fluid class="maintenance-logs-container">
    <!-- Search and Filters Section -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="d-flex align-center py-2">
        <v-icon class="mr-2" color="primary" size="small">search</v-icon>
        <span class="text-subtitle-1">Search & Filters</span>
        <v-spacer/>

        <v-btn
          color="primary"
          @click="loadLogs"
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
            <v-autocomplete
              v-model="selectedPrinterId"
              :items="allPrinters"
              item-title="name"
              item-value="id"
              label="Filter by printer"
              prepend-inner-icon="print"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Filter by status"
              prepend-inner-icon="info"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="debouncedSearch"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Results Section -->
    <v-card elevation="1">
      <v-card-title class="d-flex align-center py-2">
        <v-icon class="mr-2" color="primary" size="small">list_alt</v-icon>
        <span class="text-subtitle-1">Maintenance Logs</span>
        <v-spacer/>

        <div v-if="!loading && totalLogs > 0" class="text-caption text-medium-emphasis">
          {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalLogs) }} of
          {{ totalLogs }}
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="currentPage"
          :headers="headers"
          :items="logs"
          :items-length="totalLogs"
          :loading="loading"
          class="maintenance-logs-table"
          loading-text="Loading maintenance logs..."
          no-data-text="No maintenance logs found"
          @update:options="handleUpdateOptions"
        >
          <!-- Status Column -->
          <template #item.completed="{ item }">
            <v-chip
              :color="item.completed ? 'success' : 'warning'"
              :icon="item.completed ? 'check_circle' : 'build'"
              size="small"
              variant="elevated"
            >
              {{ item.completed ? 'Completed' : 'Active' }}
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

          <!-- Completed Date Column -->
          <template #item.completedAt="{ item }">
            <div v-if="item.completedAt" class="text-body-2">
              <div>{{ formatDate(item.completedAt) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(item.completedAt) }}
              </div>
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
                  ID: {{ item.printerId }}
                </div>
              </div>
            </div>
          </template>

          <!-- Cause Column -->
          <template #item.cause="{ item }">
            <div v-if="item.metadata?.cause" class="text-body-2">
              {{ item.metadata.cause }}
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Parts Involved Column -->
          <template #item.partsInvolved="{ item }">
            <div v-if="item.metadata?.partsInvolved?.length" class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="(part, index) in item.metadata.partsInvolved.slice(0, 3)"
                :key="index"
                size="x-small"
                color="info"
                variant="tonal"
              >
                {{ part }}
              </v-chip>
              <v-chip
                v-if="item.metadata.partsInvolved.length > 3"
                size="x-small"
                color="info"
                variant="text"
              >
                +{{ item.metadata.partsInvolved.length - 3 }}
              </v-chip>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <!-- Created By Column -->
          <template #item.createdBy="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" class="mr-2" color="secondary">
                <v-icon size="small">person</v-icon>
              </v-avatar>
              <div class="text-body-2">
                {{ item.createdBy }}
              </div>
            </div>
          </template>

          <!-- Completed By Column -->
          <template #item.completedBy="{ item }">
            <div v-if="item.completedBy" class="d-flex align-center">
              <v-avatar size="24" class="mr-2" color="secondary">
                <v-icon size="small">person</v-icon>
              </v-avatar>
              <div class="text-body-2">
                {{ item.completedBy }}
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
                <v-list-item @click="viewLogDetails(item)">
                  <template #prepend>
                    <v-icon>info</v-icon>
                  </template>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-if="!item.completed"
                  @click="completeLog(item)"
                >
                  <template #prepend>
                    <v-icon>check_circle</v-icon>
                  </template>
                  <v-list-item-title>Mark as Completed</v-list-item-title>
                </v-list-item>

                <v-divider/>

                <v-list-item
                  @click="deleteLog(item)"
                  class="text-error"
                >
                  <template #prepend>
                    <v-icon color="error">delete</v-icon>
                  </template>
                  <v-list-item-title>Delete Log</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Details Dialog -->
    <MaintenanceLogDetailsDialog
      v-model="detailsDialog"
      :log="selectedLog"
      @updated="loadLogs"
    />
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { PrinterMaintenanceLogService } from '@/backend'
import { PrinterMaintenanceLog } from '@/models/printers/printer-maintenance-log.model'
import { usePrinterStore } from '@/store/printer.store'
import { formatDate, formatRelativeTime } from '@/utils/date-time.utils'
import MaintenanceLogDetailsDialog from './MaintenanceLogDetailsDialog.vue'

const printerStore = usePrinterStore()

// State
const logs = ref<PrinterMaintenanceLog[]>([])
const loading = ref(false)
const totalLogs = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(20)
const selectedPrinterId = ref<number | undefined>(undefined)
const selectedStatus = ref<'active' | 'completed' | undefined>(undefined)
const detailsDialog = ref(false)
const selectedLog = ref<PrinterMaintenanceLog | null>(null)

// Computed
const allPrinters = computed(() => printerStore.printers)

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Completed', value: 'completed' }
]
// Headers
const headers = [
  { title: 'Status', key: 'completed', sortable: false, width: '120px' },
  { title: 'Printer', key: 'printerName', sortable: false, width: '200px' },
  { title: 'Cause', key: 'cause', sortable: false, width: '200px' },
  { title: 'Parts Involved', key: 'parts', sortable: false, width: '180px' },
  { title: 'Created', key: 'createdAt', sortable: false, width: '180px' },
  { title: 'Created By', key: 'createdBy', sortable: false, width: '150px' },
  { title: 'Completed', key: 'completedAt', sortable: false, width: '180px' },
  { title: 'Duration', key: 'duration', sortable: false, width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '100px' }
]

// Methods
async function loadLogs() {
  loading.value = true
  try {
    const response = await PrinterMaintenanceLogService.listLogs({
      printerId: selectedPrinterId.value,
      completed: selectedStatus.value === 'active' ? false : selectedStatus.value === 'completed' ? true : undefined,
      page: currentPage.value,
      pageSize: itemsPerPage.value
    })

    logs.value = response.logs
    totalLogs.value = response.total
  } catch (error) {
    console.error('Failed to load maintenance logs:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadMaintenanceLogs()
  }, 300)
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function handleUpdateOptions(options: any) {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  loadMaintenanceLogs()
}

function calculateDuration(startDate: string, endDate: string) {
  selectedLog.value = log
  detailsDialog.value = true
}

async function completeLog(log: PrinterMaintenanceLog) {
  try {
    await PrinterMaintenanceLogService.complete(log.id, {})
    await loadLogs()
  } catch (error) {
    console.error('Failed to complete log:', error)
  }
}

async function deleteLog(log: PrinterMaintenanceLog) {
  if (!confirm(`Are you sure you want to delete this maintenance log?`)) {
    return
  }

  try {
    await PrinterMaintenanceLogService.deleteLog(log.id)
    await loadLogs()
  } catch (error) {
    console.error('Failed to delete log:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.maintenance-logs-container {
  max-width: 100%;
}

.maintenance-logs-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
}

.maintenance-logs-table :deep(.v-data-table__th) {
  font-weight: 600 !important;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>

