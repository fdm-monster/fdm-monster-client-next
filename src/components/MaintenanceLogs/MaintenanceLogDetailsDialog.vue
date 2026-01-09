<template>
  <v-dialog
    :model-value="modelValue"
    max-width="800px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card v-if="log">
      <v-card-title class="d-flex align-center py-3 px-4">
        <v-icon class="mr-2" color="primary">info</v-icon>
        <span class="text-h6">Maintenance Log Details</span>
        <v-spacer/>
        <v-btn
          icon="close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-divider/>

      <v-card-text class="py-4">
        <v-row>
          <!-- Status -->
          <v-col cols="12">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Status</div>
            <v-chip
              :color="log.completed ? 'success' : 'warning'"
              :icon="log.completed ? 'check_circle' : 'build'"
              variant="elevated"
            >
              {{ log.completed ? 'Completed' : 'Active' }}
            </v-chip>
          </v-col>

          <!-- Printer Information -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Printer</div>
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-2" color="primary">
                <v-icon>print</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ log.printerName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ getFloorName(log.printerId) }}
                </div>
              </div>
            </div>
          </v-col>

          <!-- Created Information -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Created</div>
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-2" color="secondary">
                <v-icon>person</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ log.createdBy }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatDate(log.createdAt) }}
                </div>
              </div>
            </div>
          </v-col>

          <!-- Completed Information -->
          <v-col v-if="log.completed && log.completedBy" cols="12" md="6">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Completed</div>
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-2" color="secondary">
                <v-icon>person</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ log.completedBy }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatDate(log.completedAt!) }}
                </div>
              </div>
            </div>
          </v-col>

          <!-- Duration -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Duration</div>
            <v-chip
              :color="log.completed ? 'info' : 'warning'"
              prepend-icon="schedule"
              variant="tonal"
            >
              {{ calculateDuration() }}
            </v-chip>
          </v-col>

          <v-col cols="12">
            <v-divider/>
          </v-col>

          <!-- Cause -->
          <v-col cols="12">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Cause</div>
            <v-card variant="tonal" color="warning">
              <v-card-text>
                <div class="text-body-1">
                  {{ log.metadata?.cause || 'No cause specified' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Parts Involved -->
          <v-col v-if="log.metadata?.partsInvolved?.length" cols="12">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Parts Involved</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="(part, index) in log.metadata.partsInvolved"
                :key="index"
                color="info"
                variant="tonal"
              >
                <v-icon start>build</v-icon>
                {{ part }}
              </v-chip>
            </div>
          </v-col>

          <!-- Notes -->
          <v-col v-if="log.metadata?.notes" cols="12">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Notes</div>
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-body-1" style="white-space: pre-wrap;">
                  {{ log.metadata.notes }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Completion Notes -->
          <v-col v-if="log.metadata?.completionNotes" cols="12">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Completion Notes</div>
            <v-card variant="tonal" color="success">
              <v-card-text>
                <div class="text-body-1" style="white-space: pre-wrap;">
                  {{ log.metadata.completionNotes }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider/>

      <v-card-actions class="px-4 py-3">
        <v-spacer/>
        <v-btn
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          v-if="!log.completed"
          color="success"
          variant="elevated"
          prepend-icon="check_circle"
          @click="handleComplete"
        >
          Mark as Completed
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { PrinterMaintenanceLog } from '@/models/printers/printer-maintenance-log.model'
import { PrinterMaintenanceLogService } from '@/backend'
import { useFloorStore } from '@/store/floor.store'
import { formatDate, formatDuration } from '@/utils/date-time.utils'

const floorStore = useFloorStore()

const props = defineProps<{
  modelValue: boolean
  log: PrinterMaintenanceLog | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': []
}>()

function close() {
  emit('update:modelValue', false)
}

function getFloorName(printerId: number | null): string {
  if (!printerId) return 'Unknown'
  const floor = floorStore.floorOfPrinter(printerId)
  return floor?.name || 'No floor assigned'
}

function calculateDuration() {
  if (!props.log) return '-'

  const start = new Date(props.log.createdAt)
  const end = props.log.completedAt ? new Date(props.log.completedAt) : new Date()

  const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
  return formatDuration(diffSeconds)
}

async function handleComplete() {
  if (!props.log) return

  try {
    await PrinterMaintenanceLogService.complete(props.log.id, {})
    emit('updated')
    close()
  } catch (error) {
    console.error('Failed to complete log:', error)
  }
}
</script>

<style scoped>
.v-card-text {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
