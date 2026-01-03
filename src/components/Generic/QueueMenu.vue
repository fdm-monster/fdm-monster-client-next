<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      width="600"
    >
      <template #activator="{ props }">
        <v-btn
          :color="queueCount ? 'primary' : ''"
          variant="tonal"
          class="mr-2"
          v-bind="props"
        >
          <v-icon class="mr-2">queue</v-icon>
          Queue ({{ queueCount }})
          <v-badge
            v-if="queueCount > 0"
            :content="queueCount"
            color="primary"
            inline
            class="ml-2"
          />
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">queue</v-icon>
          Print Queue - Global Plate View
          <v-spacer />
          <v-chip size="small" color="primary">{{ totalPlates }} Plates</v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="text-body-2 mt-4">Loading queue...</p>
        </v-card-text>

        <v-card-text v-else-if="error" class="text-center py-8">
          <v-icon size="64" color="error" class="mb-4">error</v-icon>
          <h3 class="text-h6 mb-2">Failed to Load Queue</h3>
          <p class="text-body-2 text-medium-emphasis">{{ error }}</p>
        </v-card-text>

        <v-card-text v-else-if="queueCount === 0" class="text-center py-8">
          <v-icon size="64" color="surface-variant" class="mb-4">inbox</v-icon>
          <h3 class="text-h6 mb-2">Queue is Empty</h3>
          <p class="text-body-2 text-medium-emphasis">
            No jobs are currently queued for printing.
          </p>
        </v-card-text>

        <v-list v-else class="queue-list" style="max-height: 400px; overflow-y: auto">
          <v-list-item
            v-for="plate in plates"
            :key="plate.jobId"
            lines="two"
          >
            <template #prepend>
              <v-avatar color="primary" size="48">
                <strong>{{ plate.skuCount }}</strong>
              </v-avatar>
            </template>

            <v-list-item-title>
              {{ plate.fileName }}
            </v-list-item-title>

            <v-list-item-subtitle>
              SKU Count: {{ plate.skuCount }} | Queued: {{ plate.totalQueued }}x
              <br />
              <span class="text-caption">
                Printers: {{ plate.printers.map(p => p.printerName).join(', ') }}
              </span>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center ga-2">
                <v-chip size="small" color="info">
                  {{ plate.totalQueued }}
                </v-chip>

                <!-- Submit button with printer selection -->
                <v-menu v-if="plate.printers.length > 0">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="small"
                      icon
                      variant="tonal"
                      color="success"
                    >
                      <v-icon>play_arrow</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="200">
                    <v-list-subheader>Submit to Printer</v-list-subheader>
                    <v-list-item
                      v-for="printer in plate.printers"
                      :key="printer.printerId"
                      @click="submitJobToPrinter(plate.jobId, printer.printerId)"
                    >
                      <template #prepend>
                        <v-icon size="small">print</v-icon>
                      </template>
                      <v-list-item-title>{{ printer.printerName }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-divider v-if="queueCount > 0" />

        <v-card-actions>
          <v-chip size="small" variant="text">
            <v-icon size="small" class="mr-1">inventory</v-icon>
            {{ totalJobs }} total jobs
          </v-chip>
          <v-spacer />
          <v-btn
            variant="text"
            @click="menu = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGlobalQueueQuery } from '@/queries/global-queue.query'
import { PrintQueueService } from '@/backend/print-queue.service'
import { useSnackbar } from '@/shared/snackbar.composable'

const menu = ref(false)
const snackbar = useSnackbar()

const { data: queueData, isLoading, error: queryError, refetch } = useGlobalQueueQuery()

const queueCount = computed(() => queueData.value?.totalJobs || 0)
const totalPlates = computed(() => queueData.value?.totalPlates || 0)
const totalJobs = computed(() => queueData.value?.totalJobs || 0)
const plates = computed(() => queueData.value?.plates || [])
const error = computed(() => queryError.value?.message || null)

const submitJobToPrinter = async (jobId: number, printerId: number) => {
  try {
    await PrintQueueService.submitToPrinter(jobId, printerId)
    snackbar.info('Job submitted to printer')
    await refetch()
  } catch (err) {
    console.error('Failed to submit job:', err)
    snackbar.error('Failed to submit job to printer')
  }
}
</script>

<style scoped>
.queue-list :deep(.v-list-item) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.queue-list :deep(.v-list-item:last-child) {
  border-bottom: none;
}
</style>
