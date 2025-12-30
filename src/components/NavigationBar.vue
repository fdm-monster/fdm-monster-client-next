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
  ['camera_alt', 'Cameras', '/cameras'],
  ['timeline', 'Print Jobs', '/jobs'],
  ['settings', 'Settings', '/settings'],
  ['contact_support', 'About', '/about']
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
