<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :disabled="!printer"
        color="secondary"
        rounded
        size="small"
        @click.c.capture.native.stop="openFileExplorer()"
      >
        <v-icon>folder</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>Open file explorer</template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from '@/models/printers/printer.model'
import { useFileExplorer } from '@/shared/file-explorer.composable'

interface Props {
  printer: PrinterDto
}

const props = defineProps<Props>()
const fileExplorer = useFileExplorer()

function openFileExplorer() {
  if (!props.printer) return
  fileExplorer.openFileExplorer(props.printer)
}
</script>
