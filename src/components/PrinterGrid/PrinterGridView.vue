<template>
  <div>
    <HomeToolbar/>

    <UploadToolbar/>

    <PrinterGrid class="ma-2"/>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFloorStore } from '@/store/floor.store'
import HomeToolbar from './HomeToolbar.vue'
import UploadToolbar from './UploadToolbar.vue'
import PrinterGrid from './PrinterGrid.vue'

const route = useRoute()
const floorStore = useFloorStore()

onMounted(() => {
  // Check for floor query parameter
  const floorId = route.query.floor
  if (floorId) {
    const floorIndex = floorStore.floors.findIndex(f => f.id === Number(floorId))
    if (floorIndex >= 0) {
      floorStore.changeSelectedFloorByIndex(floorIndex)
    }
  }
})
</script>
