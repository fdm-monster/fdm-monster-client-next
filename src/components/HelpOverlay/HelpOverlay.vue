<template>
  <v-dialog
    v-model="isOpened"
    fullscreen
    eager
    transition="dialog-bottom-transition"
    width="100%"
  >
    <!-- Dialog Activator -->
    <template #activator="{ props: dialogActivatorProps }">
      <v-tooltip location="top">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            variant="tonal"
            class="ml-2 mr-6"
            v-bind="{ ...dialogActivatorProps, ...tooltipProps }"
          >
            <v-icon icon="mdi:mdi-help" class="mr-2"></v-icon>
            help
          </v-btn>
        </template>
        <span> Load the online documentation webpage </span>
      </v-tooltip>
    </template>

    <!-- Content-->
    <template #default="{ isActive }">
      <v-card
        height="100%"
        width="100%"
      >
        <v-toolbar color="primary">
          <v-icon class="ml-5">help</v-icon>
          <h2 class="ml-10">FDM Monster Documentation</h2>
          <v-spacer />
          <span class="mr-10"> docs.fdm-monster.net </span>

          <v-btn
            variant="flat"
            @click="isActive.value = false"
          >
            <v-icon class="mr-2">close</v-icon>
            Close help
          </v-btn>
        </v-toolbar>

        <iframe
          height="100%"
          src="https://docs.fdm-monster.net"
          style="background-color: black; border-width: 0"
          width="100%"
        />
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup lang="ts">
const isOpened = ref(false)
</script>
