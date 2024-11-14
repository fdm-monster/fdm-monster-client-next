<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <SettingsToolbar
          icon="grid_on"
          title="Grid"
        />

        <GridSettingsList />
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import GridSettingsList from '@/components/Settings/Shared/GridSettingsList.vue'
</script>
