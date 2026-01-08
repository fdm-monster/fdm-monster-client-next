<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :color="isPrinterInMaintenance(printer) ? 'warning' : 'default'"
        size="small"
        rounded
        @click.stop="openMaintenanceDialog"
      >
        <v-icon>{{ isPrinterInMaintenance(printer) ? 'build_circle' : 'build' }}</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>
      {{ isPrinterInMaintenance(printer) ? 'Update maintenance' : 'Set maintenance' }}
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from '@/models/printers/printer.model'
import { usePrinterStore } from '@/store/printer.store'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { isPrinterInMaintenance } from '@/shared/printer-state.constants'

const props = defineProps<{
  printer: PrinterDto
}>()

const printerStore = usePrinterStore()

function openMaintenanceDialog() {
  printerStore.setMaintenanceDialogPrinter(props.printer)
  useDialog(DialogName.PrinterMaintenanceDialog).openDialog()
}
</script>

