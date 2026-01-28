<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card v-if="file">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">add_to_queue</v-icon>
        Queue File to Printers
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>File:</strong>
          {{ file.metadata?._originalFileName || file.fileName }}
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
          @click="$emit('update:modelValue', false)"
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
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { FileMetadata } from '@/backend/file-storage.service'
import { PrintQueueService } from '@/backend/print-queue.service'
import { PrintJobService } from '@/backend/print-job.service'
import { usePrinterStore } from '@/store/printer.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { getPrinterTypeName } from '@/shared/printer-types.constants'
import { useInvalidateGlobalQueue } from '@/queries/global-queue.query'

interface Props {
  modelValue: boolean
  file: FileMetadata | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'queued'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const snackbar = useSnackbar()
const printerStore = usePrinterStore()
const invalidateGlobalQueue = useInvalidateGlobalQueue()

const selectedPrinters = ref<number[]>([])
const queuing = ref(false)

const availablePrinters = computed(() => {
  return printerStore.printers.filter((p) => p.enabled)
})

// Reset selections when dialog opens with a new file
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      selectedPrinters.value = []
    }
  }
)

const togglePrinterSelection = (printerId: number) => {
  const index = selectedPrinters.value.indexOf(printerId)
  if (index > -1) {
    selectedPrinters.value.splice(index, 1)
  } else {
    selectedPrinters.value.push(printerId)
  }
}

const queueToSelectedPrinters = async () => {
  if (!props.file || selectedPrinters.value.length === 0) {
    return
  }

  queuing.value = true
  let successCount = 0
  let failCount = 0

  try {
    for (const printerId of selectedPrinters.value) {
      try {
        const job = await PrintJobService.createFromFile(
          props.file.fileStorageId,
          printerId
        )

        await PrintQueueService.addToQueue(printerId, job.id)
        successCount++
      } catch (error) {
        console.error(`Failed to queue to printer ${printerId}:`, error)
        failCount++
      }
    }

    if (successCount > 0) {
      snackbar.info(`Queued file to ${successCount} printer(s)`)
      await invalidateGlobalQueue()
      emit('queued')
    }
    if (failCount > 0) {
      snackbar.error(`Failed to queue to ${failCount} printer(s)`)
    }

    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to queue file:', error)
    snackbar.error('Failed to queue file')
  } finally {
    queuing.value = false
  }
}
</script>
