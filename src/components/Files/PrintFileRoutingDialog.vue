<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card v-if="file">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">alt_route</v-icon>
        Resolve Routing
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

        <div
          v-if="loading"
          class="d-flex justify-center my-4"
        >
          <v-progress-circular indeterminate />
        </div>

        <template v-else-if="resolution">
          <v-alert
            v-if="resolution.kind === 'none'"
            type="warning"
            variant="tonal"
          >
            <template v-if="resolution.routingTarget">
              Routing target "{{ resolution.routingTarget }}" matched no printer
              or tag — assign this file manually.
            </template>
            <template v-else>
              This file has no routing target — assign it to a printer manually.
            </template>
          </v-alert>

          <v-alert
            v-else
            type="info"
            variant="tonal"
          >
            Routing target
            <strong>{{ resolution.routingTarget }}</strong> resolves to
            {{ resolution.kind }}
            <strong>{{ resolution.matchedName }}</strong> ({{
              resolution.printerIds.length
            }}
            printer(s)).
          </v-alert>

          <v-alert
            v-if="resolution.printerIds.length > 1"
            type="info"
            variant="tonal"
            class="mt-3"
          >
            Several printers match — auto-queue is skipped; pick one manually.
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
          Close
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="!canQueue"
          :loading="queuing"
          @click="queueFile"
        >
          Queue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { FileMetadata } from '@/backend/file-storage.service'
import {
  RoutingService,
  type RoutingResolution
} from '@/backend/routing.service'
import { useSnackbar } from '@/shared/snackbar.composable'
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
const invalidateGlobalQueue = useInvalidateGlobalQueue()

const loading = ref(false)
const queuing = ref(false)
const resolution = ref<RoutingResolution | null>(null)

const canQueue = computed(() => resolution.value?.printerIds.length === 1)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen || !props.file) {
      return
    }
    resolution.value = null
    loading.value = true
    try {
      resolution.value = await RoutingService.resolve(props.file.fileStorageId)
    } catch (error) {
      console.error('Failed to resolve routing:', error)
      snackbar.error('Failed to resolve routing')
    } finally {
      loading.value = false
    }
  }
)

const queueFile = async () => {
  if (!props.file) {
    return
  }
  queuing.value = true
  try {
    const result = await RoutingService.queue(props.file.fileStorageId)
    if (result.queued) {
      snackbar.info('File queued via routing')
      await invalidateGlobalQueue()
      emit('queued')
      emit('update:modelValue', false)
    } else {
      snackbar.error('File could not be auto-queued')
    }
  } catch (error) {
    console.error('Failed to queue file:', error)
    snackbar.error('Failed to queue file')
  } finally {
    queuing.value = false
  }
}
</script>
