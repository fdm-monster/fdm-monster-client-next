<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <SettingsToolbar
          icon="grid_on"
          title="Grid"
        />

        <v-list
          subheader
          lines="three"
        >
          <v-list-subheader> Grid Rows and Columns </v-list-subheader>
          <v-list-item v-if="settingsStore.settings?.frontend">
            <v-select
              type="number"
              @change="updateGridSettings"
              :value="settingsStore.gridRows"
              :items="rowOptions"
              label="Set the grid rows"
            />
            <v-select
              type="number"
              @change="updateGridSettings"
              v-model="settingsStore.gridCols"
              :items="colOptions"
              label="Set the grid columns"
            />
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
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store'
import { colOptions, rowOptions } from '@/shared/printer-grid.constants'
import { useSnackbar } from '@/shared/snackbar.composable'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import { computed } from 'vue'

const settingsStore = useSettingsStore()
const snackbar = useSnackbar()

const largeTilesSettings = computed(() => settingsStore.largeTiles)

async function updateGridSettings() {
  console.log(typeof settingsStore.gridCols)
  await settingsStore.updateFrontendSettings({
    gridCols: parseInt(settingsStore.gridCols),
    gridRows: parseInt(settingsStore.gridRows),
    largeTiles: largeTilesSettings.value
  })
  snackbar.info('Grid settings updated')
}
</script>
