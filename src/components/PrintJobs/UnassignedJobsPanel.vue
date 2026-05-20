<template>
  <v-card
    v-if="unassignedJobs.length"
    class="ma-4"
    variant="tonal"
    color="warning"
  >
    <v-card-title class="d-flex align-center text-body-1">
      <v-icon class="mr-2">alt_route</v-icon>
      {{ unassignedJobs.length }} file(s) awaiting printer assignment
    </v-card-title>

    <v-list
      bg-color="transparent"
      density="compact"
    >
      <v-list-item
        v-for="job in unassignedJobs"
        :key="job.id"
      >
        <v-list-item-title>{{ job.fileName }}</v-list-item-title>
        <v-list-item-subtitle v-if="routingTargetOf(job)">
          routing target: {{ routingTargetOf(job) }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            prepend-icon="alt_route"
            @click="openRouteDialog(job)"
          >
            Route…
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <RouteJobDialog
      v-model="dialogOpen"
      :job="activeJob"
      @routed="refetch"
    />
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { PrintJobService, type PrintJobDto } from '@/backend/print-job.service'
import RouteJobDialog from '@/components/PrintJobs/RouteJobDialog.vue'

const { data, refetch } = useQuery({
  queryKey: ['unassigned-print-jobs'],
  queryFn: () => PrintJobService.searchJobs(),
  staleTime: 1000 * 15,
  refetchInterval: 1000 * 30
})

// The server creates a printer-less PENDING job for ambiguous/unmatched imports
const unassignedJobs = computed<PrintJobDto[]>(() =>
  (data.value ?? []).filter(
    (job) => job.printerId === null && job.status === 'PENDING'
  )
)

const dialogOpen = ref(false)
const activeJob = ref<PrintJobDto | null>(null)

const routingTargetOf = (job: PrintJobDto) =>
  (job.metadata as { routingTarget?: string } | null)?.routingTarget ?? null

const openRouteDialog = (job: PrintJobDto) => {
  activeJob.value = job
  dialogOpen.value = true
}
</script>
