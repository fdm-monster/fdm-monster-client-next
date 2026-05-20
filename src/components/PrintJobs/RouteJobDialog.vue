<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card v-if="job">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">alt_route</v-icon>
        Route to printer
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>File:</strong> {{ job.fileName }}
        </div>

        <div
          v-if="loading"
          class="d-flex justify-center my-4"
        >
          <v-progress-circular indeterminate />
        </div>

        <template v-else>
          <v-alert
            v-if="resolution && resolution.kind === 'tag'"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Targets tag <strong>{{ resolution.matchedName }}</strong> — pick one
            of its {{ candidatePrinters.length }} printer(s) to queue it on.
          </v-alert>
          <v-alert
            v-else-if="resolution && resolution.kind === 'ambiguous'"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <strong>{{ resolution.routingTarget }}</strong> matches both a printer
            and a tag — pick the printer you want to queue it on.
          </v-alert>
          <v-alert
            v-else
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            No matching routing target — pick any printer to queue it on.
          </v-alert>

          <v-radio-group
            v-if="candidatePrinters.length"
            v-model="selectedPrinterId"
            hide-details
          >
            <v-radio
              v-for="printer in candidatePrinters"
              :key="printer.id"
              :label="printer.name"
              :value="printer.id"
            />
          </v-radio-group>
          <v-alert
            v-else
            type="error"
            variant="tonal"
          >
            No printers available to route to.
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="selectedPrinterId === null"
          :loading="routing"
          @click="routeJob"
        >
          Route
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import {
  RoutingService,
  type RoutingResolution
} from '@/backend/routing.service'
import { PrintQueueService } from '@/backend/print-queue.service'
import type { PrintJobDto } from '@/backend/print-job.service'
import { usePrinterStore } from '@/store/printer.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useInvalidateGlobalQueue } from '@/queries/global-queue.query'

interface Props {
  modelValue: boolean
  job: PrintJobDto | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'routed'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const printerStore = usePrinterStore()
const snackbar = useSnackbar()
const invalidateGlobalQueue = useInvalidateGlobalQueue()

const loading = ref(false)
const routing = ref(false)
const resolution = ref<RoutingResolution | null>(null)
const selectedPrinterId = ref<number | null>(null)

// A tag resolves to its member printers; an unmatched file can go anywhere
const candidatePrinters = computed(() => {
  const ids = resolution.value?.printerIds ?? []
  const pool = ids.length
    ? printerStore.printers.filter((p) => ids.includes(p.id))
    : printerStore.printers
  return pool.map((p) => ({ id: p.id, name: p.name || `Printer #${p.id}` }))
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen || !props.job) {
      return
    }
    resolution.value = null
    selectedPrinterId.value = null
    if (!props.job.fileStorageId) {
      return
    }
    loading.value = true
    try {
      resolution.value = await RoutingService.resolve(props.job.fileStorageId)
    } catch (error) {
      console.error('Failed to resolve routing:', error)
      snackbar.error('Failed to resolve routing')
    } finally {
      loading.value = false
    }
  }
)

const routeJob = async () => {
  if (!props.job || selectedPrinterId.value === null) {
    return
  }
  routing.value = true
  try {
    await PrintQueueService.addToQueue(selectedPrinterId.value, props.job.id)
    snackbar.info('File routed and queued')
    await invalidateGlobalQueue()
    emit('routed')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to route job:', error)
    snackbar.error('Failed to route job to printer')
  } finally {
    routing.value = false
  }
}
</script>
