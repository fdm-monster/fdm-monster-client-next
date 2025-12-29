<script setup lang="ts">
import GridLoader from "@/components/Generic/Loaders/GridLoader.vue";
import { useOverlayStore } from "@/store/overlay.store";

const appLoaderStore = useOverlayStore();
</script>

<template>
  <div v-if="appLoaderStore.loading" class="d-flex flex-column align-center">
    <GridLoader
      :size="20"
      color="#a70015"
    />
    <div
      class="mt-8"
    >
      {{ appLoaderStore.overlayMessage }}
    </div>
  </div>
</template>

<style scoped>

</style>
