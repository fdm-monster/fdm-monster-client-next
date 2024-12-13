<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-badge
        v-if="printer.enabled"
        class="ma-2"
      >
        <template #badge>
          <v-icon>bolt</v-icon>
        </template>
        <v-btn
          v-bind="props"
          color="secondary"
          size="small"
          rounded
          @click.stop="clickQuickStop"
        >
          <v-icon>dangerous</v-icon>
        </v-btn>
      </v-badge>
    </template>
    <template v-slot:default>Perform quick stop of printer</template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from '@/models/printers/printer.model'
import { CustomGcodeService } from '@/backend/custom-gcode.service'

const props = defineProps<{
  printer: PrinterDto
}>()

async function clickQuickStop() {
  if (!confirm('Are you sure to quick stop this printer?')) return

  await CustomGcodeService.postQuickStopM112Command(props.printer.id)
}
</script>
