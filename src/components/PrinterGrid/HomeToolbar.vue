<template>
  <v-toolbar
    flat
    color="surface"
    class="text-on-surface"
  >
    <v-btn
      v-if="!printerStore.printers?.length"
      class="mt-0 ml-6"
      color="primary"
      to="/printers"
    >
      You have no printers. Click here to start!
    </v-btn>

    <!-- Floor selection toggle group -->
    <v-btn-toggle
      :model-value="selectedFloorToggleIndex"
      mandatory
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

    <!-- Tag filter -->
    <v-select
      v-if="groups.length"
      v-model="selectedTags"
      :items="groups"
      item-title="name"
      item-value="id"
      label="Filter by tags"
      multiple
      chips
      closable-chips
      density="compact"
      variant="outlined"
      hide-details
      clearable
      class="ml-4"
      style="max-width: 300px"
      @update:model-value="onTagFilterChange"
    >
      <template v-slot:prepend>
        <v-icon>label</v-icon>
      </template>
    </v-select>

    <!-- Printer type filter -->
    <v-select
      v-model="selectedPrinterTypes"
      :items="printerTypes"
      item-title="name"
      item-value="value"
      label="Filter by type"
      multiple
      chips
      closable-chips
      density="compact"
      variant="outlined"
      hide-details
      clearable
      class="ml-2"
      style="max-width: 300px"
      @update:model-value="onPrinterTypeFilterChange"
    >
      <template v-slot:prepend>
        <v-icon>category</v-icon>
      </template>
    </v-select>

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
      color="secondary"
      size="small"
      class="ml-6"
      icon="settings"
      @click="useDialog(DialogName.GridSettingsDialog).openDialog()"
    />

    <div class="ma-4 pt-6">
      <v-switch
        v-model="gridStore.gridEditMode"
        label="Grid Edit Mode"
      />
    </div>
  </v-toolbar>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { usePrinterStore } from '@/store/printer.store'
import { useGridStore } from '@/store/grid.store'
import { useFloorStore } from '@/store/floor.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'
import { PrinterGroupService, GroupDto } from '@/backend/printer-group.service'

const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const gridStore = useGridStore()

const groups = ref<GroupDto[]>([])
const selectedTags = ref<number[]>([])
const selectedPrinterTypes = ref<number[]>([])

const printerTypes = [
  { name: 'OctoPrint', value: 0 },
  { name: 'Moonraker', value: 1 },
  { name: 'PrusaLink', value: 2 },
  { name: 'Bambu', value: 3 }
]

const selectedFloorToggleIndex = computed(() => floorStore.selectedFloorIndex)

const floors = computed(() => {
  return floorStore.floors
})

onMounted(async () => {
  const groupsWithPrinters = await PrinterGroupService.getGroupsWithPrinters()
  groups.value = groupsWithPrinters.map(g => ({ id: g.id, name: g.name }))
})

function changeFloorIndex(index: any) {
  floorStore.changeSelectedFloorByIndex(index)
}

function onTagFilterChange(tagIds: number[]) {
  gridStore.setTagFilter(tagIds)
}

function onPrinterTypeFilterChange(typeIds: number[]) {
  gridStore.setPrinterTypeFilter(typeIds)
}
</script>
