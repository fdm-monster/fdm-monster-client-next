<template>
  <v-tooltip v-if="hasWebInterface(printer.printerType)" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        color="secondary"
        class="ms-4"
        rounded
        size="small"
        @click.c.capture.native.stop="openPrinterURL()"
      >
        <v-icon>directions</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>Visit printer service</template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from '@/models/printers/printer.model'
import { PrintersService } from '@/backend'
import { hasWebInterface } from '@/shared/printer-capabilities.constants'

const props = defineProps<{
  printer: PrinterDto
}>()

async function openPrinterURL() {
  PrintersService.openPrinterURL(props.printer.printerURL)
}
</script>
