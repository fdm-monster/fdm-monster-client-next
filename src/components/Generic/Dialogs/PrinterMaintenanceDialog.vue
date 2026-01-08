<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="'700px'"
    @escape="closeDialog()"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">
          Mark '{{ printer?.name }}' for maintenance
        </span>
      </v-card-title>
      <v-alert color="secondary">
        Keep this info clear and stick to convention
      </v-alert>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="selectedQuickItems"
              :chips="true"
              :items="quickItems"
              :menu-props="{
                closeOnBack: true,
                closeOnContentClick: true
              }"
              clearable
              color="primary"
              multiple
              placeholder="Quick select reason"
              @update:model-value="updateText()"
            />
            <v-textarea
              v-model="formData.disabledReason"
              data-vv-validate-on="change|blur"
            >
              <template #label>
                <div>Type the reason*</div>
              </template>
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="text-red"> * indicates required field </em>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog()"
        >
          Close
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="submit()"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { PrintersService } from '@/backend'
import { usePrinterStore } from '@/store/printer.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'

const selectedQuickItems = ref([])
const quickItems = [
  'Broken part',
  'Blob',
  'Maxtemp',
  'Preheat error',
  'Cable USB ',
  'Bed thermal runaway',
  'Thermistor Heatbed',
  'Thermistor Heatblock',
  'Thermal Runaway',
  'Mintemp Nozzle',
  'Mintemp Heatbed',
  'Nozzle',
  'Nozzle Clog',
  'Fan Hotend',
  'Fan Part cooling',
  'Extruder rattle',
  'Extruder',
  'Z Axis',
  'X Axis',
  'Y Axis',
  'Rented',
  'Motherboard',
  'Other',
  'Clean'
]
const formData = ref<{
  disabledReason?: string
}>({})
const printersStore = usePrinterStore()
const dialog = useDialog(DialogName.PrinterMaintenanceDialog)
const printer = computed(() => {
  const context = dialog.context()
  return context?.printerId ? printersStore.printer(context.printerId) : undefined
})

const updateText = () => {
  formData.value.disabledReason = selectedQuickItems.value.join(', ')
}

const submit = async () => {
  const printerId = printer.value?.id
  if (!printerId) {
    formData.value = {}
    closeDialog()
    return
  }

  const disabledReason = formData.value.disabledReason
  await PrintersService.updatePrinterMaintenance(printerId, disabledReason)

  formData.value = {}
  closeDialog()
}

const closeDialog = () => {
  selectedQuickItems.value = []
  dialog.closeDialog()
}
</script>
