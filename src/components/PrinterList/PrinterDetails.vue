<template>
  <div
    v-if="printer"
    v-drop-upload="{ printers: [printer] }"
    class="pa-4"
    :style="dragging ? 'background-color: rgba(211, 47, 47, 0.1)' : 'background-color: rgba(0,0,0,0.2)'"
  >
    <v-row>
      <v-col cols="12" md="8">
        <div class="d-flex flex-column ga-2">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">badge</v-icon>
            <span class="text-caption text-medium-emphasis mr-2">Name:</span>
            <span class="font-weight-medium">{{ printer.name }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">link</v-icon>
            <span class="text-caption text-medium-emphasis mr-2">URL:</span>
            <span class="text-caption">{{ printer.printerURL }}</span>
          </div>
          <div class="d-flex align-center flex-wrap ga-2">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">dns</v-icon>
              <span class="text-caption text-medium-emphasis mr-2">Host:</span>
              <v-chip size="x-small" variant="tonal">{{ apiState }}</v-chip>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">hub</v-icon>
              <span class="text-caption text-medium-emphasis mr-2">Connection:</span>
              <v-chip size="x-small" variant="tonal">{{ socketState }}</v-chip>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">print</v-icon>
              <span class="text-caption text-medium-emphasis mr-2">Printer:</span>
              <v-chip size="x-small" variant="tonal">{{ printerTextState }}</v-chip>
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center justify-end">
        <RefreshFilesAction :printer="printer" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { PrinterDto } from '@/models/printers/printer.model'
import RefreshFilesAction from '@/components/Generic/Actions/RefreshFilesAction.vue'
import { usePrinterStateStore } from '@/store/printer-state.store'

const props = defineProps<{
  printer?: PrinterDto
}>()

const printerStateStore = usePrinterStateStore()

const dragging = ref(false)

const printerId = computed(() => props.printer?.id)

const socketState = computed(() => {
  if (!printerId.value) return
  return printerStateStore.socketStatesById[printerId.value]?.socket
})

const apiState = computed(() => {
  if (!printerId.value) return
  return printerStateStore.socketStatesById[printerId.value]?.api
})

const printerTextState = computed(() => {
  if (!printerId.value) return
  return printerStateStore.printerEventsById[printerId.value]?.current
    ?.payload?.state.text
})
</script>
