<template>
  <v-snackbar
    v-model="snackbarOpened"
    :timeout="progressTimeout"
    location="bottom right"
    class="progress-snackbar"
    color="primary"
    variant="elevated"
    rounded="lg"
    multi-line
    width="450"
    max-width="90vw"
  >
    <div class="d-flex align-start ga-3">
      <v-icon
        color="white"
        size="24"
      >
        upload
      </v-icon>

      <div class="flex-grow-1 min-width-0">
        <div class="text-body-1 font-weight-medium text-white mb-3">
          {{ snackbarTitle }}
        </div>

        <div
          v-for="(progress, index) in progressTracked"
          :key="index"
          class="mb-3"
        >
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon
              color="white"
              size="16"
            >
              {{ progress.completed ? 'check' : progress.timeoutAt ? 'pause' : 'schedule' }}
            </v-icon>
            <span class="text-body-2 text-white">{{ progress.title }}</span>
            <v-spacer />
            <span class="text-body-2 text-white font-weight-bold">
              {{ (progress.completed ? 100 : progress.value).toFixed(1) }}%
            </span>
          </div>
          <v-progress-linear
            :key="progress.key"
            :model-value="progress.completed ? 100 : progress.value"
            :color="progress.timeoutAt ? 'error' : 'success'"
            height="4"
            rounded
            bg-color="rgba(255,255,255,0.3)"
          />
        </div>
      </div>

      <v-btn
        icon="close"
        variant="text"
        color="white"
        size="small"
        class="ml-2"
        @click="snackbarOpened = false"
      />
    </div>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { ProgressMessage, useSnackbar } from '@/shared/snackbar.composable'
import { onMounted, ref } from 'vue'

const snackbar = useSnackbar()
const snackbarOpened = ref(false)
const snackbarTitle = ref('')

// Merged upload progress tracking
interface ProgressTracked {
  value: number
  key: string
  title: string
  completed: boolean
  startedAt: number
  expiresAt: number
  timeoutAt?: number
}

const progressTracked = ref<ProgressTracked[]>([])
const progressTimeout = ref<number>(100)

function getProgressByKey(key: string) {
  return progressTracked.value.find((p) => p.key === key)
}

function addProgressTracker(
  // Tracking key
  key: string,
  title: string,
  value: number = 0,
  completed: boolean = false,
  expiresAt: number = Date.now() + 1500
) {
  console.log(
    `[AppProgressSnackbar] Adding ${key} tracker with progress ${value}`
  )
  progressTracked.value.push({
    key,
    title,
    value,
    completed,
    startedAt: Date.now(),
    expiresAt,
    timeoutAt: undefined
  })
}

function removeProgressTracker(key: string) {
  progressTracked.value = progressTracked.value.filter((p) => p.key !== key)
}

onMounted(() => {
  setInterval(() => {
    if (!progressTracked.value.length) {
      return
    }

    for (const progress of progressTracked.value) {
      const { value, completed, expiresAt, key } = progress
      if ((completed || value >= 100) && expiresAt < Date.now()) {
        removeProgressTracker(key)
      } else if (progress.timeoutAt && progress.timeoutAt < Date.now()) {
        removeProgressTracker(key)
      } else if (!progress.timeoutAt && expiresAt < Date.now()) {
        progress.timeoutAt = Date.now() + 5000
      }
    }
    if (!progressTracked.value.length) {
      // Dwell the notification snackbar for a timeout duration
      progressTimeout.value = 2000
      snackbarTitle.value = 'Upload ended'
      console.debug(
        `[AppSnackbars] Setting timeout to ${progressTimeout.value}`
      )
    } else {
      progressTimeout.value = -1
      snackbarOpened.value = true
    }
  }, 1000)
  snackbar.onProgressMessage((data: ProgressMessage) => {
    const { key, value, title, completed } = data
    const record = getProgressByKey(key)
    if (!record) {
      if (value >= 100) {
        // If the value is above 100, don't consider it (bug/noise)
        return
      }
      addProgressTracker(key, title, value, false, Date.now() + 1500)
    } else if (Math.min(100, value) >= record.value) {
      record.expiresAt = Date.now() + 1500
      record.value = value
      record.completed = completed
    }
    snackbarTitle.value = 'Uploading files'
  })
})
</script>

<style scoped>
.progress-snackbar {
  margin: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.min-width-0 {
  min-width: 0;
}

/* Ensure text doesn't overflow */
.progress-snackbar :deep(.v-snackbar__content) {
  padding: 16px 20px;
}

/* Animation for better UX */
.progress-snackbar :deep(.v-snackbar__wrapper) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>

