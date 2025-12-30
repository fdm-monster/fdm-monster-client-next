<template>
  <div class="d-flex align-center ga-1 pa-2 rounded" style="background-color: rgba(255,255,255,0.05)">
    <v-icon size="x-small">table_rows</v-icon>
    <v-btn
      size="x-small"
      icon
      variant="text"
      :disabled="settingsStore.gridRows <= 1"
      @click="decrementGridRows()"
    >
      <v-icon size="small">remove</v-icon>
    </v-btn>
    <span class="text-body-2" style="min-width: 20px; text-align: center">
      {{ settingsStore.gridRows }}
    </span>
    <v-btn
      size="x-small"
      icon
      variant="text"
      :disabled="settingsStore.gridRows >= 16"
      @click="incrementGridRows()"
    >
      <v-icon size="small">add</v-icon>
    </v-btn>

    <v-divider vertical class="mx-1" />

    <v-icon size="x-small">view_column</v-icon>
    <v-btn
      size="x-small"
      icon
      variant="text"
      :disabled="settingsStore.gridCols <= 1"
      @click="decrementGridCols()"
    >
      <v-icon size="small">remove</v-icon>
    </v-btn>
    <span class="text-body-2" style="min-width: 20px; text-align: center">
      {{ settingsStore.gridCols }}
    </span>
    <v-btn
      size="x-small"
      icon
      variant="text"
      :disabled="settingsStore.gridCols >= 12"
      @click="incrementGridCols()"
    >
      <v-icon size="small">add</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store'

const settingsStore = useSettingsStore()

async function incrementGridRows() {
  if (!settingsStore.frontendSettings || settingsStore.frontendSettings.gridRows >= 16) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    gridRows: settingsStore.frontendSettings.gridRows + 1
  })
}

async function decrementGridRows() {
  if (!settingsStore.frontendSettings || settingsStore.frontendSettings.gridRows <= 1) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    gridRows: settingsStore.frontendSettings.gridRows - 1
  })
}

async function incrementGridCols() {
  if (!settingsStore.frontendSettings || settingsStore.frontendSettings.gridCols >= 12) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    gridCols: settingsStore.frontendSettings.gridCols + 1
  })
}

async function decrementGridCols() {
  if (!settingsStore.frontendSettings || settingsStore.frontendSettings.gridCols <= 1) return
  await settingsStore.updateFrontendSettings({
    ...settingsStore.frontendSettings,
    gridCols: settingsStore.frontendSettings.gridCols - 1
  })
}
</script>
