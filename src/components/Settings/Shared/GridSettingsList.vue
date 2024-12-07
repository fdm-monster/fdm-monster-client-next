<template>
  <div>
    <v-card-text>
      <v-list
        subheader
        lines="three"
      >
        <v-list-subheader> Grid Rows and Columns </v-list-subheader>
        <v-list-item v-if="settingsStore.settings?.frontend">
          <v-row>
            <v-col cols="3">
              <v-select
                type="number"
                @update:modelValue="updateGridRows"
                :value="settingsStore.settings.frontend.gridRows"
                :items="rowOptions"
                label="Set the grid rows"
              />
            </v-col>
            <v-col cols="3">
              <v-select
                type="number"
                @update:modelValue="updateGridColumns"
                :value="settingsStore.settings.frontend.gridCols"
                :items="colOptions"
                label="Set the grid columns"
              />
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>

      <v-divider />
      <v-list
        subheader
        lines="three"
      >
        <v-list-subheader> Large or Compact Tiles </v-list-subheader>
        <v-list-item>
          <v-row v-if="settingsStore.settings?.frontend">
            <v-col cols="5">
              <v-checkbox
                @change="updateGridSettings"
                v-model="settingsStore.settings.frontend.largeTiles"
                label="Large tiles"
              />
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>

      <v-divider />
      <v-list
        subheader
        three-line
      >
        <v-list-subheader>Large or Compact Tiles</v-list-subheader>
        <v-list-item>
          <v-row v-if="settingsStore.settings?.frontend">
            <v-col cols="5">
              <v-checkbox
                @change="updateGridSettings"
                v-model="
                  settingsStore.settings.frontend.tilePreferCancelOverQuickStop
                "
                label="Print tile - show cancel instead of quick stop"
              />
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store'
import { colOptions, rowOptions } from '@/shared/printer-grid.constants'
import { useSnackbar } from '@/shared/snackbar.composable'
import { computed } from 'vue'

const settingsStore = useSettingsStore()
const snackbar = useSnackbar()

const largeTilesSettings = computed(() => settingsStore.largeTiles)
const tilePreferCancelOverQuickStop = computed(
  () => settingsStore.preferCancelOverQuickStop
)

async function updateGridColumns(newColumns: number | null) {
  if (!newColumns) return
  return updateGridSettingsInner(newColumns, settingsStore.gridRows)
}

async function updateGridRows(newRows: number | null) {
  if (!newRows) return
  return updateGridSettingsInner(settingsStore.gridCols, newRows)
}

async function updateGridSettings() {
  return updateGridSettingsInner(settingsStore.gridCols, settingsStore.gridRows)
}

async function updateGridSettingsInner(rows: number, columns: number) {
  await settingsStore.updateFrontendSettings({
    gridCols: columns,
    gridRows: rows,
    largeTiles: largeTilesSettings.value,
    tilePreferCancelOverQuickStop: tilePreferCancelOverQuickStop.value
  })
  snackbar.info('Grid settings updated')
}
</script>
