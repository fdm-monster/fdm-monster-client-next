<template>
  <v-toolbar flat>
    <v-btn-toggle
      :model-value="selectedFloorToggleIndex"
      class="ml-7"
      mandatory
      rounded
      @update:model-value="changeFloorIndex"
    >
      <v-btn
        v-for="f in floors"
        :key="f.id"
        size="small"
      >
        <v-icon>layers</v-icon>
        {{ f.name }}
      </v-btn>
    </v-btn-toggle>

    <v-btn
      v-if="!printerStore.printers?.length"
      class="mt-0 ml-6"
      color="primary"
      to="/printers"
    >
      You have no printers. Click here to start!
    </v-btn>
    <v-alert
      v-if="floorStore.floorlessPrinters.length"
      class="ml-4"
    >
      <v-icon>warning</v-icon>
      {{ floorStore.floorlessPrinters.length }} unplaced printer(s)!
    </v-alert>
    <v-spacer />
    <span class="d-flex flex-wrap gap-2">
      <span class="pr-2">
        <v-icon>print</v-icon>
        {{ printerStateStore.printingCount }}
      </span>
      <span class="pr-2">
        <v-icon>ac_unit</v-icon>
        {{ printerStateStore.operationalNotPrintingCount }}
      </span>
      <span class="pr-2">
        <v-icon>handyman</v-icon>
        {{ printerStore.maintenanceCount }}
      </span>
      <span class="pr-2">
        <v-icon>usb_off</v-icon>
        {{ printerStore.disconnectedCount }}
      </span>
      <span class="pr-2">
        <v-icon>print_disabled</v-icon>
        {{ printerStore.disabledCount }}
      </span>
    </span>

    <v-btn
      elevation="2"
      small
      class="ml-6"
      icon
      @click="useDialog(DialogName.GridSettingsDialog).openDialog()"
    >
      <v-icon>settings</v-icon>
    </v-btn>

    <div class="ma-4 pt-6">
      <v-switch
        v-model="gridStore.gridEditMode"
        label="Grid Edit Mode"
      />
    </div>
  </v-toolbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePrinterStore } from '@/store/printer.store'
import { useGridStore } from '@/store/grid.store'
import { useFloorStore } from '@/store/floor.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'

const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const gridStore = useGridStore()

const selectedFloorToggleIndex = computed(() => floorStore.selectedFloorIndex)

const floors = computed(() => {
  return floorStore.floors
})

function changeFloorIndex(index: any) {
  floorStore.changeSelectedFloorByIndex(index)
}
</script>
