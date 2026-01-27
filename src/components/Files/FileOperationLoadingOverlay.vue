<template>
  <v-overlay
    :model-value="isVisible"
    persistent
    class="align-center justify-center"
  >
    <v-card
      class="pa-6"
      min-width="300"
      elevation="8"
    >
      <v-card-text class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
          class="mb-4"
        />
        <div class="text-h6 mb-2">{{ title }}</div>
        <div class="text-body-2 text-medium-emphasis">{{ message }}</div>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script lang="ts" setup>
defineProps<{
  isVisible: boolean
  title: string
  message: string
}>()
</script>
