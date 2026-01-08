<template>
  <v-container fluid class="pa-0">
    <PrintJobs />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PrintJobs from '@/components/PrintJobs/PrintJobs.vue'

export default defineComponent({
  name: 'PrintJobsView',
  components: { PrintJobs }
})
</script>
