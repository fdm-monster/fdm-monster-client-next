<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :color="isPrinterInMaintenance(printer) ? 'warning' : 'secondary'"
        class="ms-4"
        size="small"
        rounded
        @click.stop="toggleMaintenance"
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
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { isPrinterInMaintenance } from '@/shared/printer-state.constants'
import { PrinterMaintenanceLogService } from '@/backend/printer-maintenance-log.service'

const props = defineProps<{
  printer: PrinterDto
}>()

async function toggleMaintenance() {
  if (!props.printer) {
    throw new Error('Printer not set, cant toggle maintenance')
  }

  if (props.printer?.disabledReason?.length) {
    const activeLog = await PrinterMaintenanceLogService.getActiveByPrinterId(props.printer.id)
    if (activeLog) {
      await PrinterMaintenanceLogService.complete(activeLog.id, {})
    }
    return
  }

  await useDialog(DialogName.PrinterMaintenanceDialog).openDialog({ printerId: props.printer.id })
}
</script>

