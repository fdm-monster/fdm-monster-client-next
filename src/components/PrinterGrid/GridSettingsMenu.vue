<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        icon="settings"
      />
    </template>
    <v-card min-width="280">
      <v-card-title class="text-subtitle-1">
        <v-icon class="mr-2" size="small">settings</v-icon>
        Grid Settings
      </v-card-title>
      <v-card-text>
        <v-checkbox
          v-model="largeTilesModel"
          label="Large tiles"
          density="compact"
          hide-details
          @update:model-value="updateLargeTiles"
        />
        <v-checkbox
          v-model="preferCancelModel"
          label="Show cancel instead of quick stop"
          density="compact"
          hide-details
          class="mt-2"
          @update:model-value="updatePreferCancel"
        />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/store/settings.store'

const settingsStore = useSettingsStore()

const largeTilesModel = ref(settingsStore.largeTiles)
const preferCancelModel = ref(settingsStore.preferCancelOverQuickStop)

async function updateLargeTiles(value: boolean | null) {
  if (!settingsStore.frontendSettings) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    largeTiles: value ?? false
  })
}

async function updatePreferCancel(value: boolean | null) {
  if (!settingsStore.frontendSettings) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    tilePreferCancelOverQuickStop: value ?? false
  })
}
</script>
