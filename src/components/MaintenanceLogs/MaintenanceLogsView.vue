<template>
  <v-container fluid class="pa-0">
    <MaintenanceLogs />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MaintenanceLogs from '@/components/MaintenanceLogs/MaintenanceLogs.vue'

export default defineComponent({
  name: 'MaintenanceLogsView',
  components: { MaintenanceLogs }
})
</script>

