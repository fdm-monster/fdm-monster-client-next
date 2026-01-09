<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="'800px'"
    @escape="closeDialog()"
  >
    <v-card>
      <v-card-title class="d-flex align-center py-3 px-4 bg-warning">
        <v-icon class="mr-2" size="large">build_circle</v-icon>
        <div>
          <div class="text-h6">Create Maintenance Log</div>
          <div class="text-caption">{{ printer?.name }}</div>
        </div>
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog()"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- Issue/Cause Section -->
        <div class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon class="mr-1" color="warning">warning</v-icon>
            What's the issue?
          </div>

          <v-select
            v-model="selectedQuickItems"
            :items="quickItems"
            label="Quick select common issues"
            prepend-inner-icon="category"
            variant="outlined"
            density="comfortable"
            multiple
            chips
            closable-chips
            clearable
            hint="Select one or more common issues"
            persistent-hint
            @update:model-value="updateCauseFromSelection()"
          >
            <template #chip="{ item, props }">
              <v-chip
                v-bind="props"
                color="warning"
                variant="tonal"
                size="small"
                closable
              >
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </div>

        <!-- Cause Field -->
        <div class="mb-4">
          <v-textarea
            v-model="formData.cause"
            label="Describe the cause *"
            prepend-inner-icon="description"
            variant="outlined"
            rows="2"
            auto-grow
            placeholder="E.g., Nozzle clogged during print, bed leveling issues"
            hint="Brief description of what caused the maintenance"
            persistent-hint
          />
        </div>

        <v-divider class="my-4" />

        <!-- Parts Section -->
        <div class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon class="mr-1" color="info">build</v-icon>
            Parts Involved
          </div>

          <v-combobox
            v-model="formData.partsInvolved"
            :items="commonParts"
            label="Select or add parts"
            prepend-inner-icon="inventory_2"
            variant="outlined"
            density="comfortable"
            multiple
            chips
            closable-chips
            clearable
            hint="Select from common parts or type to add custom parts"
            persistent-hint
          >
            <template #chip="{ item, props }">
              <v-chip
                v-bind="props"
                color="info"
                variant="tonal"
                size="small"
                closable
              >
                <v-icon start size="x-small">build</v-icon>
                {{ item.title }}
              </v-chip>
            </template>
          </v-combobox>
        </div>

        <v-divider class="my-4" />

        <!-- Additional Notes -->
        <div>
          <div class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon class="mr-1" color="secondary">note</v-icon>
            Additional Notes
          </div>

          <v-textarea
            v-model="formData.notes"
            label="Any additional information"
            prepend-inner-icon="notes"
            variant="outlined"
            rows="3"
            auto-grow
            placeholder="Add any extra details, observations, or steps taken..."
            hint="Optional: Additional context or troubleshooting steps"
            persistent-hint
          />
        </div>

        <!-- Info Card -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <template #prepend>
            <v-icon>info</v-icon>
          </template>
          This will disable the printer and create a maintenance log. The printer will remain disabled until the maintenance is marked as completed.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog()"
        >
          Cancel
        </v-btn>
        <v-btn
          color="warning"
          variant="elevated"
          prepend-icon="build_circle"
          :disabled="!formData.cause"
          @click="submit()"
        >
          Create Maintenance Log
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { PrinterMaintenanceLogService } from '@/backend/printer-maintenance-log.service'
import { usePrinterStore } from '@/store/printer.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'

const selectedQuickItems = ref<string[]>([])
const quickItems = [
  'Nozzle Clog',
  'Bed Leveling',
  'Thermal Runaway',
  'Maxtemp Error',
  'Mintemp Nozzle',
  'Mintemp Heatbed',
  'Preheat Error',
  'Bed Thermal Runaway',
  'Blob',
  'Cable Issue',
  'Fan Failure',
  'Extruder Issue',
  'Axis Problem',
  'Thermistor Fault',
  'Motherboard',
  'Broken Part',
  'Scheduled Maintenance',
  'Cleaning Required',
  'Other'
]

const commonParts = [
  'Nozzle',
  'Hotend',
  'Heatbed',
  'Thermistor (Nozzle)',
  'Thermistor (Heatbed)',
  'Heater Cartridge',
  'Fan (Hotend)',
  'Fan (Part Cooling)',
  'Fan (Board)',
  'Extruder',
  'Bowden Tube',
  'Build Plate',
  'Belt (X-Axis)',
  'Belt (Y-Axis)',
  'Lead Screw',
  'Stepper Motor',
  'Power Supply',
  'Motherboard',
  'LCD Screen',
  'USB Cable',
  'Filament Sensor',
  'BLTouch/Probe',
  'Endstop Switch'
]

const formData = ref<{
  cause?: string
  notes?: string
  partsInvolved?: string[]
}>({
  partsInvolved: []
})

const printersStore = usePrinterStore()
const dialog = useDialog(DialogName.PrinterMaintenanceDialog)
const printer = computed(() => {
  const context = dialog.context()
  return context?.printerId ? printersStore.printer(context.printerId) : undefined
})

const updateCauseFromSelection = () => {
  if (selectedQuickItems.value.length > 0) {
    formData.value.cause = selectedQuickItems.value.join(', ')
  }
}

const submit = async () => {
  const printerId = printer.value?.id
  if (!printerId || !formData.value.cause) {
    return
  }

  await PrinterMaintenanceLogService.create({
    printerId,
    metadata: {
      cause: formData.value.cause,
      notes: formData.value.notes,
      partsInvolved: formData.value.partsInvolved
    }
  })

  // Reset form
  formData.value = { partsInvolved: [] }
  selectedQuickItems.value = []
  closeDialog()
}

const closeDialog = () => {
  selectedQuickItems.value = []
  formData.value = { partsInvolved: [] }
  dialog.closeDialog()
}
</script>

<style scoped>
.bg-warning {
  background-color: rgba(var(--v-theme-warning), 0.1);
}
</style>

