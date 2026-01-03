<template>
  <div>
    <!-- Show empty state when no floors exist -->
    <v-card v-if="!floorStore.floors.length" class="ma-4 pa-8 text-center">
      <v-icon size="80" color="primary" class="mb-4">layers_clear</v-icon>
      <h2 class="text-h5 mb-2">No Floors Yet</h2>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Create your first floor to start organizing your printers in a grid layout.
      </p>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="add"
        @click="createFirstFloor"
      >
        Create First Floor
      </v-btn>
    </v-card>

    <!-- Show normal grid when floors exist -->
    <template v-else>
      <HomeToolbar/>

      <UploadToolbar/>

      <PrinterGrid class="ma-2"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFloorStore } from '@/store/floor.store'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import HomeToolbar from './HomeToolbar.vue'
import UploadToolbar from './UploadToolbar.vue'
import PrinterGrid from './PrinterGrid.vue'

const route = useRoute()
const floorStore = useFloorStore()
const addFloorDialog = useDialog(DialogName.AddOrUpdateFloorDialog)

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

async function createFirstFloor() {
  await addFloorDialog.openDialog()
}
</script>
