<template>
  <div
    v-if="isFirstTime"
    class="text-center pa-4 clickable-first-time"
    @click.stop="openCreatePrinterDialog()"
  >
    <v-icon size="large" color="primary" class="mb-2">add_circle</v-icon>
    <div class="text-subtitle-2 mb-2">No printers placed</div>
    <div class="text-caption text-medium-emphasis">Click here to add your first printer</div>
  </div>
  <v-btn
    v-else
    class="ma-2"
    color="primary"
    size="small"
    rounded
    @click.capture.stop="openCreatePrinterDialog()"
  >
    <v-icon>add</v-icon>
    New printer
  </v-btn>
</template>

<script lang="ts" setup>
import { DialogName } from '../Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'

const props = defineProps<{
  floorId?: number
  floorX?: number
  floorY?: number
  isFirstTime?: boolean
}>()

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog)

function openCreatePrinterDialog() {
  dialog.openDialog({
    floorId: props.floorId,
    floorX: props.floorX,
    floorY: props.floorY
  })
}
</script>

<style scoped>
.clickable-first-time {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-first-time:hover {
  opacity: 0.8;
}
</style>
