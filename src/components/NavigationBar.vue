<template>
  <v-navigation-drawer
    permanent
    rail
  >
    <v-app-bar-nav-icon class="ml-1 mt-2">
      <v-img
        alt="FDM Monster Logo"
        :src="imgLogo"
        class="shrink mr-1 pt-3 ml-1"
        transition="scale-transition"
        width="40"
      />
    </v-app-bar-nav-icon>

    <v-divider />

    <v-list
      density="compact"
      nav
    >
      <v-list-item
        v-for="([icon, title, path], i) in items"
        :key="i"
        :to="path"
        :prepend-icon="icon"
        :title="title"
        density="comfortable"
        router-link
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import imgLogo from '@/assets/logo.png'

const items = [
  ['home', 'Devices', '/'],
  ['print', 'Printers', '/printers'],
  ['camera_alt', 'CameraGridView', '/cameras'],
  ['settings', 'Settings', '/settings'],
  ['timeline', 'PrintStatistics', '/statistics'],
  ['contact_support', 'About', '/about']
]
</script>
