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
      <v-spacer />
      <v-btn
        v-if="someSelected"
        color="warning"
        variant="text"
        size="small"
        prepend-icon="checklist"
        class="mr-1"
        :loading="dismissing"
        @click="openDismissConfirm([...selectedIds])"
      >
        Dismiss selected ({{ selectedIds.size }})
      </v-btn>
      <v-btn
        v-if="unassignedJobs.length > 1"
        color="warning"
        variant="text"
        size="small"
        prepend-icon="delete_sweep"
        :loading="dismissing"
        @click="openDismissConfirm(unassignedJobs.map((j) => j.id))"
      >
        Dismiss all
      </v-btn>
    </v-card-title>

    <v-list
      bg-color="transparent"
      density="compact"
    >
      <v-list-item
        v-for="job in unassignedJobs"
        :key="job.id"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="selectedIds.has(job.id)"
            density="compact"
            @update:model-value="toggleSelect(job.id)"
          />
        </template>
        <v-list-item-title>{{ job.fileName }}</v-list-item-title>
        <v-list-item-subtitle v-if="job.statusReason">
          {{ job.statusReason }}
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else-if="routingTargetOf(job)">
          routing target: {{ routingTargetOf(job) }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            prepend-icon="alt_route"
            class="mr-2"
            @click="openRouteDialog(job)"
          >
            Route…
          </v-btn>
          <v-btn
            icon="close"
            variant="text"
            size="small"
            title="Dismiss"
            :disabled="dismissing"
            @click="dismissJob(job)"
          />
        </template>
      </v-list-item>
    </v-list>

    <RouteJobDialog
      v-model="dialogOpen"
      :job="activeJob"
      @routed="refetch"
    />

    <v-dialog
      v-model="confirmDismissOpen"
      max-width="420"
    >
      <v-card>
        <v-card-title>Dismiss {{ pendingDismissIds.length }} unrouted file(s)?</v-card-title>
        <v-card-text>
          The PENDING job records will be removed. The files stay in storage and
          can still be queued from the Files page.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="confirmDismissOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="dismissing"
            @click="confirmDismiss"
          >
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { PrintJobService, type PrintJobDto } from '@/backend/print-job.service'
import RouteJobDialog from '@/components/PrintJobs/RouteJobDialog.vue'
import { useSnackbar } from '@/shared/snackbar.composable'

const snackbar = useSnackbar()

const { data, refetch } = useQuery({
  queryKey: ['unassigned-print-jobs'],
  queryFn: () => PrintJobService.searchJobs(),
  staleTime: 1000 * 15,
  refetchInterval: 1000 * 30
})

const unassignedJobs = computed<PrintJobDto[]>(() =>
  (data.value ?? []).filter(
    (job) => job.printerId === null && job.status === 'PENDING'
  )
)

const dialogOpen = ref(false)
const activeJob = ref<PrintJobDto | null>(null)
const confirmDismissOpen = ref(false)
const pendingDismissIds = ref<number[]>([])
const dismissing = ref(false)
const selectedIds = ref<Set<number>>(new Set())

const someSelected = computed(() => selectedIds.value.size > 0)

// Drop selections that no longer correspond to a visible unassigned job
watch(unassignedJobs, (jobs) => {
  if (!selectedIds.value.size) return
  const liveIds = new Set(jobs.map((j) => j.id))
  for (const id of selectedIds.value) {
    if (!liveIds.has(id)) selectedIds.value.delete(id)
  }
})

const routingTargetOf = (job: PrintJobDto) =>
  (job.metadata as { routingTarget?: string } | null)?.routingTarget ?? null

const toggleSelect = (id: number) => {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
  // Force reactivity on Set mutations
  selectedIds.value = new Set(selectedIds.value)
}

const openRouteDialog = (job: PrintJobDto) => {
  activeJob.value = job
  dialogOpen.value = true
}

const openDismissConfirm = (ids: number[]) => {
  pendingDismissIds.value = ids
  confirmDismissOpen.value = true
}

const dismissJob = async (job: PrintJobDto) => {
  if (dismissing.value) return
  dismissing.value = true
  try {
    await PrintJobService.deleteJob(job.id)
    snackbar.info('Dismissed')
    await refetch()
  } catch (error) {
    console.error('Failed to dismiss job:', error)
    snackbar.error('Failed to dismiss')
  } finally {
    dismissing.value = false
  }
}

const confirmDismiss = async () => {
  if (dismissing.value || pendingDismissIds.value.length === 0) return
  dismissing.value = true
  const ids = [...pendingDismissIds.value]
  try {
    const results = await Promise.allSettled(
      ids.map((id) => PrintJobService.deleteJob(id))
    )
    const failed = results.filter((r) => r.status === 'rejected').length
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') selectedIds.value.delete(ids[idx])
    })
    selectedIds.value = new Set(selectedIds.value)
    if (failed) {
      snackbar.error(`Dismissed ${ids.length - failed} of ${ids.length} — ${failed} failed`)
    } else {
      snackbar.info(`Dismissed ${ids.length} file(s)`)
    }
    confirmDismissOpen.value = false
    await refetch()
  } catch (error) {
    console.error('Failed to dismiss:', error)
    snackbar.error('Failed to dismiss')
  } finally {
    dismissing.value = false
  }
}
</script>
