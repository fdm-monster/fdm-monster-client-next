<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      width="800"
    >
      <template #activator="{ props }">
        <v-btn
          :color="activePrintCount ? 'success' : ''"
          variant="tonal"
          v-bind="props"
        >
          <v-icon class="mr-2">work</v-icon>
          Active Jobs ({{ activePrintCount }})
          <v-badge
            v-if="activePrintCount > 0"
            :content="activePrintCount"
            color="success"
            inline
            class="ml-2"
          />
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">work</v-icon>
          Active Print Jobs
          <v-spacer />
          <v-chip size="small" color="success">{{ activePrintCount }}</v-chip>
        </v-card-title>

        <v-card-text class="pa-3">
          <!-- Search -->
          <v-text-field
            v-model="searchString"
            clearable
            label="Search"
            placeholder="Search by filename or printer name..."
            prepend-inner-icon="search"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-3"
          />

          <!-- Filters -->
          <div class="d-flex ga-2 mb-3">
            <PrinterTagFilter
              v-model="selectedTags"
              :tags="tags"
              label="Filter by tags"
              style="flex: 1"
            />
            <PrinterTypeFilter
              v-model="selectedPrinterTypes"
              label="Filter by type"
              style="flex: 1"
            />
          </div>
        </v-card-text>

        <v-divider />

        <v-list style="overflow-y: auto; flex-shrink: 1">
          <v-list-item v-if="!activePrintCount"> No active prints </v-list-item>
          <v-list-item
            v-for="{ printer, job } of activePrintJobs"
            :key="printer.id"
            lines="two"
          >
            <template #prepend>
              <v-avatar size="70">
                <v-progress-circular
                  :model-value="job?.progress?.completion"
                  :width="5"
                  color="green"
                  size="50"
                >
                  {{ truncateProgress(job.progress?.completion) + '%' || '' }}
                </v-progress-circular>
              </v-avatar>
            </template>

            <v-list-item-title>
              {{ job.job?.file?.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              Elapsed:
              {{ Math.round(job?.progress.printTime ?? 0 / 60) }} minutes
              <br />
              Printer: {{ printer.name }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="tonal" @click="menu = false">
            <v-icon class="mr-2">close</v-icon> Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { usePrinterFilters } from '@/shared/printer-filter.composable'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'

const printerStateStore = usePrinterStateStore()
const searchString = ref('')
const menu = ref(false)

const {
  selectedTags,
  selectedPrinterTypes,
  tags,
  loadTags,
  matchesTagFilter,
  matchesPrinterTypeFilter
} = usePrinterFilters()

onMounted(async () => {
  await loadTags()
})

const activePrintJobs = computed(() => {
  return printerStateStore.printersWithJob.filter((p) => {
    // Search filter
    const fileName = p.job?.job?.file.name
    const fileNameSearch = fileName?.toLowerCase() || ''
    const printerUrlSearch = p.printer.printerURL?.toLowerCase() || ''
    const searchSearch = p.printer.name?.toLowerCase() || ''
    const combineSearch = `${fileNameSearch} ${printerUrlSearch} ${searchSearch}`
    const matchesSearch = !searchString.value || combineSearch.includes(searchString.value.toLowerCase())
    const matchesTags = matchesTagFilter(p.printer.id)
    const matchesType = matchesPrinterTypeFilter(p.printer)
    return matchesSearch && matchesTags && matchesType
  })
})

const activePrintCount = computed(() => {
  return activePrintJobs.value.length || 0
})

function truncateProgress(progress: number) {
  if (!progress) return ''
  return progress?.toFixed(0)
}

watch(menu, () => {
  searchString.value = ''
})
</script>
