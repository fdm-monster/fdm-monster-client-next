<template>
  <v-container fluid class="pa-0">
    <UnassignedJobsPanel />
    <PrintJobs />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PrintJobs from '@/components/PrintJobs/PrintJobs.vue'
import UnassignedJobsPanel from '@/components/PrintJobs/UnassignedJobsPanel.vue'

export default defineComponent({
  name: 'PrintJobsView',
  components: { PrintJobs, UnassignedJobsPanel }
})
</script>
