<template>
  <v-navigation-drawer
    permanent
    rail
  >
    <div class="d-flex justify-center align-center logo-container">
      <v-img
        alt="FDM Monster Logo"
        :src="imgLogo"
        class="logo-image"
        transition="scale-transition"
      />
    </div>

    <v-divider />

    <v-list
      density="compact"
      nav
    >
      <v-tooltip
        v-for="([icon, title, path], i) in items"
        :key="i"
        location="end"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :to="path"
            :prepend-icon="icon"
            density="comfortable"
            router-link
          />
        </template>
        <span>{{ title }}</span>
      </v-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import imgLogo from '@/assets/logo.png'

const items = [
  ['dashboard', 'Dashboard', '/dashboard'],
  ['view_module', 'Printer Grid', '/printer-grid'],
  ['mdi:mdi-printer', 'Printers', '/printer-list'],
  ['mdi:mdi-camera', 'Cameras', '/cameras'],
  ['mdi:mdi-history', 'Print Jobs', '/jobs'],
  ['mdi:mdi-folder', 'Files', '/files'],
  ['mdi:mdi-bug', 'Maintenance', '/maintenance-logs'],
  ['mdi:mdi-cog', 'Settings', '/settings']
]
</script>

<style scoped>
.logo-container {
  height: 64px;
}

.logo-image {
  width: 40px;
  max-width: 40px;
  max-height: 40px;
}
</style>
